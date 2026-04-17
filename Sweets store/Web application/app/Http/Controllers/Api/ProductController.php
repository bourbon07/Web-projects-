<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function stats()
    {
        return response()->json([
            'products_count' => \App\Models\Product::count(),
            'brands_count' => \App\Models\Brand::count(),
            'customers_count' => \App\Models\User::where('role', 'User')->count(),
        ]);
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'reviews']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        $products = $query->latest()->paginate(15);

        return ProductResource::collection($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'reviews.user', 'packages'])->findOrFail($id);
        return new ProductResource($product);
    }

    public function categories()
    {
        return \App\Http\Resources\CategoryResource::collection(\App\Models\Category::all());
    }

    public function brands()
    {
        return \App\Http\Resources\BrandResource::collection(\App\Models\Brand::all());
    }

    public function addReview(Request $request, $id)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        $product = Product::findOrFail($id);
        
        $review = $product->reviews()->create([
            'user_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'message' => 'Review added successfully',
            'review' => new \App\Http\Resources\ReviewResource($review)
        ]);
    }
}
