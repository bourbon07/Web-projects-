<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'age'      => 'nullable|integer|min:1',
            'gender'   => 'nullable|in:male,female',
            'phone'    => 'nullable|string|max:20|unique:users,phone',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => __('validation.required', ['attribute' => __('fields.name')]),
            'email.unique'   => __('validation.unique', ['attribute' => __('fields.email')]),
            'password.min'   => __('validation.min.string', ['attribute' => __('fields.password'), 'min' => 8]),
            'phone.unique'   => 'This phone number is already linked to another account.',
        ];
    }
}
