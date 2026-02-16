<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/support-tickets', [SupportTicketController::class, 'store']);
