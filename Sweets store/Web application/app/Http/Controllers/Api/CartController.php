<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get the user's cart items.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $cartItems = CartItem::with(['product.media', 'package.media'])
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => \App\Http\Resources\CartItemResource::collection($cartItems)
        ]);
    }

    /**
     * Add an item to the cart.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|nullable|exists:products,id',
            'package_id' => 'sometimes|nullable|exists:packages,id',
            'quantity' => 'integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $productId = $request->product_id;
        $packageId = $request->package_id;
        $quantity = $request->quantity ?? 1;

        if (!$productId && !$packageId) {
            return response()->json(['message' => 'Product ID or Package ID is required'], 422);
        }

        // Stock check
        if ($productId) {
            $product = \App\Models\Product::find($productId);
            if (!$product || $product->stock_quantity < $quantity) {
                return response()->json(['message' => 'Insufficient stock for ' . ($product->name_en ?? 'Product')], 422);
            }
        } elseif ($packageId) {
            $package = \App\Models\Package::find($packageId);
            if (!$package || $package->stock_quantity < $quantity) {
                return response()->json(['message' => 'Insufficient stock for ' . ($package->name_en ?? 'Package')], 422);
            }
        }

        // Check if item already exists in cart
        $cartItem = CartItem::where('user_id', $user->id)
            ->when($productId, fn($q) => $q->where('product_id', $productId))
            ->when($packageId, fn($q) => $q->where('package_id', $packageId))
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'package_id' => $packageId,
                'quantity' => $quantity
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Item added to cart',
            'data' => new \App\Http\Resources\CartItemResource($cartItem->load(['product.media', 'package.media']))
        ]);
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $cartItem = CartItem::where('user_id', $user->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $quantity = $request->quantity;

        // Stock check on update
        if ($cartItem->product_id) {
            if ($cartItem->product->stock_quantity < $quantity) {
                 return response()->json(['message' => 'Insufficient stock for ' . ($cartItem->product->name_en ?? 'Product')], 422);
            }
        } elseif ($cartItem->package_id) {
            if ($cartItem->package->stock_quantity < $quantity) {
                 return response()->json(['message' => 'Insufficient stock for ' . ($cartItem->package->name_en ?? 'Package')], 422);
            }
        }

        $cartItem->update(['quantity' => $quantity]);

        return response()->json([
            'status' => 'success',
            'message' => 'Cart updated',
            'data' => new \App\Http\Resources\CartItemResource($cartItem->load(['product.media', 'package.media']))
        ]);
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $cartItem = CartItem::where('user_id', $user->id)->findOrFail($id);
        
        $cartItem->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Item removed from cart'
        ]);
    }

    /**
     * Clear the whole cart.
     */
    public function clear(Request $request)
    {
        $user = $request->user();
        CartItem::where('user_id', $user->id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Cart cleared'
        ]);
    }

    /**
     * Sync local cart to database (optional but useful for bridging logout/login).
     */
    public function sync(Request $request)
    {
        $user = $request->user();
        $items = $request->items; // Expecting array of { product_id, package_id, quantity }

        if (!is_array($items)) {
            return response()->json(['message' => 'Invalid items data'], 422);
        }

        foreach ($items as $item) {
            $productId = $item['product_id'] ?? null;
            $packageId = $item['package_id'] ?? null;
            $quantity = $item['quantity'] ?? 1;

            if (!$productId && !$packageId) continue;

            $cartItem = CartItem::where('user_id', $user->id)
                ->when($productId, fn($q) => $q->where('product_id', $productId))
                ->when($packageId, fn($q) => $q->where('package_id', $packageId))
                ->first();

            if ($cartItem) {
                // For sync, we might want to take the larger quantity or just replace.
                // Let's replace for simplicity
                $cartItem->update(['quantity' => $quantity]);
            } else {
                CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'package_id' => $packageId,
                    'quantity' => $quantity
                ]);
            }
        }

        return $this->index($request);
    }
}
