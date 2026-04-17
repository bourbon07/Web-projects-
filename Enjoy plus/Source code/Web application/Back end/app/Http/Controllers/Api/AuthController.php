<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'age'      => $validated['age'] ?? null,
            'gender'   => $validated['gender'] ?? null,
            'phone'    => $validated['phone'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user)
        ]);
    }

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'Your account has been banned.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user)
        ]);
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            // Using a mockable interface if necessary, but here we expect the user token
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->google_token);
            
            // 1. Try to find user by google_id
            $user = User::where('google_id', $googleUser->getId())->first();
            
            if (!$user) {
                // 2. Try to find user by email to LINK account
                $user = User::where('email', $googleUser->getEmail())->first();
                
                if ($user) {
                    // LINK Google ID to existing account
                    $user->google_id = $googleUser->getId();
                    $user->save();
                } else {
                    // 3. Register a NEW user
                    $user = User::create([
                        'email' => $googleUser->getEmail(),
                        'name' => $googleUser->getName(),
                        'google_id' => $googleUser->getId(),
                        // A secure random password for the dummy field
                        'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
                        'password_set' => false,
                    ]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => new UserResource($user)
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized or link failed', 'msg' => $e->getMessage()], 401);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out smoothly']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $rules = [
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|max:255|unique:users,email,' . $user->id,
            'avatar'           => 'nullable|string',
            'phone'            => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            'age'              => 'nullable|integer',
            'gender'           => 'nullable|string|in:male,female,Male,Female',
            'current_password' => 'nullable|required_with:new_password',
            'new_password'     => 'nullable|string|min:6|confirmed',
        ];

        $customMessages = [
            'phone.unique' => 'This phone number is already linked to another account.',
            'email.unique' => 'This email is already in use by another account.',
        ];

        $validated = $request->validate($rules, $customMessages);

        // Handle password change
        if ($request->filled('new_password')) {
            // Google users who haven't set a password yet can skip current_password
            if ($user->password_set) {
                if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'message' => 'The current password you entered is incorrect.'
                    ], 422);
                }
            }
            
            $user->password = $request->new_password;
            $user->password_set = true;
        }

        // Update other fields
        $user->fill($request->only(['name', 'email', 'avatar', 'phone', 'age', 'gender']));
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user)
        ]);
    }
}
