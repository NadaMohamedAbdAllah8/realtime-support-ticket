<?php

namespace App\Services;

use App\Constants\Auth;
use App\Data\Auth\LoginData;
use App\Data\Auth\LoginResponseData;
use App\Exceptions\ValidationException;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(private AdminService $adminService)
    {
    }

    public function login(LoginData $credentials): LoginResponseData
    {
        $admin = $this->adminService->getOneByEmail(email: $credentials->email);

        if (!$admin || !Hash::check($credentials->password, $admin->password)) {
            throw new ValidationException('The provided credentials are incorrect.');
        }

        $token = $this->getToken();
        $this->setAdminToken(admin: $admin, token: $token);

        return new LoginResponseData(
            token: $token,
            token_type: Auth::TOKEN_TYPE,
            admin: $admin
        );
    }

    private function getToken(): string
    {
        return Str::random(Auth::TOKEN_LENGTH);
    }

    private function setAdminToken(Admin $admin, string $token): void
    {
        $admin->api_token = $token;
        $admin->save();
    }
}
