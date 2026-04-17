<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\AdminCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Admin Registration/Login Flow:
     * 1. User registers as admin with code 7986 -> becomes super admin
     * 2. Super admin can login with code 7986 and manage admin codes
     * 3. Super admin can create new admin codes (via AdminController)
     * 4. Other users can register as admin using codes created by super admin
     * 
     * Note: Each admin code can only be used by ONE user at a time
     */

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        // Check if email is blocked
        try {
            $isBlocked = DB::table('blocked_emails')->where('email', $data['email'])->exists();
        if ($isBlocked) {
            return response()->json([
                'message' => 'This email has been blocked. You cannot create an account with this email.'
            ], 403);
            }
        } catch (\Exception $e) {
            // If blocked_emails table doesn't exist, log and continue
            Log::warning('blocked_emails table check failed: ' . $e->getMessage());
        }

        // Validate secret code for admin or if super admin code (7986) is used
        $providedCode = $data['secret_code'] ?? '';
        if ($data['role'] === 'admin' || $providedCode === '7986') {
            $this->validateSecretCode($data['role'], $providedCode);
            
            // If super admin code is used, ensure role is customer as per user request
            // but the frontend will see it as admin role to open the admin page
            if ($providedCode === '7986') {
                $data['role'] = 'customer';
            }
        }

        // Set default bio based on role
        $defaultBio = match($data['role']) {
            'customer' => 'customer, buy items',
            'admin' => 'admin, manage platform',
            default => null,
        };

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'secret_code' => $data['secret_code'] ?? null,
            'bio' => $defaultBio,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Prepare user data for response - spoof role as admin if super admin code is used
        // to ensure the frontend opens the admin page
        $userData = $user->toArray();
        if ($user->secret_code === '7986') {
            $userData['role'] = 'admin';
        }

        return response()->json([
            'message' => 'User registered successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $userData
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is blocked
        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been blocked.'],
            ]);
        }

        // Validate secret code for admin login or if super admin code is provided
        $providedCode = $data['secret_code'] ?? '';
        if ($user->role === 'admin' || $providedCode === '7986') {
            if (empty($providedCode)) {
                throw ValidationException::withMessages([
                    'secret_code' => ['Secret code is required for admin login.'],
                ]);
            }

            // Check against AdminCode table
            try {
                $adminCode = AdminCode::where('code', $providedCode)
                    ->where('is_active', true)
                    ->first();
                
                // For super admin code 7986, we allow it even if user role is customer
                // For other codes, they must match the user's stored secret_code
                if (!$adminCode || ($user->secret_code !== $providedCode && $providedCode !== '7986')) {
                    throw ValidationException::withMessages([
                        'secret_code' => ['Invalid secret code.'],
                    ]);
                }
            } catch (\Exception $e) {
                // Fallback: check if admin_codes table exists
                if (!Schema::hasTable('admin_codes')) {
                    throw ValidationException::withMessages([
                        'secret_code' => ['Admin codes system is not configured. Please contact administrator.'],
                    ]);
                }
                throw ValidationException::withMessages([
                    'secret_code' => ['Invalid secret code.'],
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Make secret_code visible for the current user
        $user->makeVisible(['secret_code']);

        // Prepare user data for response - spoof role as admin if super admin code is used
        // to ensure the frontend opens the admin page
        $userData = $user->toArray();
        if ($user->secret_code === '7986') {
            $userData['role'] = 'admin';
        }

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $userData
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function redirectToGoogle()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl()
        ]);
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Authentication failed'], 422);
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'password' => bcrypt(uniqid()),
                'role' => 'customer', // Default role for Google login
                'bio' => 'customer, buy items', // Default bio for customers
            ]
        );

        if ($user->is_blocked) {
            return response()->json(['message' => 'Your account has been blocked.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    private function validateSecretCode(string $role, string $code): void
    {
            $codeLength = 4;
            
            // Check code format
            if (strlen($code) !== $codeLength || !is_numeric($code)) {
                throw ValidationException::withMessages([
                    'secret_code' => ["Invalid admin secret code format. Must be {$codeLength} digits."],
                ]);
            }

        // Check if admin_codes table exists
        if (!Schema::hasTable('admin_codes')) {
            throw ValidationException::withMessages([
                'secret_code' => ['Admin codes system is not configured. Please contact administrator.'],
            ]);
        }

        // Special handling for super admin code (7986)
        $isSuperAdminCode = $code === '7986';
        
        // Check if code exists in AdminCode table (check without is_active first for 7986)
        try {
            // For super admin code, check if it exists first (regardless of is_active)
            if ($isSuperAdminCode) {
                $adminCode = AdminCode::where('code', '7986')->first();
                
                // If it doesn't exist, create it
                if (!$adminCode) {
                    $hasSuperAdminColumn = Schema::hasColumn('admin_codes', 'super_admin');
                    
                    $attributes = [
                        'code' => '7986',
                        'is_active' => true
                    ];
                    if ($hasSuperAdminColumn) {
                        $attributes['super_admin'] = true;
                    }
                    
                    try {
                        $adminCode = AdminCode::create($attributes);
                        Log::info('Super admin code (7986) auto-created during registration', [
                            'code' => $code,
                            'has_super_admin_column' => $hasSuperAdminColumn
                        ]);
                    } catch (\Exception $e) {
                        // If creation fails, try to fetch it again (race condition)
                        $adminCode = AdminCode::where('code', '7986')->first();
                        if (!$adminCode) {
                            Log::error('Failed to create super admin code (7986)', [
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString()
                            ]);
                            throw ValidationException::withMessages([
                                'secret_code' => ['Failed to create super admin code. Please contact administrator.'],
                            ]);
                        }
                    }
                }
                
                // Ensure 7986 is always active and marked as super admin
                $hasSuperAdminColumn = Schema::hasColumn('admin_codes', 'super_admin');
                $needsUpdate = false;
                $updateData = [];
                
                if (!$adminCode->is_active) {
                    $updateData['is_active'] = true;
                    $needsUpdate = true;
                }
                
                if ($hasSuperAdminColumn && !$adminCode->super_admin) {
                    $updateData['super_admin'] = true;
                    $needsUpdate = true;
                }
                
                if ($needsUpdate) {
                    try {
                        $adminCode->update($updateData);
                        $adminCode->refresh(); // Refresh to get updated values
                        Log::info('Super admin code (7986) updated', [
                            'updates' => $updateData
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to update super admin code (7986)', [
                            'error' => $e->getMessage(),
                            'update_data' => $updateData
                        ]);
                        // Continue anyway - the code exists, just might not be updated
                    }
                }
                
                // Verify it's active after update
                if (!$adminCode->is_active) {
                    Log::error('Super admin code (7986) is not active after update attempt');
                    throw ValidationException::withMessages([
                        'secret_code' => ['Super admin code is not active. Please contact administrator.'],
                    ]);
                }
            } else {
                // For regular admin codes, check if exists and is active
                $adminCode = AdminCode::where('code', $code)
                ->where('is_active', true)
                ->first();
            
            if (!$adminCode) {
                throw ValidationException::withMessages([
                    'secret_code' => ["Invalid admin secret code."],
                ]);
                }
            }

            // Check if code is already used by another user
            // Note: Each admin code can only be used by ONE admin user
            // Super admin (7986) can be used by multiple users to allow "sign in as customer" but "open as admin page"
            $existingUser = User::where('secret_code', $code)
                ->where('role', 'admin')
                ->first();
            
            if ($existingUser && $code !== '7986') {
                throw ValidationException::withMessages([
                    'secret_code' => ["This admin secret code is already in use by another admin."],
                ]);
            }
            
            // Final verification: ensure adminCode exists and is active
            if (!$adminCode || !$adminCode->is_active) {
                Log::error('Admin code validation failed - code not found or inactive', [
                    'code' => $code,
                    'is_super_admin_code' => $isSuperAdminCode,
                    'admin_code_exists' => $adminCode !== null,
                    'admin_code_active' => $adminCode ? $adminCode->is_active : false
                ]);
                
                throw ValidationException::withMessages([
                    'secret_code' => ["Invalid admin secret code."],
                ]);
            }

        } catch (ValidationException $e) {
            // Re-throw validation exceptions as-is
            throw $e;
        } catch (\Exception $e) {
            // Log the full error for debugging
            Log::error('Error validating admin secret code', [
                'code' => $code,
                'is_super_admin_code' => $isSuperAdminCode,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // For super admin code, provide more helpful error message
            if ($isSuperAdminCode) {
                throw ValidationException::withMessages([
                    'secret_code' => ['Failed to validate super admin code. Please ensure the admin_codes table exists and run migrations.'],
                ]);
            }
            
            throw ValidationException::withMessages([
                'secret_code' => ["Invalid admin secret code."],
            ]);
        }
    }
}
