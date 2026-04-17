<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Package;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * ShehabController - High-performance "Skinny" API for the AI assistant.
 * Optimized for reasoning loops and exact field mapping.
 */
class ShehabController extends Controller
{
    /**
     * Unified Search Logic:
     * Robust searching across both products and packages to prevent hallucination.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('query', '');
        $isPackageOnly = filter_var($request->get('find_packages', false), FILTER_VALIDATE_BOOLEAN);
        $limit = 15;

        // Prepare queries with minimal column selection for performance
        $columns = ['id', 'name_en', 'name_ar', 'description_en', 'description_ar', 'price', 'image'];
        
        $products = collect();
        if (!$isPackageOnly) {
            $products = Product::select($columns)
                ->withAvg('reviews', 'rating')
                ->withCount('orderItems')
                ->where(function ($q) use ($query) {
                    $q->where('name_en', 'LIKE', "%{$query}%")
                      ->orWhere('name_ar', 'LIKE', "%{$query}%")
                      ->orWhere('description_en', 'LIKE', "%{$query}%")
                      ->orWhere('description_ar', 'LIKE', "%{$query}%");
                })
                ->get();
        }

        $packages = Package::select($columns)
            ->withAvg('reviews', 'rating')
            ->withCount('orderItems')
            ->where(function ($q) use ($query) {
                $q->where('name_en', 'LIKE', "%{$query}%")
                  ->orWhere('name_ar', 'LIKE', "%{$query}%")
                  ->orWhere('description_en', 'LIKE', "%{$query}%")
                  ->orWhere('description_ar', 'LIKE', "%{$query}%");
            })
            ->get();

        // Merge and Map to EXCACT AI field schema
        $results = collect()
            ->concat($this->mapExactFields($products, false))
            ->concat($this->mapExactFields($packages, true))
            ->sortByDesc('rating_raw') // Always favor top rated in search results
            ->values();

        return response()->json($results);
    }

    /**
     * Cached Metadata logic for near-instant AI context retrieval.
     */
    public function getMetadata(): JsonResponse
    {
        return Cache::remember('shehab_metadata_v1', 3600, function () {
            return response()->json([
                'categories' => Category::select('id', 'name_en', 'name_ar')->get()->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name_ar ?: $c->name_en
                ]),
                'brands' => Brand::select('id', 'name')->get()->map(fn($b) => [
                    'id' => $b->id,
                    'name' => $b->name
                ])
            ]);
        });
    }

    /**
     * Combined Discovery Collections with 15-item limit.
     */
    public function getCollections(string $type): JsonResponse
    {
        $limit = 15;

        $fetcher = match ($type) {
            'newest' => fn($q) => $q->orderBy('created_at', 'desc'),
            'top_rated' => fn($q) => $q->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'desc'),
            'most_wanted' => fn($q) => $q->withCount('orderItems')->orderBy('order_items_count', 'desc'),
            default => fn($q) => $q->orderBy('id', 'desc'),
        };

        $columns = ['id', 'name_en', 'name_ar', 'description_en', 'description_ar', 'price', 'image'];
        // Ensure ratings/counts are selectable
        $productQuery = Product::select($columns);
        $packageQuery = Package::select($columns);

        if ($type === 'top_rated') {
            $productQuery->withAvg('reviews', 'rating');
            $packageQuery->withAvg('reviews', 'rating');
        } elseif ($type === 'most_wanted') {
            $productQuery->withCount('orderItems');
            $packageQuery->withCount('orderItems');
        }

        $products = $fetcher($productQuery)->get();
        $packages = $fetcher($packageQuery)->get();

        $merged = collect($this->mapExactFields($products, false))
            ->concat($this->mapExactFields($packages, true));

        // Global sort for 'top_rated' and 'most_wanted' across BOTH types
        if ($type === 'top_rated') {
            $merged = $merged->sortByDesc('rating_raw');
        } elseif ($type === 'most_wanted') {
            $merged = $merged->sortByDesc('sales_raw');
        } else {
            // Newest or default
            $merged = $merged->sortByDesc('id');
        }

        return response()->json($merged->values());
    }

    /**
     * Critical Field Mapper:
     * Ensures the JSON keys match EXACTLY what the AI expects to see.
     */
    private function mapExactFields(Collection $items, bool $isPackage): Collection
    {
        return $items->map(fn($item) => [
            'id' => $item->id,
            'name' => $item->name_ar ?: $item->name_en,
            'price' => number_format((float) $item->price, 2) . ' JOD',
            'desc' => $item->description_ar ?: $item->description_en, // Mapping long description as short desc
            'image' => (string) ($item->image ? asset('storage/' . $item->image) : asset('assets/placeholder.jpg')),
            'is_package' => $isPackage,
            'rating_raw' => (float) ($item->reviews_avg_rating ?? 0),
            'sales_raw' => (int) ($item->order_items_count ?? 0)
        ]);
    }
}
