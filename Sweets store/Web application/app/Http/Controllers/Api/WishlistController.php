<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistItemResource;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get the authenticated user's wishlist items.
     */
    public function index(Request $request)
    {
        $items = WishlistItem::with(['product.media', 'package.media'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => WishlistItemResource::collection($items)
        ]);
    }

    /**
     * Toggle an item in the wishlist (add if missing, remove if exists).
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'sometimes|nullable|exists:products,id',
            'package_id' => 'sometimes|nullable|exists:packages,id',
        ]);

        $userId = $request->user()->id;
        $productId = $request->product_id;
        $packageId = $request->package_id;

        if (!$productId && !$packageId) {
            return response()->json(['message' => 'Product ID or Package ID is required'], 422);
        }

        // Check if item already exists for THIS user
        $query = WishlistItem::where('user_id', $userId);
        if ($productId) {
            $query->where('product_id', $productId);
        }
        if ($packageId) {
            $query->where('package_id', $packageId);
        }

        $existing = $query->first();

        if ($existing) {
            // Remove from wishlist
            $existing->delete();
            return response()->json([
                'status' => 'removed',
                'message' => 'Item removed from wishlist'
            ]);
        }

        // Add to wishlist
        $item = WishlistItem::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'package_id' => $packageId,
        ]);

        return response()->json([
            'status' => 'added',
            'message' => 'Item added to wishlist',
            'data' => new WishlistItemResource($item->load(['product.media', 'package.media']))
        ]);
    }

    /**
     * Remove an item from the wishlist.
     */
    public function destroy(Request $request, $id)
    {
        $item = WishlistItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Item removed from wishlist'
        ]);
    }

    /**
     * Clear the user's entire wishlist.
     */
    public function clear(Request $request)
    {
        WishlistItem::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Wishlist cleared'
        ]);
    }
}
