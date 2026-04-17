<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();
        return [
            'id' => $this->id,
            'name' => [
                'en' => $this->name_en,
                'ar' => $this->name_ar,
            ],
            'current_name' => $locale === 'ar' ? $this->name_ar : $this->name_en,
            'description' => [
                'en' => $this->description_en ?? $this->name_en,
                'ar' => $this->description_ar,
            ],
            'current_description' => $locale === 'ar' ? $this->description_ar : ($this->description_en ?? $this->name_en),
            'price' => (float)$this->price,
            'original_price' => (float)($this->original_price ?? $this->price),
            'currency' => 'JOD',
            'average_rating' => (float)($this->average_rating ?? 5.0),
            'stock' => $this->stock_quantity,
            'image_url' => $this->image,
            'is_package' => true,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
