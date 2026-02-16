<?php

use App\Enum\SupportTicketStatus;
use Tests\TestCase;

uses(TestCase::class);

test('store support ticket endpoint saves a ticket', function (): void {
    $customerName = $this->faker->name();
    $subject = $this->faker->sentence(3);
    $message = $this->faker->paragraph();

    $payload = [
        'customer_name' => $customerName,
        'subject' => $subject,
        'message' => $message,
    ];

    $response = $this->postJson('/api/support-tickets', $payload);

    $response
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Support ticket submitted successfully',
        ])
        ->assertJsonPath('item.customer_name', $customerName)
        ->assertJsonPath('item.subject', $subject)
        ->assertJsonPath('item.message', $message)
        ->assertJsonPath('item.status', SupportTicketStatus::NEW->value)
        ->assertJsonPath('item.assigned_admin_id', null)
        ->assertJsonPath('item.admin_response', null);

    $this->assertDatabaseHas('support_tickets', [
        'customer_name' => $customerName,
        'subject' => $subject,
        'status' => SupportTicketStatus::NEW->value,
    ]);
});

test('store support ticket endpoint validates required fields', function (): void {
    $response = $this->postJson('/api/support-tickets', []);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['customer_name', 'subject', 'message']);
});
