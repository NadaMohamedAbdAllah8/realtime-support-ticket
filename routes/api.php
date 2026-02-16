<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/support-tickets', [SupportTicketController::class, 'store']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/admin/support-tickets', [SupportTicketController::class, 'index']);
});
