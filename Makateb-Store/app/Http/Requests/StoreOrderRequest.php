<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name'     => 'required|string|max:255',
            'customer_phone'    => 'required|string|max:20',
            'customer_email'    => 'required|email|max:255',
            'delivery_location' => 'required|string|max:255',
            'payment_method'    => 'required|string|in:credit_card,paypal,cash_on_delivery',
            'fee_location'      => 'nullable|string|max:255',
            'items'             => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.package_id' => 'nullable|exists:packages,id',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.selected_options' => 'nullable|array',
        ];
    }
}
