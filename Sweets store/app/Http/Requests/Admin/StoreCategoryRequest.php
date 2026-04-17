<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name_en' => 'required|string|max:255|unique:categories,name_en',
            'name_ar' => 'required|string|max:255|unique:categories,name_ar',
            'icon' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
        ];
    }
}
