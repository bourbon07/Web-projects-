<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id', // Keep for backward compatibility
            'category_ids' => 'nullable|array', // New: multiple categories
            'category_ids.*' => 'exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'image_url' => 'nullable|url|max:2048',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'nullable|url|max:2048',
        ];
    }
}
