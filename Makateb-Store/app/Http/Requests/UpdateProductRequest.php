<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'category_id' => 'nullable|exists:categories,id', // Keep for backward compatibility
            'category_ids' => 'nullable|array', // New: multiple categories
            'category_ids.*' => 'exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
            'image_url' => 'nullable|url',
            'image_urls' => 'nullable|array',
        ];
    }
}
