<?php

namespace App\Data\SupportTicket;

use Spatie\LaravelData\Data;

class CreateSupportTicketData extends Data
{
    public function __construct(
        public string $customer_name,
        public string $subject,
        public string $message,
    ) {
    }
}
