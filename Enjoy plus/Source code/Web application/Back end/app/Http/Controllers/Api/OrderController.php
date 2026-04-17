<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with('orderItems.product.media', 'orderItems.package.media')
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function checkout(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        
        DB::beginTransaction();

        try {
            $totalAmount = 0;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $validated['name'] ?? null,
                'customer_email' => $validated['email'] ?? null,
                'customer_phone' => $validated['phone'] ?? null,
                'shipping_address' => $validated['address'] ?? null,
                'status' => 'pending',
                'delivery_fee' => $validated['delivery_fee'] ?? 0,
                'service_fee' => $validated['service_fee'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'total_price' => 0,
            ]);

            foreach ($validated['items'] as $item) {
                $price = 0;

                if (isset($item['product_id'])) {
                    $product = Product::findOrFail($item['product_id']);
                    if ($product->stock_quantity < $item['quantity']) {
                        DB::rollBack();
                        return response()->json(['message' => 'Insufficient stock for ' . $product->name_en], 422);
                    }
                    $product->decrement('stock_quantity', $item['quantity']);
                    $price = $product->price;
                } elseif (isset($item['package_id'])) {
                    $package = Package::findOrFail($item['package_id']);
                    if ($package->stock_quantity < $item['quantity']) {
                        DB::rollBack();
                        return response()->json(['message' => 'Insufficient stock for ' . $package->name_en], 422);
                    }
                    $package->decrement('stock_quantity', $item['quantity']);
                    $price = $package->price;
                }

                $order->orderItems()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'package_id' => $item['package_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $price,
                ]);

                $totalAmount += ($price * $item['quantity']);
            }

            $order->total_price = $totalAmount + $order->delivery_fee + $order->service_fee;
            $order->save();

            // Clear the user's cart since the order was successfully created
            $request->user()->cartItems()->delete();

            DB::commit();

            return new OrderResource($order->load('orderItems.product.media', 'orderItems.package.media'));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Checkout failed', 'details' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request, $orderId)
    {
        $oldOrder = Order::where('user_id', $request->user()->id)->with('orderItems')->findOrFail($orderId);

        DB::beginTransaction();
        try {
            $newOrder = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'delivery_fee' => $oldOrder->delivery_fee,
                'service_fee' => $oldOrder->service_fee,
                'payment_method' => $oldOrder->payment_method,
                'total_price' => 0,
            ]);

            $totalPrice = 0;
            foreach ($oldOrder->orderItems as $item) {
                $price = 0;
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if (!$product || $product->stock_quantity < $item->quantity) {
                        DB::rollBack();
                        $name = $product ? $product->name_en : 'Product';
                        return response()->json(['message' => 'Insufficient stock for ' . $name], 422);
                    }
                    $product->decrement('stock_quantity', $item->quantity);
                    $price = $product->price;
                } elseif ($item->package_id) {
                    $package = Package::find($item->package_id);
                    if (!$package || $package->stock_quantity < $item->quantity) {
                        DB::rollBack();
                        $name = $package ? $package->name_en : 'Package';
                        return response()->json(['message' => 'Insufficient stock for ' . $name], 422);
                    }
                    $package->decrement('stock_quantity', $item->quantity);
                    $price = $package->price;
                }

                $newOrder->orderItems()->create([
                    'product_id' => $item->product_id,
                    'package_id' => $item->package_id,
                    'quantity' => $item->quantity,
                    'price_at_purchase' => $price,
                ]);

                $totalPrice += ($price * $item->quantity);
            }

            $newOrder->total_price = $totalPrice + $newOrder->delivery_fee + $newOrder->service_fee;
            $newOrder->save();

            DB::commit();

            return new OrderResource($newOrder->load('orderItems.product.media', 'orderItems.package.media'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Reorder failed'], 500);
        }
    }
}
