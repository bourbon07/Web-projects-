<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $item = $this->product ?: $this->package;

        return [
            'id' => $this->id,
            'quantity' => (int)$this->quantity,
            'price' => (float)$this->price_at_purchase,
            'name' => $item ? [
                'ar' => $item->name_ar ?? 'منتج غير متوفر',
                'en' => $item->name_en ?? 'Product Unavailable',
            ] : [
                'ar' => 'منتج غير متوفر',
                'en' => 'Product Unavailable',
            ],
            'image_url' => $item ? $item->image : '',
            'brand' => $this->product ? ($this->product->brand?->name_en ?? 'Enjoy Plus') : 'Bundle',
            'is_package' => (bool)$this->package_id,
            'product_id' => $this->product_id,
            'package_id' => $this->package_id,
        ];
    }
}
