<?php

namespace App\Services;

use App\Constants\Auth;
use App\Data\Auth\LoginData;
use App\Data\Auth\LoginResponseData;
use App\Exceptions\ValidationException;
use Illuminate\Support\Facades\Hash;

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

        $token = $admin->createToken('admin-api-token')->plainTextToken;

        return new LoginResponseData(
            token: $token,
            token_type: Auth::TOKEN_TYPE,
            admin: $admin
        );
    }
}
