<?php

namespace App\Http\Requests\Products;

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
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description_en' => 'required|string',
            'description_ar' => 'required|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|url',
        ];
    }

    public function messages(): array
    {
        return [
            'name_en.required' => 'The product name in English is required.',
            'name_ar.required' => 'اسم المنتج باللغة العربية مطلوب.',
            'description_ar.required' => 'وصف المنتج باللغة العربية مطلوب.',
        ];
    }
}
