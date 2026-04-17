<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\Admin\AdminInventoryController;
use App\Http\Controllers\AI\ShehabController;

// Public routes
Route::get('/search', [SearchController::class, 'search']);
Route::get('/stats', [ProductController::class, 'stats']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Smart Password Recovery routes
Route::post('/forgot-password/verify', [VerificationController::class, 'verify'])->middleware('throttle:5,1');
Route::post('/forgot-password/reset', [VerificationController::class, 'reset'])->middleware('throttle:5,1');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/brands', [ProductController::class, 'brands']);
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{id}', [PackageController::class, 'show']);

Route::get('/cities', [CityController::class, 'index']);
Route::get('/settings', [AdminController::class, 'getSettings']);

// Consolidated AI Assistant Endpoints (Shehab v1)
Route::prefix('v1/shehab')->group(function () {
    Route::get('/search', [ShehabController::class, 'search']);
    Route::get('/metadata', [ShehabController::class, 'getMetadata']);
    Route::get('/collections/{type}', [ShehabController::class, 'getCollections']);
    Route::post('/chat', [ChatController::class, 'sendMessage']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // User routes
    Route::get('/user', function (Request $request) {
        return new \App\Http\Resources\UserResource($request->user());
    });
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/products/{id}/reviews', [ProductController::class, 'addReview']);
    Route::post('/packages/{id}/reviews', [PackageController::class, 'addReview']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders/checkout', [OrderController::class, 'checkout']);
    Route::post('/orders/{id}/reorder', [OrderController::class, 'reorder']);

    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/sync', [CartController::class, 'sync']);

    // Wishlist routes
    Route::get('/wishlist', [\App\Http\Controllers\Api\WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [\App\Http\Controllers\Api\WishlistController::class, 'toggle']);
    Route::delete('/wishlist/clear', [\App\Http\Controllers\Api\WishlistController::class, 'clear']);
    Route::delete('/wishlist/{id}', [\App\Http\Controllers\Api\WishlistController::class, 'destroy']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::post('/products', [AdminController::class, 'storeProduct']);
        Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}', [AdminController::class, 'destroyProduct']);

        Route::post('/packages', [AdminController::class, 'storePackage']);
        Route::put('/packages/{id}', [AdminController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [AdminController::class, 'destroyPackage']);

        Route::get('/categories', [AdminController::class, 'indexCategories']);
        Route::post('/categories', [AdminController::class, 'storeCategory']);
        Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [AdminController::class, 'destroyCategory']);

        Route::get('/brands', [AdminController::class, 'indexBrands']);
        Route::post('/brands', [AdminController::class, 'storeBrand']);
        Route::put('/brands/{id}', [AdminController::class, 'updateBrand']);
        Route::delete('/brands/{id}', [AdminController::class, 'destroyBrand']);

        Route::get('/users', [AdminController::class, 'indexUsers']);
        Route::post('/users/{id}/toggle-ban', [AdminController::class, 'toggleUserBan']);

        Route::get('/orders', [AdminController::class, 'indexOrders']);
        Route::get('/orders/{id}', [AdminController::class, 'showOrder']);
        Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        Route::delete('/orders/{id}', [AdminController::class, 'destroyOrder']);

        Route::get('/reviews', [AdminController::class, 'indexReviews']);
        Route::delete('/reviews/{id}', [AdminController::class, 'destroyReview']);

        // City management
        Route::get('/cities', [CityController::class, 'index']);
        Route::post('/cities', [CityController::class, 'store']);
        Route::put('/cities/{city}', [CityController::class, 'update']);
        Route::delete('/cities/{city}', [CityController::class, 'destroy']);
        // Inventory management
        Route::post('/inventory/import-excel', [AdminInventoryController::class, 'uploadExcel']);
        Route::get('/inventory/export-excel', [AdminInventoryController::class, 'exportExcel']);

        // Site Settings
        Route::post('/settings', [AdminController::class, 'updateSettings']);

        // New Bulk Import endpoint
        Route::post('/import-products', [\App\Http\Controllers\Api\Admin\ImportController::class, 'importProducts']);
    });
});
