<?php

use App\Models\Admin;
use App\Models\SupportTicket;
use Tests\TestCase;

uses(TestCase::class);

test('admin support tickets endpoint requires authentication', function (): void {
    $response = $this->getJson('/api/admin/support-tickets');

    $response
        ->assertStatus(401)
        ->assertJson([
            'message' => 'Unauthenticated.',
        ]);
});

test('admin can view paginated support tickets', function (): void {
    $admin = Admin::factory()->create();
    $token = $admin->createToken('test-admin-token')->plainTextToken;

    SupportTicket::factory()->count(18)->create();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/admin/support-tickets?per_page=10');

    $response
        ->assertOk()
        ->assertJsonStructure([
            'data',
            'current_page',
            'last_page',
            'per_page',
            'total',
        ])
        ->assertJsonPath('current_page', 1)
        ->assertJsonPath('per_page', 10)
        ->assertJsonPath('total', 18);

    expect($response->json('data'))->toHaveCount(10);
});
