<?php

use App\Models\Admin;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('admin.inbox', function (Admin $admin): bool {
    return true;
});