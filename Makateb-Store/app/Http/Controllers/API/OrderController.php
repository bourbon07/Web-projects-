<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Models\Package;
use App\Models\DeliveryFee;
use App\Models\ServiceFee;

class OrderController extends Controller
{
    /**
     * Get guest ID from request header or generate new one (though for orders, we only want to READ existing guest_id)
     */
    private function getGuestId(Request $request)
    {
        // Prioritize X-Guest-Id header
        if ($request->header('X-Guest-Id')) {
            return $request->header('X-Guest-Id');
        }
        return null;
    }

    /**
     * Display a listing of user's orders.
     */
    public function index(Request $request)
    {
        // Try to get authenticated user from Sanctum guard
        $user = auth('sanctum')->user();

        if ($user) {
            $orders = Order::where('user_id', $user->id)
                ->where('is_hidden_for_user', false)
                ->with(['items.product', 'items.package.products'])
                ->latest()
                ->get();
        } else {
            $guestId = $this->getGuestId($request);
            if (!$guestId) {
                return response()->json(['data' => []]);
            }
            $orders = Order::where('guest_id', $guestId)
                ->where('is_hidden_for_user', false)
                ->with(['items.product', 'items.package.products'])
                ->latest()
                ->get();
        }

        return OrderResource::collection($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, $id)
    {
        $order = Order::with(['items.product', 'items.package.products'])->findOrFail($id);
        
        // Check authorization
        $user = auth('sanctum')->user();
        
        if ($user) {
            if ($order->user_id !== $user->id && !$user->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            $guestId = $this->getGuestId($request);
            if (!$guestId || $order->guest_id !== $guestId) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        
        return new OrderResource($order);
    }

    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        DB::beginTransaction();

        try {
            $user = auth('sanctum')->user();
            
            // 1. Basic Order Info
            $orderData = [
                'customer_name'     => $data['customer_name'] ?? $user?->name ?? 'Guest',
                'customer_phone'    => $data['customer_phone'] ?? $user?->phone ?? '',
                'customer_email'    => $data['customer_email'] ?? $user?->email ?? '',
                'delivery_location' => $data['delivery_location'],
                'payment_method'    => $data['payment_method'],
                'payment_status'    => 'pending',
                'total_price'       => 0,
                'status'            => 'pending',
            ];

            // 2. Auth/Guest Handling
            if ($user) {
                $orderData['user_id'] = $user->id;
            } else {
                $guestId = $this->getGuestId($request);
                $orderData['guest_id'] = $guestId;
            }

            $order = Order::create($orderData);

            // 3. Process Items & Fees
            $total = 0;
            foreach ($data['items'] as $item) {
                if (!empty($item['package_id'])) {
                    $package = Package::with('products')->lockForUpdate()->findOrFail($item['package_id']);
                    
                    // Sum package price
                    $pPrice = $package->price ?? $package->products->sum('price');
                    
                    $order->items()->create([
                        'package_id'     => $package->id,
                        'qty'            => $item['qty'],
                        'price_at_order' => $pPrice,
                        'selected_options' => $item['selected_options'] ?? null,
                    ]);

                    // Check package stock
                    if ($package->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'items' => ["Package {$package->name} out of stock."]
                        ]);
                    }
                    $package->decrement('stock', $item['qty']);

                    // Decrement stock for each product in package
                    foreach ($package->products as $pProduct) {
                        $p = Product::lockForUpdate()->find($pProduct->id);
                        if ($p->stock < $item['qty']) {
                            throw ValidationException::withMessages([
                                'items' => ["Product {$p->name} in package {$package->name} out of stock."]
                            ]);
                        }
                        $p->decrement('stock', $item['qty']);
                    }
                    $total += $pPrice * $item['qty'];
                } else if (!empty($item['product_id'])) {
                    $product = Product::lockForUpdate()->find($item['product_id']);
                    if (!$product || $product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'items' => ["Product " . ($product?->name ?? 'Unknown') . " does not have enough stock."]
                        ]);
                    }

                    $order->items()->create([
                        'product_id'     => $product->id,
                        'qty'            => $item['qty'],
                        'price_at_order' => $product->price,
                        'selected_options' => $item['selected_options'] ?? null,
                    ]);

                    $product->decrement('stock', $item['qty']);
                    $total += $product->price * $item['qty'];
                }
            }

            // 4. Calculate Additional Fees
            $deliveryFee = 0;
            if ($order->delivery_location) {
                // Parse city from location string if it was combined (Address, City, Zip)
                $locationParts = explode(',', $order->delivery_location);
                $city = count($locationParts) > 1 ? trim($locationParts[1]) : $order->delivery_location;
                
                $feeModel = DeliveryFee::where('location', $city)->first();
                $deliveryFee = $feeModel ? $feeModel->fee : 0;
            }
            
