<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
        'id' => $this->id,
        'customer_name' => $this->customer_name,
        'customer_phone' => $this->customer_phone,
        'customer_email' => $this->customer_email,
        'total_price' => (float)$this->total_price,
        'status' => $this->status,
        'payment_method' => $this->payment_method,
        'payment_status' => $this->payment_status,
        'delivery_location' => $this->delivery_location,
        'user' => $this->whenLoaded('user'),
        'items' => OrderItemResource::collection($this->whenLoaded('items')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
    }
}
