<x-mail::message>
# {{ __('إعادة تعيين كلمة المرور') }}

{{ __('لقد تلقيت هذا البريد لأننا تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.') }}

<x-mail::button :url="config('app.url') . '/reset-password?token=' . $token . '&email=' . urlencode($email)">
{{ __('إعادة تعيين كلمة المرور') }}
</x-mail::button>

{{ __('إذا لم تطلب إعادة تعيين كلمة المرور، فلا داعي لاتخاذ أي إجراء آخر.') }}

{{ __('شكراً،') }}<br>
{{ config('app.name') }}
</x-mail::message>
