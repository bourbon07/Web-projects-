<?php

use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\API\CloudinaryController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\ProductCommentController;
use App\Http\Controllers\API\PackageCommentController;
use App\Http\Controllers\API\OrderCommentController;
use App\Http\Controllers\API\RatingController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\API\PackageController;
use App\Http\Controllers\API\DeliveryFeeController;
use App\Http\Controllers\API\ServiceFeeController;
use App\Http\Controllers\API\CategoryController;

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Public Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/most-searched', [ProductController::class, 'mostSearched']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/comments', [ProductCommentController::class, 'index']);
Route::get('/products/{id}/rating', [RatingController::class, 'show']);

// Public Package Routes
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{id}', [PackageController::class, 'show']);
Route::get('/packages/{id}/products', [PackageController::class, 'products']);
Route::get('/packages/{id}/comments', [PackageCommentController::class, 'index']);
Route::get('/packages/{id}/rating', [RatingController::class, 'showPackageRating']);

// Public Delivery Fee Routes
Route::get('/delivery-fees', [DeliveryFeeController::class, 'index']);
Route::get('/delivery-fees/location/{location}', [DeliveryFeeController::class, 'getByLocation']);

// Public Service Fee Routes
Route::get('/service-fee', [ServiceFeeController::class, 'get']);

// Public Category Routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Public Profile Routes
Route::get('/users/{id}/profile', [ProfileController::class, 'showPublic']);

// Public Order Routes
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/payment/paytabs/callback', [OrderController::class, 'paytabsCallback']);
Route::get('/payment/paytabs/return', [OrderController::class, 'paytabsReturn']);

// Public Cloudinary Routes
Route::get('/list-images', [CloudinaryController::class, 'listImages']);

// Public Cart Routes (accessible to guests)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::post('/cart/package', [CartController::class, 'addPackageToCart']);
Route::post('/cart/sync-guest', [CartController::class, 'syncGuest']);
Route::put('/cart/{id}', [CartController::class, 'update']);
Route::delete('/cart/{id}', [CartController::class, 'destroy']);
Route::delete('/cart', [CartController::class, 'clear']);
Route::post('/cart/checkout', [CartController::class, 'checkout']);

