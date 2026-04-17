<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Any authenticated user
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20|regex:/^([0-9\s\-\+\(\)]*)$/|min:8',
            'address' => 'required|string',
            'payment_method' => 'required|in:Cash,Visa,PayPal,Zain Cash',
            'delivery_fee' => 'nullable|numeric|min:0',
            'service_fee' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required_without:items.*.package_id|exists:products,id',
            'items.*.package_id' => 'required_without:items.*.product_id|exists:packages,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];
    }
}
