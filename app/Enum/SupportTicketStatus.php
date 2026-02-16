<?php

namespace App\Enum;

enum SupportTicketStatus: string
{
    case NEW = 'new';
    case IN_PROGRESS = 'in progress';
    case CLOSED = 'closed';
}
