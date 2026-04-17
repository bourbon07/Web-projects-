<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderComment;
use Illuminate\Http\Request;

class OrderCommentController extends Controller
{
    public function index($orderId)
    {
        $order = Order::findOrFail($orderId);
        
        // Check if user has access to this order
        if ($order->user_id !== request()->user()->id && 
            !request()->user()->isAdmin() && 
            !($order->items()->whereHas('product', function($q) {
                $q->where('seller_id', request()->user()->id);
            })->exists())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comments = OrderComment::where('order_id', $orderId)
            ->with('user:id,name,avatar_url,role')
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);
        
        // Check if user has access to this order
        if ($order->user_id !== $request->user()->id && 
            !$request->user()->isAdmin() && 
            !($order->items()->whereHas('product', function($q) use ($request) {
                $q->where('seller_id', $request->user()->id);
            })->exists())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'comment' => 'required|string',
            'image_url' => 'nullable|url',
        ]);

        $comment = OrderComment::create([
            'order_id' => $orderId,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
            'image_url' => $request->image_url,
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function destroy($id, Request $request)
    {
        $comment = OrderComment::findOrFail($id);

        if ($comment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
