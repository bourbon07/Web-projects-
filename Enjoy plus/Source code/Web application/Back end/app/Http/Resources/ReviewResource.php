<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $item = $this->product ?: $this->package;
        $itemName = 'Unknown';
        if ($item) {
            $lang = $request->header('X-Locale', 'ar');
            $itemName = $lang === 'ar' ? ($item->name_ar ?: $item->name_en) : ($item->name_en ?: $item->name_ar);
        }

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'package_id' => $this->package_id,
            'item_name' => $itemName,
            'user' => $this->user ? $this->user->name : 'Guest',
            'rating' => $this->rating,
            'comment' => $this->comment,
            'date' => $this->created_at->toISOString(),
        ];
    }
}
