<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $ticketId,
        public string $subject,
    ) {
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('admin.inbox');
    }

    public function broadcastAs(): string
    {
        return 'ticket.created';
    }
}
