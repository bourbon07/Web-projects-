<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductSearchLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['ratings', 'categories'])
            ->where('is_active', true);

        // Search functionality - check for category match first
        if ($request->has('search') || $request->has('q')) {
            $search = $request->search ?? $request->q;
            
            // First check if query matches a category name
            $category = \App\Models\Category::where('name', 'like', "%{$search}%")
                ->where('is_active', true)
                ->first();
            
            if ($category) {
                // Return category products using many-to-many relationship
                $products = $category->products()
                    ->where('is_active', true)
                    ->with(['ratings', 'categories'])
                    ->latest()
                    ->get();
                
                // Add average rating
                $products->each(function($product) {
                    $product->average_rating = $product->averageRating();
                    $adminRating = $product->adminRating();
                    if ($adminRating) {
                        $adminRating->load('user:id,name,role');
                    }
                    $product->admin_rating = $adminRating;
                });
                
                return response()->json([
                    'products' => $products,
                    'category' => $category,
                    'is_category_search' => true
                ]);
            }
            
            // Regular product search
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category if needed (using many-to-many relationship)
        if ($request->has('category')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category);
            });
        }

        // Price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $products = $query->latest()->get();
        
        // Log searches for products found (after all filters applied)
        if ($request->has('search') && $products->isNotEmpty()) {
            $search = $request->search;
            foreach ($products as $product) {
                ProductSearchLog::create([
                    'product_id' => $product->id,
                    'search_query' => $search,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'user_id' => $request->user()?->id,
                ]);
            }
        }

        // Add average rating to each product and prioritize products rated 3-5
        $products->each(function($product) {
            $product->average_rating = $product->averageRating();
            $adminRating = $product->adminRating();
            if ($adminRating) {
                $adminRating->load('user:id,name,role');
            }
            $product->admin_rating = $adminRating;
            // Add priority flag for sorting: products rated 3-5 appear first
            $product->has_high_rating = ($product->average_rating >= 3 && $product->average_rating <= 5) ? 1 : 0;
            
            // Add description_ar and description_en fields (fallback to description if not exists)
            if (!isset($product->description_ar)) {
                $product->description_ar = $product->description ?? null;
            }
            if (!isset($product->description_en)) {
                $product->description_en = $product->description ?? null;
            }
            
            // Ensure image_urls is properly formatted
            if ($product->image_urls && !is_array($product->image_urls)) {
                $decoded = json_decode($product->image_urls, true);
                $product->image_urls = is_array($decoded) ? $decoded : [];
            }
            if (!$product->image_urls || !is_array($product->image_urls)) {
                $product->image_urls = [];
            }
            // Ensure image_url is set if we have image_urls
            if (!$product->image_url && count($product->image_urls) > 0) {
                $product->image_url = $product->image_urls[0];
            }
        });

        // Sort: Products rated 3-5 first, then by created_at
        $products = $products->sortByDesc('has_high_rating')->sortByDesc('created_at')->values();

        // Return with is_category_search flag if search was performed
        if ($request->has('search') || $request->has('q')) {
            return response()->json([
                'products' => $products,
                'is_category_search' => false
            ], 200);
        }

        return response()->json($products, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        
        // Ensure image_urls is an array
        if (isset($data['image_urls']) && !is_array($data['image_urls'])) {
            $data['image_urls'] = json_decode($data['image_urls'], true) ?? [];
        }
        
        // Set first image as main image_url if not set
        if (!isset($data['image_url']) && isset($data['image_urls']) && count($data['image_urls']) > 0) {
            $firstUrl = $data['image_urls'][0];
            // Only set image_url if it's a valid URL
            if (!empty($firstUrl) && filter_var($firstUrl, FILTER_VALIDATE_URL)) {
                $data['image_url'] = $firstUrl;
            }
        }
        
        // Remove image_url if it's empty or invalid
        if (isset($data['image_url']) && (empty($data['image_url']) || !filter_var($data['image_url'], FILTER_VALIDATE_URL))) {
            unset($data['image_url']);
        }
        
        // Handle categories - support both category_id (backward compat) and category_ids (new)
        $categoryIds = [];
        if (isset($data['category_ids']) && is_array($data['category_ids'])) {
            $categoryIds = $data['category_ids'];
        } elseif (isset($data['category_id']) && !empty($data['category_id'])) {
            $categoryIds = [$data['category_id']];
        }
        
        // Remove category fields from data before creating product
        unset($data['category_id'], $data['category_ids']);
        
        $product = Product::create($data);
        
        // Sync categories using many-to-many relationship
        if (!empty($categoryIds)) {
            $product->categories()->sync($categoryIds);
        }
        
        Log::channel('orders')->info('Product created', [
            'product_id' => $product->id,
            'name' => $product->name,
            'user_id' => $request->user()->id
        ]);

        // Reload with proper formatting
        $product->refresh();
        if ($product->image_urls && !is_array($product->image_urls)) {
            $decoded = json_decode($product->image_urls, true);
            $product->image_urls = is_array($decoded) ? $decoded : [];
        }
        if (!$product->image_url && count($product->image_urls ?? []) > 0) {
            $product->image_url = $product->image_urls[0];
        }

        return response()->json($product->load(['categories']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['comments.user', 'ratings.user', 'category'])
            ->findOrFail($id);
        
        $product->average_rating = $product->averageRating();
        $adminRating = $product->adminRating();
        if ($adminRating) {
            $adminRating->load('user:id,name,role');
        }
        $product->admin_rating = $adminRating;
        
        // Ensure image_urls is properly formatted
        if ($product->image_urls && !is_array($product->image_urls)) {
            $decoded = json_decode($product->image_urls, true);
            $product->image_urls = is_array($decoded) ? $decoded : [];
        }
        if (!$product->image_urls || !is_array($product->image_urls)) {
            $product->image_urls = [];
        }
        // Ensure image_url is set if we have image_urls
        if (!$product->image_url && count($product->image_urls) > 0) {
            $product->image_url = $product->image_urls[0];
        }
        
        // Add description_ar and description_en fields (fallback to description if not exists)
        if (!isset($product->description_ar)) {
            $product->description_ar = $product->description ?? null;
        }
        if (!isset($product->description_en)) {
            $product->description_en = $product->description ?? null;
        }
        
        return response()->json($product, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, string $id)
    {
        $product = Product::findOrFail($id);
        
        // Only admin can update products
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $data = $request->validated();

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        
        // Handle categories - support both category_id (backward compat) and category_ids (new)
        $categoryIds = null;
        if (isset($data['category_ids']) && is_array($data['category_ids'])) {
            $categoryIds = $data['category_ids'];
        } elseif (isset($data['category_id']) && !empty($data['category_id'])) {
            $categoryIds = [$data['category_id']];
        }
        
        // Remove category fields from data before updating product
        unset($data['category_id'], $data['category_ids']);
        
        // Ensure image_urls is an array
        if (isset($data['image_urls']) && !is_array($data['image_urls'])) {
            $data['image_urls'] = json_decode($data['image_urls'], true) ?? [];
        }
        
        // Filter out empty/null image URLs
        if (isset($data['image_urls']) && is_array($data['image_urls'])) {
            $data['image_urls'] = array_filter($data['image_urls'], function($url) {
                return !empty($url) && filter_var($url, FILTER_VALIDATE_URL);
            });
            $data['image_urls'] = array_values($data['image_urls']); // Re-index array
        }
        
        // Set first image as main image_url if not set and we have image_urls
        if (!isset($data['image_url']) && isset($data['image_urls']) && count($data['image_urls']) > 0) {
            $data['image_url'] = $data['image_urls'][0];
        }
        
        // If image_urls is empty array, ensure it's saved as empty
        if (isset($data['image_urls']) && empty($data['image_urls'])) {
            $data['image_urls'] = [];
        }

        $product->update($data);
        
        // Sync categories if provided
        if ($categoryIds !== null) {
            $product->categories()->sync($categoryIds);
        }
        
        // Reload to get properly formatted data
        $product->refresh();
        
        // Ensure image_urls is properly formatted in response
        if ($product->image_urls && !is_array($product->image_urls)) {
            $decoded = json_decode($product->image_urls, true);
            $product->image_urls = is_array($decoded) ? $decoded : [];
        }
        if (!$product->image_url && count($product->image_urls ?? []) > 0) {
            $product->image_url = $product->image_urls[0];
        }

        Log::channel('orders')->info('Product updated', [
            'product_id' => $product->id
        ]);
        return response()->json($product->load(['categories']), 200);
    }

    /**
     * Get most searched products (top 5 by search count)
     */
    public function mostSearched(Request $request)
    {
        $limit = $request->get('limit', 5);
        
        $mostSearched = ProductSearchLog::select('product_id')
            ->selectRaw('COUNT(*) as search_count')
            ->groupBy('product_id')
            ->orderBy('search_count', 'desc')
            ->limit($limit)
            ->get();
        
        if ($mostSearched->isEmpty()) {
            return response()->json([]);
        }
        
        $productIds = $mostSearched->pluck('product_id')->toArray();
        $searchCounts = $mostSearched->pluck('search_count', 'product_id');
        
        $products = Product::with(['ratings', 'category'])
            ->where('is_active', true)
            ->whereIn('id', $productIds)
            ->get();
        
        // Sort products by search count order (maintain the order from mostSearched query)
        $products = $products->sortBy(function($product) use ($productIds) {
            $index = array_search($product->id, $productIds);
            return $index !== false ? $index : 9999;
        })->values();
        
        // Add search count and average rating to each product
        $products->each(function($product) use ($searchCounts) {
            $product->search_count = $searchCounts[$product->id] ?? 0;
            $product->average_rating = $product->averageRating();
            $adminRating = $product->adminRating();
            if ($adminRating) {
                $adminRating->load('user:id,name,role');
            }
            $product->admin_rating = $adminRating;
        });
        
        return response()->json($products);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request)
    {
        $product = Product::findOrFail($id);
        
        // Only admin can delete products
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Log::channel('orders')->info('Product deleted', [
            'product_id' => $product->id
        ]);

        $product->delete();
        return response()->json(['message' => 'Product deleted.'], 200);
    }
}
