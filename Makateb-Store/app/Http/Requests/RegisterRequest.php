<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|string|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => ['required', Rule::in(['customer', 'admin'])],
        ];

        // Secret code required for admin, optional for others
        if ($this->role === 'admin') {
            $rules['secret_code'] = 'required|string';
        } else {
            $rules['secret_code'] = 'nullable|string';
        }

        return $rules;
    }
}