            $serviceFee = ServiceFee::first()?->fee ?? 0;
            
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
                $paymentMessage = 'Redirecting to PayPal...';
            } else if ($order->payment_method === 'credit_card') {
                $paymentUrl = $this->processPayTabs($order);
                if (!$paymentUrl) {
                    throw new \Exception('Failed to initialize PayTabs payment.');
                }
                $paymentMessage = 'Redirecting to Payment Gateway...';
            } else if ($order->payment_method === 'cash_on_delivery') {
                $paymentMessage = 'Order placed successfully. Waiting for admin approval.';
            }

            DB::commit();

            Log::channel('orders')->info('order_created', [
                'order_id' => $order->id,
                'total' => $finalTotal,
                'payment_method' => $order->payment_method,
                'has_url' => !empty($paymentUrl)
            ]);

            return response()->json([
                'data' => new OrderResource($order->load('items.product', 'items.package')),
                'payment_url' => $paymentUrl,
                'message' => $paymentMessage,
                'status' => $order->payment_status
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function processPayPal(Order $order)
    {
        $clientId = env('PAYPAL_CLIENT_ID');
        $secret = env('PAYPAL_CLIENT_SECRET');
        $mode = env('PAYPAL_MODE', 'sandbox');
        $baseUrl = $mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        try {
            // Get Access Token
            $authRes = Http::asForm()->withBasicAuth($clientId, $secret)
                ->post("$baseUrl/v1/oauth2/token", ['grant_type' => 'client_credentials']);
            
            if ($authRes->failed()) {
                Log::error('PayPal Auth Failed: ' . $authRes->body());
                return null;
            }
            
            $token = $authRes->json()['access_token'];

            // Create Order
            $orderRes = Http::withToken($token)->post("$baseUrl/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => (string)$order->id,
                    'amount' => [
                        'currency_code' => 'USD', // Adjust to your currency
                        'value' => number_format($order->total_price, 2, '.', '')
                    ]
                ]],
                'application_context' => [
                    'return_url' => url("/payment/paypal/success?order_id={$order->id}"),
                    'cancel_url' => url("/payment/paypal/cancel?order_id={$order->id}"),
                ]
            ]);

            if ($orderRes->successful()) {
                $links = $orderRes->json()['links'];
                foreach ($links as $link) {
                    if ($link['rel'] === 'approve') {
                        return $link['href'];
                    }
                }
            }
            
            Log::error('PayPal Order Failed: ' . $orderRes->body());
        } catch (\Exception $e) {
            Log::error('PayPal Exception: ' . $e->getMessage());
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
                'cart_description' => "Order #{$order->id} at " . env('APP_NAME'),
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

    /**
     * Update an existing order.
     */
    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $data = $request->validated();

        DB::beginTransaction();

        try {
            if (isset($data['customer_name'])) $order->customer_name = $data['customer_name'];
            if (isset($data['customer_phone'])) $order->customer_phone = $data['customer_phone'];
            $order->save();

            $total = 0;

            if (isset($data['items'])) {
                foreach ($order->items as $item) {
                    $item->product->increment('stock', $item->qty);
                }

                $order->items()->delete();

                foreach ($data['items'] as $itemData) {
                    $product = Product::lockForUpdate()->find($itemData['product_id']);

                    if ($product->stock < $itemData['qty']) {
                        throw ValidationException::withMessages([
                            'items' => ["Product {$product->name} does not have enough stock."]
                        ]);
                    }

                    $order->items()->create([
                        'product_id' => $product->id,
                        'qty' => $itemData['qty'],
                        'price_at_order' => $product->price,
                    ]);

                    $product->decrement('stock', $itemData['qty']);
                    $total += $product->price * $itemData['qty'];
                }

                $order->total_price = $total;
                $order->save();
            }

            DB::commit();

            Log::channel('orders')->info('order_updated', [
                'order_id' => $order->id,
                'total' => $order->total_price,
                'timestamp' => now()->toDateTimeString()
            ]);

            return new OrderResource($order->load('items.product'));

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete an order and restore stock.
     */
    public function destroy(Request $request, $id)
    {
        $order = Order::with('items.product')->findOrFail($id);
        $user = auth('sanctum')->user();
        $guestId = $this->getGuestId($request);
        
        // Check if requester is owner (user or guest)
        $isOwner = ($user && $order->user_id === $user->id) || ($guestId && $order->guest_id === $guestId);
        $isAdmin = $user && $user->isAdmin();

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // If user is owner and not explicitly force deleting, just hide it from them
        if ($isOwner && !$request->has('force_delete')) {
            $order->update(['is_hidden_for_user' => true]);
            
            Log::channel('orders')->info('order_hidden_by_owner', [
                'order_id' => $id,
                'user_id' => $user?->id,
                'guest_id' => $guestId,
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json(['message' => 'Order removed from your list.'], 200);
        }

        // Only admin can proceed with hard delete
        if (!$isAdmin) {
            return response()->json(['message' => 'Unauthorized. Only admins can delete orders permanently.'], 403);
        }

        // Proceed with hard delete for admin or if force_delete provided
        DB::transaction(function() use ($order) {
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->qty);
                }
                if ($item->package) {
                    // Update: use direct relationship if it exists
                    if ($item->package) {
                        $item->package->increment('stock', $item->qty);
                    }
                }
            }

            $order->items()->delete();
            $order->delete();
        });

        Log::channel('orders')->info('order_deleted_by_admin', [
            'order_id' => $id,
            'admin_id' => $user->id,
            'timestamp' => now()->toDateTimeString()
        ]);

        return response()->json(['message' => 'Order deleted successfully.'], 200);
    }

    /**
     * Confirm an order.
     */
    public function confirm(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Only customer who owns the order or admin can confirm
        if ($order->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->is_confirmed) {
            return response()->json(['message' => 'Order already confirmed'], 400);
        }

        $order->update([
            'is_confirmed' => true,
            'confirmed_at' => now(),
        ]);

        return response()->json(new OrderResource($order->load('items.product')));
    }

    /**
     * Handle PayPal Success Callback
     */
    public function paypalSuccess(Request $request)
    {
        $orderId = $request->query('order_id');
        $paypalToken = $request->query('token');

        if (!$orderId || !$paypalToken) {
            return redirect('/orders?error=missing_info');
        }

        $order = Order::findOrFail($orderId);

        // Capture the payment
        $clientId = env('PAYPAL_CLIENT_ID');
        $secret = env('PAYPAL_CLIENT_SECRET');
        $mode = env('PAYPAL_MODE', 'sandbox');
        $baseUrl = $mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        try {
            // Get Access Token
            $authRes = Http::asForm()->withBasicAuth($clientId, $secret)
                ->post("$baseUrl/v1/oauth2/token", ['grant_type' => 'client_credentials']);
            
            if ($authRes->successful()) {
                $token = $authRes->json()['access_token'];
                
                // Capture Order
                $captureRes = Http::withToken($token)->post("$baseUrl/v2/checkout/orders/$paypalToken/capture");
                
                if ($captureRes->successful() && $captureRes->json()['status'] === 'COMPLETED') {
                    $order->update([
                        'payment_status' => 'success',
                        'status' => 'pending' // Still needs fulfillment
                    ]);
                    return redirect("/orders/$orderId?payment=success");
                }
            }
            
            Log::error('PayPal Capture Failed for Order ' . $orderId . ': ' . ($captureRes->body() ?? 'No response'));
            $order->update(['payment_status' => 'failed']);
            return redirect("/orders/$orderId?payment=failed");

        } catch (\Exception $e) {
            Log::error('PayPal Success Callback Exception: ' . $e->getMessage());
            return redirect("/orders?payment=error");
        }
    }

    /**
     * Handle PayPal Cancel Callback
     */
    public function paypalCancel(Request $request)
    {
        $orderId = $request->query('order_id');
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) $order->update(['payment_status' => 'cancelled']);
        }
        return redirect("/orders" . ($orderId ? "/$orderId" : "") . "?payment=cancelled");
    }

    /**
     * Handle PayTabs Callback (Server-to-Server)
     */
    public function paytabsCallback(Request $request)
    {
        Log::info('PayTabs Callback Received: ' . json_encode($request->all()));
        
        $orderId = $request->input('cart_id');
        $status = $request->input('payment_result.response_status'); // 'A' for Authorised/Success
        
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                if ($status === 'A') {
                    $order->update([
                        'payment_status' => 'success',
                        'status' => 'pending'
                    ]);
                } else {
                    $order->update(['payment_status' => 'failed']);
                }
            }
        }
        
        return response()->json(['status' => 'received']);
    }

    /**
     * Handle PayTabs Return (User Redirection)
     */
    public function paytabsReturn(Request $request)
    {
        $orderId = $request->query('order_id');
        // PayTabs also posts data here usually, but we prefer relying on the server callback for status.
        // But for UI feedback, we can check basic params if present.
        
        return redirect("/orders/$orderId?payment=processed");
    }
}