// Public Wishlist Routes (accessible to guests)
Route::get('/wishlist', [WishlistController::class, 'index']);
Route::post('/wishlist', [WishlistController::class, 'store']);
Route::post('/wishlist/sync-guest', [WishlistController::class, 'syncGuest']);
Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);
Route::delete('/wishlist/product/{productId}', [WishlistController::class, 'destroyByProduct']);
Route::delete('/wishlist/package/{packageId}', [WishlistController::class, 'destroyByPackage']);
Route::delete('/wishlist', [WishlistController::class, 'clear']);
Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
Route::get('/wishlist/check/package/{packageId}', [WishlistController::class, 'checkPackage']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Cloudinary Upload
    Route::post('/upload-image', [CloudinaryController::class, 'uploadImage']);
    // User Routes
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        // Make secret_code visible for the current user (needed for admin code management)
        $user->makeVisible(['secret_code']);
        return $user;
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::post('/profile/upload-avatar', [ProfileController::class, 'uploadAvatar']);
    Route::post('/profile/remove-avatar', [ProfileController::class, 'removeAvatar']);
    Route::post('/profile/send-verification-code', [ProfileController::class, 'sendVerificationCode']);
    Route::post('/profile/verify-email', [ProfileController::class, 'verifyEmail']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/change-email', [ProfileController::class, 'changeEmail']);
    Route::post('/profile/delete-account', [ProfileController::class, 'deleteAccount']);
    Route::get('/profile/blocked-info', [ProfileController::class, 'getBlockedInfo']);
    
    // Product Management (Admin)
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    
    // Product Comments
    Route::post('/products/{id}/comments', [ProductCommentController::class, 'store']);
    Route::delete('/comments/{id}', [ProductCommentController::class, 'destroy']);
    
    // Package Comments
    Route::post('/packages/{id}/comments', [PackageCommentController::class, 'store']);
    Route::delete('/package-comments/{id}', [PackageCommentController::class, 'destroy']);
    
    // Ratings
    Route::post('/products/{id}/rating', [RatingController::class, 'store']);
    Route::post('/packages/{id}/rating', [RatingController::class, 'storePackageRating']);
    
    // Order Management


    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    Route::post('/orders/{id}/confirm', [OrderController::class, 'confirm']);
    
    // Order Comments
    Route::get('/orders/{id}/comments', [OrderCommentController::class, 'index']);
    Route::post('/orders/{id}/comments', [OrderCommentController::class, 'store']);
    Route::delete('/order-comments/{id}', [OrderCommentController::class, 'destroy']);
    
    // Broadcasting authentication
    Broadcast::routes(['prefix' => '', 'middleware' => ['auth:sanctum']]);
    
    // Chat Routes
    Route::get('/conversations', [ChatController::class, 'getConversations']);
    Route::get('/messages/{user}', [ChatController::class, 'index']);
    Route::post('/messages', [ChatController::class, 'store']);
    Route::post('/chat/{user}/accept', [ChatController::class, 'acceptChat']);
    Route::post('/chat/{user}/reject', [ChatController::class, 'rejectChat']);
    Route::post('/chat/{user}/read', [ChatController::class, 'markAsRead']);
    Route::delete('/messages/{id}', [ChatController::class, 'deleteMessage']);
    Route::delete('/messages/clear/{user}', [ChatController::class, 'clearChat']);
    Route::get('/admins', [ChatController::class, 'getAdmins']);
    
    // Guest Chat Routes (read-only, no authentication required)
    Route::post('/guest/messages', [ChatController::class, 'getGuestMessages']);
    Route::post('/guest/conversations', [ChatController::class, 'getGuestConversations']);
    
    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::get('/blocked-users', [AdminController::class, 'getBlockedUsers']);
        Route::post('/users/{id}/block', [AdminController::class, 'blockUser']);
        Route::post('/users/{id}/unblock', [AdminController::class, 'unblockUser']); // id is blocked_emails.id
        Route::post('/users/unblock-by-email', [AdminController::class, 'unblockUserByEmail']);
        Route::get('/orders', [AdminController::class, 'getAllOrders']);
        Route::get('/users/{userId}/orders', [AdminController::class, 'getUserOrders']);
        Route::put('/orders/{id}/approve-payment', [AdminController::class, 'approveOrderPayment']);
        Route::put('/orders/{id}/reject-payment', [AdminController::class, 'rejectOrderPayment']);
        Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
        Route::get('/product/{id}/customers', [AdminController::class, 'getProductCustomers']);
        
        // Category Management Routes
        Route::get('/categories', [CategoryController::class, 'adminIndex']);
        Route::post('/categories', [CategoryController::class, 'adminStore']);
        Route::put('/categories/{id}', [CategoryController::class, 'adminUpdate']);
        Route::delete('/categories/{id}', [CategoryController::class, 'adminDestroy']);
        Route::get('/categories/{id}/products', [CategoryController::class, 'adminGetCategoryProducts']);
        Route::post('/categories/{id}/attach-products', [CategoryController::class, 'adminAttachProducts']);
        Route::post('/categories/{id}/detach-products', [CategoryController::class, 'adminDetachProducts']);
        
        // Delivery Fee Management Routes
        Route::get('/delivery-fees', [DeliveryFeeController::class, 'adminIndex']);
        Route::post('/delivery-fees', [DeliveryFeeController::class, 'adminStore']);
        Route::put('/delivery-fees/{id}', [DeliveryFeeController::class, 'adminUpdate']);
        Route::delete('/delivery-fees/{id}', [DeliveryFeeController::class, 'adminDestroy']);
        
        // Service Fee Management Routes
        Route::get('/service-fee', [ServiceFeeController::class, 'adminGet']);
        Route::put('/service-fee', [ServiceFeeController::class, 'adminUpdate']);
        
        // Package Management Routes
        Route::get('/packages', [PackageController::class, 'adminIndex']);
        Route::post('/packages', [PackageController::class, 'adminStore']);
        Route::put('/packages/{id}', [PackageController::class, 'adminUpdate']);
        Route::delete('/packages/{id}', [PackageController::class, 'adminDestroy']);
        Route::get('/packages/{id}/products', [PackageController::class, 'adminGetPackageProducts']);
        Route::post('/packages/{id}/attach-products', [PackageController::class, 'adminAttachProducts']);
        Route::post('/packages/{id}/detach-products', [PackageController::class, 'adminDetachProducts']);
        Route::post('/packages/{id}/sync-products', [PackageController::class, 'adminSyncProducts']);
        
        // Admin Codes Management Routes (only super admin with code 7986)
        Route::prefix('admin-codes')->group(function () {
            Route::get('/', [AdminController::class, 'getAdminCodes']);
            Route::post('/', [AdminController::class, 'createAdminCode']);
            Route::delete('/{id}', [AdminController::class, 'deleteAdminCode']);
            Route::put('/{id}/toggle', [AdminController::class, 'toggleAdminCode']);
        });
    });
});
