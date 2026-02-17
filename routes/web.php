<?php

use Illuminate\Support\Facades\Route;
use App\Events\TicketCreated;

Route::get('/debug/broadcast', function () {
    broadcast(new TicketCreated(ticketId: 1, subject: 'Hello Reverb'));
    return 'broadcasted';
});


Route::get('/', function () {
    return view('welcome');
});
