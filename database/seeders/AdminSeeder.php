<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@realtimesupportticket.test'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );
    }
}
