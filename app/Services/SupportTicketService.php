<?php

namespace App\Services;

use App\Data\SupportTicket\CreateSupportTicketData;
use App\Enum\SupportTicketStatus;
use App\Models\SupportTicket;

class SupportTicketService
{
    public function createOne(CreateSupportTicketData $data): SupportTicket
    {
        return SupportTicket::create([
            'customer_name' => $data->customer_name,
            'subject' => $data->subject,
            'message' => $data->message,
            'status' => SupportTicketStatus::NEW,
        ]);
    }
}
