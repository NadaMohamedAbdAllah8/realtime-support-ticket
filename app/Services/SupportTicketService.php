<?php

namespace App\Services;

use App\Constants\Pagination;
use App\Data\SupportTicket\CreateSupportTicketData;
use App\Enum\SupportTicketStatus;
use App\Models\SupportTicket;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

    public function getPaginated($request): LengthAwarePaginator
    {
        $perPage = $request->integer('per_page', Pagination::PER_PAGE);

        return SupportTicket::query()
            ->paginate($perPage);
    }
}
