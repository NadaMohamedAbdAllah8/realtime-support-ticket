<?php

namespace App\Data\Auth;

use App\Models\Admin;
use Spatie\LaravelData\Data;

class LoginResponseData extends Data
{
    public function __construct(
        public string $token,
        public string $token_type,
        public Admin $admin,
    ) {
    }
}
