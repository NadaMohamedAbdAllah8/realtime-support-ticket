<?php

use App\Constants\Auth;
use App\Data\Auth\LoginData;
use App\Data\Auth\LoginResponseData;
use App\Exceptions\ValidationException;
use App\Models\Admin;
use App\Services\AuthService;
use App\Services\AdminService;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    $this->adminService = Mockery::mock(AdminService::class);
    $this->service = new AuthService($this->adminService);
});

test('login success returns response dto and persists token', function (): void {
    $email = $this->faker->safeEmail();
    $password = $this->faker->password();
    $admin = Admin::factory()->create([
        'email' => $email,
        'password' => Hash::make($password),
    ]);

    $this->adminService->shouldReceive('getOneByEmail')
        ->once()
        ->with($email)
        ->andReturn($admin);

    $dto = LoginData::from([
        'email' => $email,
        'password' => $password,
    ]);

    $response = $this->service->login($dto);

    expect($response)->toBeInstanceOf(LoginResponseData::class);
    expect($response->token)->toBeString();
    expect(strlen($response->token))->toBe(Auth::TOKEN_LENGTH);
    expect($response->token_type)->toBe(Auth::TOKEN_TYPE);
    expect($response->admin)->toBeInstanceOf(Admin::class);
    expect($response->admin->id)->toBe($admin->id);

    $this->assertDatabaseHas('admins', [
        'id' => $admin->id,
        'api_token' => $response->token,
    ]);
});

test('login throws when admin not found', function (): void {
    $missingEmail = $this->faker->safeEmail();
    $this->adminService->shouldReceive('getOneByEmail')
        ->once()
        ->with($missingEmail)
        ->andReturn(null);

    $dto = LoginData::from([
        'email' => $missingEmail,
        'password' => $this->faker->password(),
    ]);

    $this->expectException(ValidationException::class);

    $this->service->login(credentials: $dto);
});

test('login throws when password invalid', function (): void {
    $email = $this->faker->safeEmail();
    $correctPassword = $this->faker->password();
    $admin = new Admin([
        'email' => $email,
        'password' => Hash::make($correctPassword),
    ]);

    $this->adminService->shouldReceive('getOneByEmail')
        ->once()
        ->with($email)
        ->andReturn($admin);

    $dto = LoginData::from([
        'email' => $email,
        'password' => $this->faker->password(),
    ]);

    $this->expectException(ValidationException::class);

    $this->service->login(credentials: $dto);
});

test('login throws when email invalid', function (): void {
    $existingEmail = $this->faker->safeEmail();
    $wrongEmail = $this->faker->safeEmail();
    $password = $this->faker->password();

    Admin::factory()->create([
        'email' => $existingEmail,
        'password' => Hash::make($password),
    ]);

    $this->adminService->shouldReceive('getOneByEmail')
        ->once()
        ->with($wrongEmail)
        ->andReturn(null);

    $dto = LoginData::from([
        'email' => $wrongEmail,
        'password' => $password,
    ]);

    $this->expectException(ValidationException::class);

    $this->service->login(credentials: $dto);
});
