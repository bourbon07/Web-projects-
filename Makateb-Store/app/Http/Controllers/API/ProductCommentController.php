<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductComment;
use Illuminate\Http\Request;

class ProductCommentController extends Controller
{
    public function index($productId)
    {
        $comments = ProductComment::where('product_id', $productId)
            ->with(['user' => function ($query) use ($productId) {
                $query->select('id', 'name', 'avatar_url', 'role')
                    ->with(['ratings' => function ($q) use ($productId) {
                        $q->where('product_id', $productId);
                    }]);
            }])
            ->latest()
            ->get();

        $comments->map(function ($comment) {
            if ($comment->user && $comment->user->ratings->isNotEmpty()) {
                $comment->rating = $comment->user->ratings->first()->rating;
            } else {
                $comment->rating = null;
            }
            if ($comment->user) {
                unset($comment->user->ratings);
            }
            return $comment;
        });

        return response()->json($comments);
    }

    public function store(Request $request, $productId)
    {
        $request->validate([
            'comment' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'image_url' => 'nullable|url',
        ]);

        $comment = ProductComment::create([
            'product_id' => $productId,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
            'image_url' => $request->image_url,
        ]);

        if ($request->has('rating')) {
            \App\Models\Rating::updateOrCreate(
                [
                    'product_id' => $productId,
                    'user_id' => $request->user()->id,
                ],
                [
                    'rating' => $request->rating,
                ]
            );
            $comment->rating = $request->rating;
        }

        return response()->json($comment->load('user'), 201);
    }

    public function destroy($id, Request $request)
    {
        $comment = ProductComment::findOrFail($id);

        // User can delete their own comment, admin can delete any
        if ($comment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
