<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
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
        if ($request->user()) {
            // Authenticated user
            $cartItems = Cart::where('user_id', $request->user()->id)
                ->with(['product', 'package.products'])
                ->get();
        } else {
            // Guest user - use database storage keyed by guest_id
            $guestId = $this->getGuestId($request);
            $cartItems = Cart::where('guest_id', $guestId)
                ->with(['product', 'package.products'])
                ->get();
        }

        $total = $cartItems->sum(function($item) {
            if (is_array($item)) {
                $item = (object) $item;
            }
            if ($item->package_id && $item->package) {
                $packagePrice = $item->package->price ?? (is_array($item->package->products) ? collect($item->package->products)->sum('price') : $item->package->products->sum('price'));
                return $packagePrice * $item->quantity;
            } else {
                return ($item->product->price ?? 0) * $item->quantity;
            }
        });

        return response()->json([
            'items' => $cartItems,
            'total' => $total
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'selected_options' => 'nullable|array',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is in stock
        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => "Product '{$product->name}' is out of stock. Only {$product->stock} available."
            ], 400);
        }

        // Check if product has no stock
        if ($product->stock <= 0) {
            return response()->json([
                'message' => "Product '{$product->name}' is currently out of stock. You can add it to your wishlist to be notified when it's available."
            ], 400);
        }

        if ($request->user()) {
            // Authenticated user

            $cartItem = Cart::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'product_id' => $request->product_id,
                ],
                [
                    'quantity' => $request->quantity,
                    'selected_options' => $request->selected_options,
                ]
            );

            // Return full cart with all items
            $cartItems = Cart::where('user_id', $request->user()->id)
                ->with(['product', 'package.products'])
                ->get();

            $total = $cartItems->sum(function($item) {
                if ($item->package_id && $item->package) {
                    $packagePrice = $item->package->price ?? $item->package->products->sum('price');
                    return $packagePrice * $item->quantity;
                } else {
                    return ($item->product->price ?? 0) * $item->quantity;
                }
            });

            return response()->json([
                'message' => 'Product added to cart',
                'items' => $cartItems,
                'total' => $total
            ], 201);
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            
            $cartItem = Cart::updateOrCreate(
                [
                    'guest_id' => $guestId,
                    'product_id' => $request->product_id,
                    'package_id' => null,
                ],
                [
                    'quantity' => $request->quantity,
                    'selected_options' => $request->selected_options,
                ]
            );
            
            // Return full cart with all items
            $cartItems = Cart::where('guest_id', $guestId)
                ->with(['product', 'package.products'])
                ->get();
            
            $total = $cartItems->sum(function($item) {
                if ($item->package_id && $item->package) {
                    $packagePrice = $item->package->price ?? $item->package->products->sum('price');
                    return $packagePrice * $item->quantity;
                } else {
                    return ($item->product->price ?? 0) * $item->quantity;
                }
            });

            return response()->json([
                'message' => 'Product added to cart',
                'items' => $cartItems,
                'total' => $total
            ], 201);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if ($request->user()) {
            // Authenticated user
            $cartItem = Cart::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->with(['product', 'package.products'])
                ->firstOrFail();

            if ($cartItem->package_id && $cartItem->package) {
                foreach ($cartItem->package->products as $product) {
                    if ($product->stock < $request->quantity) {
                        return response()->json([
                            'message' => "Product '{$product->name}' from package '{$cartItem->package->name}' does not have enough stock. Only {$product->stock} available."
                        ], 400);
                    }
                    
                    if ($product->stock <= 0) {
                        return response()->json([
                            'message' => "Product '{$product->name}' from package '{$cartItem->package->name}' is currently out of stock."
                        ], 400);
                    }
                }
            } else if ($cartItem->product) {
                $product = $cartItem->product;
                
                if ($product->stock < $request->quantity) {
                    return response()->json([
                        'message' => "Product '{$product->name}' does not have enough stock. Only {$product->stock} available."
                    ], 400);
                }
                
                if ($product->stock <= 0) {
                    return response()->json([
                        'message' => "Product '{$product->name}' is currently out of stock. You can add it to your wishlist to be notified when it's available."
                    ], 400);
                }
            }

            $cartItem->update(['quantity' => $request->quantity]);

            return response()->json($cartItem->load(['product', 'package.products']));
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            $cartItem = Cart::where('id', $id)
                ->where('guest_id', $guestId)
                ->with(['product', 'package.products'])
                ->firstOrFail();

            $cartItem->update(['quantity' => $request->quantity]);

            return response()->json($cartItem->load(['product', 'package.products']));
        }
    }

    public function destroy($id, Request $request)
    {
        if ($request->user()) {
            // Authenticated user
            $cartItem = Cart::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $cartItem->delete();

            return response()->json(['message' => 'Item removed from cart']);
        } else {
            // Guest user
            $guestId = $this->getGuestId($request);
            $cartItem = Cart::where('id', $id)
                ->where('guest_id', $guestId)
                ->firstOrFail();

            $cartItem->delete();

            return response()->json(['message' => 'Item removed from cart']);
        }
    }

    public function clear(Request $request)
    {
        if ($request->user()) {
            // Authenticated user
            Cart::where('user_id', $request->user()->id)->delete();
        } else {
            $guestId = $this->getGuestId($request);
            Cart::where('guest_id', $guestId)->delete();
        }

        return response()->json(['message' => 'Cart cleared']);
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'payment_method' => 'nullable|string|in:credit_card,paypal,cash_on_delivery',
            'delivery_location' => 'required|string|max:255',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
        ]);

        // Get cart items
        if ($request->user()) {
            // Authenticated user
            $cartItems = Cart::where('user_id', $request->user()->id)
                ->with(['product', 'package.products'])
                ->get();
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            $cartItems = Cart::where('guest_id', $guestId)
                ->with(['product', 'package.products'])
                ->get();
        }

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        DB::beginTransaction();
        try {
            // Create order
            $orderData = [
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'total_price' => 0,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'delivery_location' => $request->delivery_location,
            ];
            
            // Link to user if authenticated
            if ($request->user()) {
                $orderData['user_id'] = $request->user()->id;
            } else {
                // Link to guest
                $guestId = $this->getGuestId($request);
                $orderData['guest_id'] = $guestId;
            }
            
            $order = Order::create($orderData);

            $total = 0;
            foreach ($cartItems as $item) {
                if ($item->package_id && $item->package) {
                    $package = $item->package;
                    $packagePrice = $package->price ?? $package->products->sum('price');
                    
                    // Create single order item for the package
                    $order->items()->create([
                        'package_id' => $package->id,
                        'qty' => $item->quantity,
                        'price_at_order' => $packagePrice,
                        'selected_options' => $item->selected_options,
                    ]);

                    // Check & Decrement package stock
                    if ($package->stock < $item->quantity) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Package '{$package->name}' does not have enough stock"
                        ], 400);
                    }
                    $package->decrement('stock', $item->quantity);

                    // Decrement stock for all products in the package
                    foreach ($package->products as $packageProduct) {
                        $p = Product::lockForUpdate()->find($packageProduct->id);
                        
                        if (!$p || $p->stock < $item->quantity) {
                            DB::rollBack();
                            return response()->json([
                                'message' => "Product {$packageProduct->name} from package '{$package->name}' does not have enough stock"
                            ], 400);
                        }
                        
                        $p->decrement('stock', $item->quantity);
                    }
                    $total += $packagePrice * $item->quantity;
                } else if ($item->product_id && $item->product) {
                    // Handle regular product checkout
                    $product = Product::lockForUpdate()->find($item->product_id);
                    
                    if (!$product || $product->stock < $item->quantity) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Product {$item->product->name} does not have enough stock"
                        ], 400);
                    }

                    $order->items()->create([
                        'product_id' => $product->id,
                        'qty' => $item->quantity,
                        'price_at_order' => $product->price,
                        'selected_options' => $item->selected_options,
                    ]);

                    $product->decrement('stock', $item->quantity);
                    $total += $product->price * $item->quantity;
                }
            }

            // Add delivery fee
            $deliveryLocation = $request->delivery_location;
            $deliveryFee = 0;
            
            if ($deliveryLocation) {
                $deliveryFeeModel = \App\Models\DeliveryFee::where('location', $deliveryLocation)
                    ->where('is_active', true)
                    ->first();
                if ($deliveryFeeModel) {
                    $deliveryFee = $deliveryFeeModel->fee;
                } else {
                    $deliveryFee = 15;
                }
            } else {
                $deliveryFee = 15;
            }

            // Add service fee
            $serviceFeeModel = \App\Models\ServiceFee::first();
            $serviceFee = $serviceFeeModel ? $serviceFeeModel->fee : 0;

            $finalTotal = $total + $deliveryFee + $serviceFee;
            $order->update(['total_price' => $finalTotal]);
            
            // 5. Real Payment Processing
            $paymentUrl = null;
            $paymentMessage = 'Order created successfully.';

            if ($order->payment_method === 'paypal') {
                $paymentUrl = $this->processPayPal($order);
                if (!$paymentUrl) {
                    throw new \Exception('Failed to initialize PayPal payment.');
                }
            } else if ($order->payment_method === 'credit_card') {
                $paymentUrl = $this->processPayTabs($order);
                if (!$paymentUrl) {
                    throw new \Exception('Failed to initialize PayTabs payment.');
                }
            }
            
            // Clear cart
            if ($request->user()) {
                Cart::where('user_id', $request->user()->id)->delete();
            } else {
                $guestId = $this->getGuestId($request);
                Cart::where('guest_id', $guestId)->delete();
            }

            DB::commit();

            $orderResource = new OrderResource($order->load('items.product'));
            
            return response()->json([
                'data' => $orderResource,
                'payment_url' => $paymentUrl,
                'message' => $paymentMessage,
                'status' => $order->payment_status,
                'clear_cart' => true
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function addPackageToCart(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'selected_options' => 'nullable|array',
        ]);

        $package = Package::with('products')->findOrFail($request->package_id);

        // Check if package is active
        if (!$package->is_active) {
            return response()->json(['message' => 'This package is not available'], 400);
        }

        // Check if package has products
        if ($package->products->isEmpty()) {
            return response()->json(['message' => 'This package has no products'], 400);
        }

        if ($request->user()) {
            // Authenticated user
            $existingCartItem = Cart::where('user_id', $request->user()->id)
                ->where('package_id', $package->id)
                ->where('selected_options', json_encode($request->selected_options))
                ->first();

            if ($existingCartItem) {
                $existingCartItem->increment('quantity');
                $cartItem = $existingCartItem->load('package');
            } else {
                $cartItem = Cart::create([
                    'user_id' => $request->user()->id,
                    'package_id' => $package->id,
                    'quantity' => 1,
                    'selected_options' => $request->selected_options,
                ]);
                $cartItem->load('package');
            }

            // Return full cart with all items
            $cartItems = Cart::where('user_id', $request->user()->id)
                ->with(['product', 'package.products'])
                ->get();

            $total = $cartItems->sum(function($item) {
                if ($item->package_id && $item->package) {
                    $packagePrice = $item->package->price ?? $item->package->products->sum('price');
                    return $packagePrice * $item->quantity;
                } else {
                    return ($item->product->price ?? 0) * $item->quantity;
                }
            });

            return response()->json([
                'message' => 'Package added to cart',
                'items' => $cartItems,
                'total' => $total
            ], 201);
        } else {
            // Guest user - use database
            $guestId = $this->getGuestId($request);
            
            $existingCartItem = Cart::where('guest_id', $guestId)
                ->where('package_id', $package->id)
                ->where('selected_options', json_encode($request->selected_options))
                ->first();

            if ($existingCartItem) {
                $existingCartItem->increment('quantity');
                $cartItem = $existingCartItem->load('package');
            } else {
                $cartItem = Cart::create([
                    'guest_id' => $guestId,
                    'package_id' => $package->id,
                    'quantity' => 1,
                    'selected_options' => $request->selected_options,
                ]);
                $cartItem->load('package');
            }

            // Return full cart with all items
            $cartItems = Cart::where('guest_id', $guestId)
                ->with(['product', 'package.products'])
                ->get();
            
            $total = $cartItems->sum(function($item) {
                if ($item->package_id && $item->package) {
                    $packagePrice = $item->package->price ?? $item->package->products->sum('price');
                    return $packagePrice * $item->quantity;
                } else {
                    return ($item->product->price ?? 0) * $item->quantity;
                }
            });

            return response()->json([
                'message' => 'Package added to cart',
                'items' => $cartItems,
                'total' => $total
            ], 201);
        }
    }

    /**
     * Sync guest cart from localStorage with session
     */
    public function syncGuest(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'nullable|string',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.package_id' => 'nullable|exists:packages,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selected_options' => 'nullable|array',
        ]);

        if ($request->user()) {
            // If user is authenticated, merge localStorage items into their cart
            foreach ($request->items as $item) {
                if (isset($item['product_id'])) {
                    $existing = Cart::where('user_id', $request->user()->id)
                        ->where('product_id', $item['product_id'])
                        ->where('selected_options', isset($item['selected_options']) ? json_encode($item['selected_options']) : null)
                        ->first();
                    
                    if ($existing) {
                        $existing->update(['quantity' => $item['quantity']]);
                    } else {
                        Cart::create([
                            'user_id' => $request->user()->id,
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'selected_options' => $item['selected_options'] ?? null,
                        ]);
                    }
                } elseif (isset($item['package_id'])) {
                    $existing = Cart::where('user_id', $request->user()->id)
                        ->where('package_id', $item['package_id'])
                        ->where('selected_options', isset($item['selected_options']) ? json_encode($item['selected_options']) : null)
                        ->first();
                    
                    if ($existing) {
                        $existing->update(['quantity' => $item['quantity']]);
                    } else {
                        Cart::create([
                            'user_id' => $request->user()->id,
                            'package_id' => $item['package_id'],
                            'quantity' => $item['quantity'],
                            'selected_options' => $item['selected_options'] ?? null,
                        ]);
                    }
                }
            }
            
            $cartItems = Cart::where('user_id', $request->user()->id)
                ->with(['product', 'package.products'])
                ->get();
        } else {
            // Guest user - merge database records
            $guestId = $this->getGuestId($request);
            
            foreach ($request->items as $item) {
                if (isset($item['product_id'])) {
                    Cart::updateOrCreate(
                        [
                            'guest_id' => $guestId,
                            'product_id' => $item['product_id'],
                            'package_id' => null,
                            'selected_options' => $item['selected_options'] ?? null,
                        ],
                        [
                            'quantity' => $item['quantity'],
                        ]
                    );
                } elseif (isset($item['package_id'])) {
                    Cart::updateOrCreate(
                        [
                            'guest_id' => $guestId,
                            'package_id' => $item['package_id'],
                            'product_id' => null,
                            'selected_options' => $item['selected_options'] ?? null,
                        ],
                        [
                            'quantity' => $item['quantity'],
                        ]
                    );
                }
            }
            
            $cartItems = Cart::where('guest_id', $guestId)
                ->with(['product', 'package.products'])
                ->get();
        }

        $total = $cartItems->sum(function($item) {
            if (is_array($item)) {
                $item = (object) $item;
            }
            if ($item->package_id && $item->package) {
                $packagePrice = $item->package->price ?? (is_array($item->package->products) ? collect($item->package->products)->sum('price') : $item->package->products->sum('price'));
                return $packagePrice * $item->quantity;
            } else {
                return ($item->product->price ?? 0) * $item->quantity;
            }
        });

        return response()->json([
            'items' => $cartItems,
            'total' => $total
        ]);
    }

    private function processPayPal(Order $order)
    {
        $clientId = env('PAYPAL_CLIENT_ID');
        $secret = env('PAYPAL_CLIENT_SECRET');
        $mode = env('PAYPAL_MODE', 'sandbox');
        $baseUrl = $mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        try {
            $authRes = Http::asForm()->withBasicAuth($clientId, $secret)
                ->post("$baseUrl/v1/oauth2/token", ['grant_type' => 'client_credentials']);
            
            if ($authRes->failed()) return null;
            
            $token = $authRes->json()['access_token'];

            $orderRes = Http::withToken($token)->post("$baseUrl/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => (string)$order->id,
                    'amount' => [
                        'currency_code' => 'USD',
                        'value' => number_format($order->total_price, 2, '.', '')
                    ]
                ]],
                'application_context' => [
                    'return_url' => url("/payment/paypal/success?order_id={$order->id}"),
                    'cancel_url' => url("/payment/paypal/cancel?order_id={$order->id}"),
                ]
            ]);

            if ($orderRes->successful()) {
                foreach ($orderRes->json()['links'] as $link) {
                    if ($link['rel'] === 'approve') return $link['href'];
                }
            }
        } catch (\Exception $e) {
            Log::error('PayPal Error: ' . $e->getMessage());
        }
        return null;
    }

    private function processPayTabs(Order $order)
    {
        $profileId = env('PAYTABS_PROFILE_ID');
        $serverKey = env('PAYTABS_SERVER_KEY');
        $region = env('PAYTABS_REGION', 'JO');
        $currency = env('PAYTABS_CURRENCY', 'USD');
        
        // Regional endpoints
        $endpoint = "https://secure.paytabs.com/payment/request";
        if ($region === 'JO') {
            $endpoint = "https://secure-jordan.paytabs.com/payment/request";
        }

        try {
            $res = Http::withHeaders([
                'Authorization' => $serverKey,
                'Content-Type' => 'application/json'
            ])->post($endpoint, [
                'profile_id' => (int)$profileId,
                'tran_type' => 'sale',
                'tran_class' => 'ecom',
                'cart_id' => (string)$order->id,
                'cart_description' => "Order #{$order->id}",
                'cart_currency' => $currency,
                'cart_amount' => (float)$order->total_price,
                'callback' => url("/api/payment/paytabs/callback"),
                'return' => url("/api/payment/paytabs/return?order_id={$order->id}"),
                'customer_details' => [
                    'name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                    'street1' => $order->delivery_location,
                    'city' => 'Amman',
                    'state' => 'Amman',
                    'country' => $region,
                ]
            ]);

            if ($res->successful() && isset($res->json()['redirect_url'])) {
                return $res->json()['redirect_url'];
            }
            
            Log::error('PayTabs Failed (' . $endpoint . '): ' . $res->body());
        } catch (\Exception $e) {
            Log::error('PayTabs Exception: ' . $e->getMessage());
        }
        return null;
    }
}
