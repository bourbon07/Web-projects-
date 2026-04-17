<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'customer_name' => $this->customer_name ?? ($this->user ? $this->user->name : 'Guest'),
            'customer_email' => $this->customer_email ?? ($this->user ? $this->user->email : null),
            'customer_phone' => $this->customer_phone ?? ($this->user ? $this->user->phone : null),
            'user_phone' => $this->whenLoaded('user', fn() => $this->user?->phone),
            'user_email' => $this->whenLoaded('user', fn() => $this->user?->email),
            'shipping_address' => $this->shipping_address,
            'status' => $this->status,
            'total_price' => (float)$this->total_price,
            'delivery_fee' => (float)$this->delivery_fee,
            'service_fee' => (float)$this->service_fee,
            'payment_method' => $this->payment_method,
            'payment_details' => $this->payment_details,
            'created_at' => $this->created_at,
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
        ];
    }
}
