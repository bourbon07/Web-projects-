<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BanUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->email === 'admin@enjoyplus.com';
    }

    public function rules(): array
    {
        return [
            // No strict input body usually needed for IDs passed in URL, 
            // but we can enforce business logic here if needed.
        ];
    }
}
