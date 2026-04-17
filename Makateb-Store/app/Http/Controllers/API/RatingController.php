<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Product;
use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $rating = Rating::updateOrCreate(
            [
                'product_id' => $productId,
                'user_id' => $request->user()->id,
            ],
            [
                'rating' => $request->rating,
            ]
        );

        return response()->json($rating, 201);
    }

    public function show($productId)
    {
        $product = Product::findOrFail($productId);
        $averageRating = $product->averageRating();
        $adminRating = $product->adminRating();
        $userRating = null;

        if (request()->user()) {
            $userRating = Rating::where('product_id', $productId)
                ->where('user_id', request()->user()->id)
                ->with('user:id,name,role')
                ->first();
        }

        return response()->json([
            'average_rating' => round($averageRating, 2),
            'admin_rating' => $adminRating,
            'user_rating' => $userRating,
            'total_ratings' => $product->ratings()->count(),
        ]);
    }

    public function storePackageRating(Request $request, $packageId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $rating = Rating::updateOrCreate(
            [
                'package_id' => $packageId,
                'user_id' => $request->user()->id,
            ],
            [
                'rating' => $request->rating,
            ]
        );

        return response()->json($rating, 201);
    }

    public function showPackageRating($packageId)
    {
        $package = Package::findOrFail($packageId);
        $averageRating = $package->averageRating();
        $adminRating = $package->adminRating();
        $userRating = null;

        if (request()->user()) {
            $userRating = Rating::where('package_id', $packageId)
                ->where('user_id', request()->user()->id)
                ->with('user:id,name,role')
                ->first();
        }

        return response()->json([
            'average_rating' => round($averageRating, 2),
            'admin_rating' => $adminRating,
            'user_rating' => $userRating,
            'total_ratings' => $package->ratings()->count(),
        ]);
    }
}
