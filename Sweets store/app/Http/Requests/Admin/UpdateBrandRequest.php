<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name' => 'sometimes|string|max:255|unique:brands,name,'.$id,
            'logo' => 'nullable|image|max:2048',
            'description' => 'nullable|string'
        ];
    }
}
