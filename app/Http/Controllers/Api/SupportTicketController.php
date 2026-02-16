<?php

namespace App\Http\Controllers\Api;

use App\Data\SupportTicket\CreateSupportTicketData;
use App\Http\Controllers\Controller;
use App\Http\Requests\SupportTicket\StoreSupportTicketRequest;
use App\Services\SupportTicketService;
use App\Traits\RespondsWithJson;
use Illuminate\Http\JsonResponse;

class SupportTicketController extends Controller
{
    use RespondsWithJson;

    public function __construct(private SupportTicketService $supportTicketService)
    {
    }

    public function store(StoreSupportTicketRequest $request): JsonResponse
    {
        $ticketData = CreateSupportTicketData::from($request->validated());

        $supportTicket = $this->supportTicketService->createOne(data:$ticketData);

        return $this->returnItemWithSuccessMessage(
            item: $supportTicket,
            message: 'Support ticket submitted successfully'
        );
    }
}
