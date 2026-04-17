<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return PackageResource::collection(Package::with(['products', 'reviews'])->latest()->get());
    }

    public function show($id)
    {
        $package = Package::with(['products', 'reviews.user'])->findOrFail($id);
        return new PackageResource($package);
    }

    public function addReview(Request $request, $id)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        $package = Package::findOrFail($id);
        
        $review = $package->reviews()->create([
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
