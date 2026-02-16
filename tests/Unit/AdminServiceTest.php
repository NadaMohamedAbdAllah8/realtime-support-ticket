<?php

use App\Models\Admin;
use App\Services\AdminService;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    $this->service = new AdminService;
});

test('getOneByEmail returns user when user exists', function (): void {
    $email = $this->faker->safeEmail();
    $fakedAdmin = Admin::factory()->create(['email' => $email]);

    $user = $this->service->getOneByEmail($email);

    expect($user)->not->toBeNull();
    expect($user)->toBeInstanceOf(Admin::class);
    expect($user?->id)->toBe($fakedAdmin->id);
    expect($user?->email)->toBe($email);
});

test('getOneByEmail returns null when user does not exist', function (): void {
    $userEmail = $this->faker->safeEmail();
    $randomEmail = $this->faker->safeEmail();

    Admin::factory()->create(['email' => $userEmail]);

    $user = $this->service->getOneByEmail($randomEmail);

    expect($user)->toBeNull();
});
