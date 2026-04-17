<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WishlistController extends Controller
{
    /**
     * Get guest ID from session
     */
    private function getGuestId(Request $request)
    {
        // Prioritize X-Guest-Id header for Flutter apps
        if ($request->header('X-Guest-Id')) {
            return $request->header('X-Guest-Id');
        }

        if (!$request->session()->has('guest_id')) {
            $request->session()->put('guest_id', Str::uuid()->toString());
        }
        return $request->session()->get('guest_id');
    }

    public function index(Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with(['product', 'package'])
                ->latest()
                ->get();
        } else {
            // Guest user - use database storage keyed by guest_id
            $guestId = $this->getGuestId($request);
            $wishlistItems = Wishlist::where('guest_id', $guestId)
                ->with(['product', 'package'])
                ->latest()
                ->get();
        }

        return response()->json($wishlistItems);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'package_id' => 'nullable|exists:packages,id',
        ], [
            'product_id.required_without' => 'Either product_id or package_id is required.',
            'package_id.required_without' => 'Either product_id or package_id is required.',
        ]);

        // Ensure at least one is provided
        if (!$request->product_id && !$request->package_id) {
            return response()->json(['message' => 'Either product_id or package_id is required.'], 422);
        }

        // Ensure only one is provided
        if ($request->product_id && $request->package_id) {
            return response()->json(['message' => 'Only one of product_id or package_id can be provided.'], 422);
        }

        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user

            if ($request->product_id) {
                $product = Product::findOrFail($request->product_id);
                $wishlistItem = Wishlist::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'product_id' => $request->product_id,
                        'package_id' => null,
                    ]
                );
            } else {
                $package = Package::findOrFail($request->package_id);
                $wishlistItem = Wishlist::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'package_id' => $request->package_id,
                        'product_id' => null,
                    ]
                );
            }

            // Return full wishlist with all items
            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with(['product', 'package'])
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Item added to wishlist',
                'items' => $wishlistItems
            ], 201);
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            
            if ($request->product_id) {
                $product = Product::findOrFail($request->product_id);
                Wishlist::firstOrCreate(
                    [
                        'guest_id' => $guestId,
                        'product_id' => $request->product_id,
                    ],
                    [
                        'package_id' => null,
                    ]
                );
            } else {
                $package = Package::findOrFail($request->package_id);
                Wishlist::firstOrCreate(
                    [
                        'guest_id' => $guestId,
                        'package_id' => $request->package_id,
                    ],
                    [
                        'product_id' => null,
                    ]
                );
            }
            
            // Return full wishlist with all items
            $wishlistItems = Wishlist::where('guest_id', $guestId)
                ->with(['product', 'package'])
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Item added to wishlist',
                'items' => $wishlistItems
            ], 201);
        }
    }

    public function destroy($id, Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            $query = Wishlist::where('id', $id);
            
            // If not admin, restrict to own items
            if ($user->role !== 'admin') {
                $query->where('user_id', $user->id);
            }
            
            $wishlistItem = $query->firstOrFail();
            $wishlistItem->delete();

            return response()->json(['message' => 'Item removed from wishlist'], 200);
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            $wishlistItem = Wishlist::where('id', $id)
                ->where('guest_id', $guestId)
                ->firstOrFail();

            $wishlistItem->delete();

            return response()->json(['message' => 'Item removed from wishlist'], 200);
        }
    }

    public function destroyByProduct($productId, Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            $wishlistItem = Wishlist::where('product_id', $productId)
                ->where('user_id', $user->id)
                ->first();

            if ($wishlistItem) {
                $wishlistItem->delete();
                return response()->json(['message' => 'Item removed from wishlist'], 200);
            }

            return response()->json(['message' => 'Item not found in wishlist'], 404);
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            $wishlistItem = Wishlist::where('product_id', $productId)
                ->where('guest_id', $guestId)
                ->first();

            if ($wishlistItem) {
                $wishlistItem->delete();
                return response()->json(['message' => 'Item removed from wishlist'], 200);
            }

            return response()->json(['message' => 'Item not found in wishlist'], 404);
        }
    }

    public function clear(Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            Wishlist::where('user_id', $user->id)->delete();
        } else {
            // Guest user - clear database
            $guestId = $this->getGuestId($request);
            Wishlist::where('guest_id', $guestId)->delete();
        }

        return response()->json(['message' => 'Wishlist cleared'], 200);
    }

    public function check($productId, Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            $isInWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();
        } else {
            // Guest user - check database
            $guestId = $this->getGuestId($request);
            $isInWishlist = Wishlist::where('guest_id', $guestId)
                ->where('product_id', $productId)
                ->exists();
        }

        return response()->json(['is_favorite' => $isInWishlist], 200);
    }

    public function checkPackage($packageId, Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            $isInWishlist = Wishlist::where('user_id', $user->id)
                ->where('package_id', $packageId)
                ->exists();
        } else {
            // Guest user - check database
            $guestId = $this->getGuestId($request);
            $isInWishlist = Wishlist::where('guest_id', $guestId)
                ->where('package_id', $packageId)
                ->exists();
        }

        return response()->json(['is_favorite' => $isInWishlist], 200);
    }

    public function destroyByPackage($packageId, Request $request)
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // Authenticated user
            $wishlistItem = Wishlist::where('package_id', $packageId)
                ->where('user_id', $user->id)
                ->first();

            if ($wishlistItem) {
                $wishlistItem->delete();
                return response()->json(['message' => 'Item removed from wishlist'], 200);
            }

            return response()->json(['message' => 'Item not found in wishlist'], 404);
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            $wishlistItem = Wishlist::where('package_id', $packageId)
                ->where('guest_id', $guestId)
                ->first();

            if ($wishlistItem) {
                $wishlistItem->delete();
                return response()->json(['message' => 'Item removed from wishlist'], 200);
            }

            return response()->json(['message' => 'Item not found in wishlist'], 404);
        }
    }

    /**
     * Sync guest wishlist from localStorage with session
     */
    public function syncGuest(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'nullable|string',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.package_id' => 'nullable|exists:packages,id',
        ]);

        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            // If user is authenticated, merge localStorage items into their wishlist
            foreach ($request->items as $item) {
                if (isset($item['product_id'])) {
                    Wishlist::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'product_id' => $item['product_id'],
                        ],
                        [
                            'package_id' => null,
                        ]
                    );
                } elseif (isset($item['package_id'])) {
                    Wishlist::firstOrCreate(
                        [
                            'user_id' => $user->id,
                            'package_id' => $item['package_id'],
                        ],
                        [
                            'product_id' => null,
                        ]
                    );
                }
            }
            
            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with(['product', 'package'])
                ->latest()
                ->get();
        } else {
            // Guest user - merge database records
            $guestId = $this->getGuestId($request);
            
            foreach ($request->items as $item) {
                if (isset($item['product_id'])) {
                    Wishlist::firstOrCreate(
                        [
                            'guest_id' => $guestId,
                            'product_id' => $item['product_id'],
                        ],
                        [
                            'package_id' => null,
                        ]
                    );
                } elseif (isset($item['package_id'])) {
                    Wishlist::firstOrCreate(
                        [
                            'guest_id' => $guestId,
                            'package_id' => $item['package_id'],
                        ],
                        [
                            'product_id' => null,
                        ]
                    );
                }
            }
            
            $wishlistItems = Wishlist::where('guest_id', $guestId)
                ->with(['product', 'package'])
                ->latest()
                ->get();
        }

        return response()->json($wishlistItems);
    }
}
