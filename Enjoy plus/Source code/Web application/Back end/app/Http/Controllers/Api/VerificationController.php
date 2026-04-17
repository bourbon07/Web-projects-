<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use App\Mail\GoogleAccountReminderMail;

class VerificationController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'هذا البريد غير مسجل لدينا.', 'message_en' => 'User not found. Check your email.'], 404);
        }

        if ($user->google_id) {
            try {
                Mail::to($user->email)->send(new GoogleAccountReminderMail());
            } catch (\Exception $e) {
                Log::error("Failed to send Google reminder to {$user->email}: " . $e->getMessage());
            }

            return response()->json([
                'status' => 'google_managed',
                'message' => 'حسابك مدار عبر تسجيل الدخول باستخدام جوجل. لقد أرسلنا لك بريداً إلكترونياً يحتوي على رابط تسجيل الدخول المباشر.',
                'message_en' => 'Your account is managed via Google Login. We sent you an email with a direct login link.',
            ], 422);
        }

        // Generate Token (expires in 15 mins)
        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email' => $user->email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Send the real email
        try {
            Mail::to($user->email)->send(new ResetPasswordMail($token, $user->email));
            
            return response()->json([
                'status' => 'success',
                'message' => 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
                'message_en' => 'Password reset link has been sent to your email.'
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send reset email to {$user->email}: " . $e->getMessage());
            return response()->json([
                'message' => 'فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.',
                'message_en' => 'Failed to send email. Please try again later.'
            ], 500);
        }
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed'
        ]);

        /** @var object $record */
        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json(['message' => 'الرمز غير صالح أو انتهت صلاحيته.', 'message_en' => 'Invalid or expired token.'], 400);
        }

        // Check Expiry (15 mins)
        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'انتهت صلاحية الرمز.', 'message_en' => 'Token has expired.'], 400);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'الرمز غير صالح.', 'message_en' => 'Invalid token.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'تم إعادة تعيين كلمة المرور بنجاح.', 'message_en' => 'Password reset successfully.']);
    }
}
