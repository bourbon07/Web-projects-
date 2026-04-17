<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageSent;
use App\Events\ChatCleared;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index($userId)
    {
        $authUserId = Auth::id();
        $otherUser = User::findOrFail($userId);

        // Check if user is blocked - blocked users can only chat with admins
        if (Auth::user()->is_blocked) {
            if ($otherUser->role !== 'admin') {
                return response()->json(['message' => 'Blocked users can only contact admins'], 403);
            }
        } else if ($otherUser->is_blocked) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        // Check profile privacy: Non-admin users can only view chats with public profiles (except admins can chat with anyone)
        if (!Auth::user()->isAdmin() && $otherUser->is_private && $otherUser->role !== 'admin') {
            return response()->json(['message' => 'Cannot view chat with private profiles'], 403);
        }

        // Privacy check for same-role users
        if (Auth::user()->role === $otherUser->role && Auth::user()->role !== 'admin') {
            // Check if chat is accepted
            $pendingMessage = Message::where(function($q) use ($authUserId, $userId) {
                $q->where('from_user_id', $authUserId)
                  ->where('to_user_id', $userId)
                  ->where('chat_status', 'pending');
            })->exists();

            if ($pendingMessage) {
                return response()->json(['message' => 'Chat request pending'], 403);
            }

            $rejectedMessage = Message::where(function($q) use ($authUserId, $userId) {
                $q->where('from_user_id', $authUserId)
                  ->where('to_user_id', $userId)
                  ->where('chat_status', 'rejected');
            })->exists();

            if ($rejectedMessage) {
                return response()->json(['message' => 'Chat request rejected'], 403);
            }
        }

        $messages = Message::where(function ($q) use ($authUserId, $userId) {
            $q->where('from_user_id', $authUserId)
              ->where('to_user_id', $userId);
        })->orWhere(function ($q) use ($authUserId, $userId) {
            $q->where('from_user_id', $userId)
              ->where('to_user_id', $authUserId);
        })
        ->with(['sender:id,name,avatar_url,role', 'receiver:id,name,avatar_url,role', 'order:id,status,payment_status'])
        ->orderBy('created_at')
        ->get();

        // Mark messages as read ONCE - remove duplicate checks
        Message::where('from_user_id', $userId)
            ->where('to_user_id', $authUserId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'image_url' => 'nullable|url',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        // Prevent guest users from replying to order status messages
        if ($request->order_id) {
            $order = \App\Models\Order::find($request->order_id);
            if ($order && !$order->user_id) {
                // This is a guest order - check if there's an order status message from admin
                $adminMessage = Message::where('order_id', $request->order_id)
                    ->whereNotNull('from_user_id')
                    ->whereHas('sender', function($q) {
                        $q->where('role', 'admin');
                    })
                    ->whereNotNull('guest_email')
                    ->first();
                
                if ($adminMessage && !Auth::user()) {
                    return response()->json([
                        'message' => 'Guest users cannot reply to order status messages. Please create an account to chat with admin.'
                    ], 403);
                }
            }
        }

        $toUser = User::findOrFail($request->to_user_id);

        // Check if user is blocked - blocked users can only chat with admins
        if (Auth::user()->is_blocked) {
            if ($toUser->role !== 'admin') {
                return response()->json(['message' => 'Blocked users can only contact admins'], 403);
            }
        } else if ($toUser->is_blocked) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        // Check profile privacy: Non-admin users can only chat with public profiles (except admins can chat with anyone)
        if (!Auth::user()->isAdmin() && $toUser->is_private && $toUser->role !== 'admin') {
            return response()->json(['message' => 'Cannot chat with private profiles'], 403);
        }

        // Privacy check for same-role users (customer-customer)
        $chatStatus = 'accepted';
        if (Auth::user()->role === $toUser->role && Auth::user()->role !== 'admin') {
            // First message needs acceptance
            $existingChat = Message::where(function($q) use ($request) {
                $q->where('from_user_id', Auth::id())
                  ->where('to_user_id', $request->to_user_id);
            })->orWhere(function($q) use ($request) {
                $q->where('from_user_id', $request->to_user_id)
                  ->where('to_user_id', Auth::id());
            })->exists();

            if (!$existingChat) {
                $chatStatus = 'pending';
            }
        }

        $message = Message::create([
            'from_user_id' => Auth::id(),
            'to_user_id' => $request->to_user_id,
            'order_id' => $request->order_id,
            'message' => $request->message,
            'image_url' => $request->image_url,
            'chat_status' => $chatStatus,
        ]);

        broadcast(new ChatMessageSent($message))->toOthers();

        return response()->json($message->load(['sender', 'receiver', 'order']), 201);
    }

    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Message::where('from_user_id', $userId)
            ->orWhere('to_user_id', $userId)
            ->with(['sender:id,name,avatar_url,role', 'receiver:id,name,avatar_url,role'])
            ->latest()
            ->get()
            ->groupBy(function($message) use ($userId) {
                return $message->from_user_id === $userId ? $message->to_user_id : $message->from_user_id;
            })
            ->map(function($messages) use ($userId) {
                $lastMessage = $messages->first();
                $otherUser = $lastMessage->from_user_id === $userId ? $lastMessage->receiver : $lastMessage->sender;
                $unreadCount = $messages->where('to_user_id', $userId)->where('is_read', false)->count();

                return [
                    'user' => $otherUser,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                ];
            })
            ->values();

        return response()->json($conversations);
    }

    public function acceptChat(Request $request, $userId)
    {
        Message::where('from_user_id', $userId)
            ->where('to_user_id', $request->user()->id)
            ->where('chat_status', 'pending')
            ->update(['chat_status' => 'accepted']);

        return response()->json(['message' => 'Chat accepted']);
    }

    public function rejectChat(Request $request, $userId)
    {
        Message::where('from_user_id', $userId)
            ->where('to_user_id', $request->user()->id)
            ->where('chat_status', 'pending')
            ->update(['chat_status' => 'rejected']);

        return response()->json(['message' => 'Chat rejected']);
    }

    public function markAsRead(Request $request, $userId)
    {
        Message::where('from_user_id', $userId)
            ->where('to_user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'Messages marked as read']);
    }

    public function deleteMessage(Request $request, $messageId)
    {
        $message = Message::findOrFail($messageId);

        if ($message->from_user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // For "delete from both", we'd need a separate field or soft delete
        $message->delete();

        return response()->json(['message' => 'Message deleted']);
    }

    public function clearChat(Request $request, $userId)
    {
        $authUserId = Auth::id();
        
        // Delete messages between these two users
        Message::where(function ($q) use ($authUserId, $userId) {
            $q->where('from_user_id', $authUserId)
              ->where('to_user_id', $userId);
        })->orWhere(function ($q) use ($authUserId, $userId) {
            $q->where('from_user_id', $userId)
              ->where('to_user_id', $authUserId);
        })->delete();

        // Broadcast to both users that the chat has been cleared
        broadcast(new ChatCleared($authUserId, $userId))->toOthers();

        return response()->json(['message' => 'Chat cleared successfully']);
    }

    public function getAdmins()
    {
        $admins = User::where('role', 'admin')
            ->where('is_blocked', false)
            ->select('id', 'name', 'avatar_url', 'role')
            ->get();

        return response()->json($admins);
    }

    /**
     * Get guest messages by email and phone (read-only for guests)
     */
    public function getGuestMessages(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
        ]);

        // Get messages for guest user by email and phone
        $messages = Message::where('guest_email', $request->email)
            ->where('guest_phone', $request->phone)
            ->with(['sender:id,name,avatar_url,role', 'order:id,customer_name,customer_email'])
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    /**
     * Get guest conversations (grouped by order)
     */
    public function getGuestConversations(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
        ]);

        $messages = Message::where('guest_email', $request->email)
            ->where('guest_phone', $request->phone)
            ->with(['sender:id,name,avatar_url,role', 'order:id,customer_name,customer_email,status'])
            ->latest()
            ->get()
            ->groupBy('order_id')
            ->map(function($messages) {
                $lastMessage = $messages->first();
                $order = $lastMessage->order;
                $unreadCount = $messages->where('is_read', false)->count();

                return [
                    'order' => $order,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                    'messages_count' => $messages->count(),
                ];
            })
            ->values();

        return response()->json($messages);
    }
}
