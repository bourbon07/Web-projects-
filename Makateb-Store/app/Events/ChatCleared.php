<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatCleared implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $fromUserId;
    public $toUserId;

    public function __construct($fromUserId, $toUserId)
    {
        $this->fromUserId = $fromUserId;
        $this->toUserId = $toUserId;
    }

    /**
     * Private channel per receiver
     */
    public function broadcastOn()
    {
        // Broadcast to both participants
        return [
            new PrivateChannel('chat.' . $this->fromUserId),
            new PrivateChannel('chat.' . $this->toUserId),
        ];
    }

    /**
     * Event name
     */
    public function broadcastAs()
    {
        return 'chat.cleared';
    }

    /**
     * Data sent to Pusher
     */
    public function broadcastWith()
    {
        return [
            'from_user_id' => $this->fromUserId,
            'to_user_id' => $this->toUserId,
        ];
    }
}
