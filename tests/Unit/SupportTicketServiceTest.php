<?php

use App\Data\SupportTicket\CreateSupportTicketData;
use App\Enum\SupportTicketStatus;
use App\Models\SupportTicket;
use App\Services\SupportTicketService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    $this->service = new SupportTicketService;
});

test('create saves support ticket with default values', function (): void {
    $customerName = $this->faker->name();
    $subject = $this->faker->sentence(4);
    $message = $this->faker->paragraph();

    $dto = CreateSupportTicketData::from([
        'customer_name' => $customerName,
        'subject' => $subject,
        'message' => $message,
    ]);

    $ticket = $this->service->createOne($dto);

    expect($ticket)->toBeInstanceOf(SupportTicket::class);
    expect($ticket->customer_name)->toBe($customerName);
    expect($ticket->subject)->toBe($subject);
    expect($ticket->message)->toBe($message);
    expect($ticket->status)->toBe(SupportTicketStatus::NEW);
    expect($ticket->assigned_admin_id)->toBeNull();
    expect($ticket->admin_response)->toBeNull();

    $this->assertDatabaseHas('support_tickets', [
        'id' => $ticket->id,
        'customer_name' => $customerName,
        'subject' => $subject,
        'status' => SupportTicketStatus::NEW->value,
        'assigned_admin_id' => null,
    ]);
});

test('getPaginated returns tickets using requested per page size', function (): void {
    SupportTicket::factory()->count(12)->create();

    $request = Request::create('/api/admin/support-tickets', 'GET', [
        'per_page' => 5,
    ]);

    $paginated = $this->service->getPaginated($request);

    expect($paginated)->toBeInstanceOf(LengthAwarePaginator::class);
    expect($paginated->perPage())->toBe(5);
    expect($paginated->total())->toBe(12);
    expect($paginated->count())->toBe(5);
});
