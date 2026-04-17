<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'email' => 'required|email|string',
            'password' => 'required|string',
        ];

        // Secret code required for admin, optional for others
        if ($this->has('role') && $this->role === 'admin') {
            $rules['secret_code'] = 'required|string';
        } else {
            $rules['secret_code'] = 'nullable|string';
        }

        return $rules;
    }
}
