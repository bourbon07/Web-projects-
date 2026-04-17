<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'product_id'   => $this->product_id,
            'package_id'   => $this->package_id,
            'qty'          => $this->qty,
            'price_at_order' => (float) $this->price_at_order,
            'selected_options' => $this->selected_options,
            'product'      => $this->product ? [
                'id'         => $this->product->id,
                'name'       => $this->product->name,
                'slug'       => $this->product->slug,
                'price'      => (float) $this->product->price,
                'image_url'  => $this->product->image_url,
                'stock'      => $this->product->stock,
            ] : null,
            'package'      => $this->package ? [
                'id'         => $this->package->id,
                'name'       => $this->package->name,
                'price'      => (float) $this->package->price,
                'image_url'  => $this->package->image_url,
                'stock'      => $this->package->stock,
                'products'   => $this->package->products,
            ] : null,
        ];
    }
}
