<?php

namespace App\Services;

use App\Models\Admin;

class AdminService
{
    public function getOneByEmail(string $email): ?Admin
    {
        return Admin::where('email', $email)->first();
    }
}
