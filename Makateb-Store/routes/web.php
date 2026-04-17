<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\OrderController;

Route::get('/payment/paypal/success', [OrderController::class, 'paypalSuccess']);
Route::get('/payment/paypal/cancel', [OrderController::class, 'paypalCancel']);

// SPA route - all routes go to Vue Router
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');

