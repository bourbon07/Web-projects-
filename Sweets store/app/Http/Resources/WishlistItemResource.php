<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WishlistItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'package_id' => $this->package_id,
            'product' => $this->product_id ? new ProductResource($this->whenLoaded('product')) : null,
            'package' => $this->package_id ? new PackageResource($this->whenLoaded('package')) : null,
            'created_at' => $this->created_at,
        ];
    }
}
