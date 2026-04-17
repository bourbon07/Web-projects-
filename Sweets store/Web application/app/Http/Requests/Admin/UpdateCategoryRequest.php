<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name_en' => 'sometimes|string|max:255|unique:categories,name_en,'.$id,
            'name_ar' => 'sometimes|string|max:255|unique:categories,name_ar,'.$id,
            'icon' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
        ];
    }
}
