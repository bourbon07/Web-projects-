<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json([
                'products' => [],
                'packages' => []
            ]);
        }

        $products = \App\Models\Product::where(function ($q) use ($query) {
            $q->where('name_ar', 'LIKE', "%{$query}%")
                ->orWhere('name_en', 'LIKE', "%{$query}%")
                ->orWhere('description_ar', 'LIKE', "%{$query}%")
                ->orWhere('description_en', 'LIKE', "%{$query}%");
        })
            ->orWhereHas('brand', function ($q) use ($query) {
                $q->where('name_en', 'LIKE', "%{$query}%")
                    ->orWhere('name_ar', 'LIKE', "%{$query}%");
            })
            ->orWhereHas('category', function ($q) use ($query) {
                $q->where('name_en', 'LIKE', "%{$query}%")
                    ->orWhere('name_ar', 'LIKE', "%{$query}%");
            })
            ->with(['category', 'brand', 'media'])
            ->get();

        $packages = \App\Models\Package::where(function ($q) use ($query) {
            $q->where('name_ar', 'LIKE', "%{$query}%")
                ->orWhere('name_en', 'LIKE', "%{$query}%")
                ->orWhere('description_ar', 'LIKE', "%{$query}%")
                ->orWhere('description_en', 'LIKE', "%{$query}%");
        })
            ->with(['products.media', 'media'])
            ->get();

        return response()->json([
            'products' => \App\Http\Resources\ProductResource::collection($products),
            'packages' => \App\Http\Resources\PackageResource::collection($packages),
        ]);
    }
}
