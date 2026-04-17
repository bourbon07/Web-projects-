<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Message;
use App\Models\AdminCode;
use App\Models\Order;
use App\Events\ChatMessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class AdminController extends Controller
{
    private function checkAdmin($request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
            }
    }

    /**
     * Check if the current user is a super admin
     */
    private function isSuperAdmin($user): bool
    {
        if (!$user || !$user->secret_code) {
            return false;
        }

        // Code 7986 is always super admin
        if ($user->secret_code == '7986') {
            return true;
        }

        try {
            // Check if super_admin column exists
            if (!Schema::hasColumn('admin_codes', 'super_admin')) {
                // Fallback to old method: check if code is 7986 (already handled above but kept for safety)
                return $user->secret_code === '7986';
            }

            // Use the new method: check super_admin field
            $adminCode = AdminCode::where('code', $user->secret_code)
                ->where('super_admin', true)
                ->where('is_active', true)
                ->first();

            return $adminCode !== null;
        } catch (\Exception $e) {
            // Fallback to old method if there's any error
            Log::warning('Error checking super admin status: ' . $e->getMessage());
            return $user->secret_code === '7986';
        }
    }

    /**
     * Check if an admin code is a super admin code
     */
    private function isSuperAdminCode($adminCode): bool
    {
        if (!$adminCode) {
            return false;
        }

        // Check if super_admin column exists, otherwise fallback to code 7986 check
        if (Schema::hasColumn('admin_codes', 'super_admin')) {
            return $adminCode->super_admin ?? false;
        } else {
            // Fallback to old method
            return $adminCode->code === '7986';
        }
    }

    public function getUsers(Request $request)
    {
        $this->checkAdmin($request);
        
        $query = User::withCount(['orders', 'products']);
        
        // Search by name, email, or role
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
            });
        }
        
        // Filter by role
        if ($request->role && $request->role !== 'all') {
            $query->where('role', $request->role);
        }
        
        // Filter by blocked status
        if ($request->blocked) {
            $query->where('is_blocked', true);
        }
        
        // Pagination
        $perPage = $request->per_page ?? 7;
        $users = $query->latest()->paginate($perPage);

        // Make secret_code visible for super admins to manage other admins
        if ($this->isSuperAdmin($request->user())) {
            $users->getCollection()->each(function($user) {
                $user->makeVisible(['secret_code']);
            });
        }

        return response()->json($users);
    }

    public function blockUser(Request $request, $userId)
    {
        $this->checkAdmin($request);
        
        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot block admin users'], 403);
        }

        $blockedBy = $request->user()->id;
        $userEmail = $user->email;
        $userRole = $user->role;

        // Store complete user data before deletion for restoration
        $userData = [
            'name' => $user->name,
            'email' => $user->email,
            'password' => $user->password, // Store hashed password
            'google_id' => $user->google_id,
            'role' => $user->role,
            'secret_code' => $user->secret_code,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'location' => $user->location,
            'phone' => $user->phone,
            'is_private' => $user->is_private,
            'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toDateTimeString() : null,
            'profile_verified_at' => $user->profile_verified_at ? $user->profile_verified_at->toDateTimeString() : null,
            'created_at' => $user->created_at ? $user->created_at->toDateTimeString() : null,
            'updated_at' => $user->updated_at ? $user->updated_at->toDateTimeString() : null,
        ];


        // Save user data to blocked_emails table before deleting
        DB::table('blocked_emails')->insert([
            'email' => $userEmail,
            'blocked_by' => $blockedBy,
            'blocked_at' => now(),
            'user_data' => json_encode($userData),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Delete the user account
        $user->delete();

        return response()->json([
            'message' => 'User blocked and account deleted successfully',
            'blocked_by' => $blockedBy
        ]);
    }

    public function unblockUser(Request $request, $blockedEmailId)
    {
        $this->checkAdmin($request);
        
        // Get blocked email record
        $blockedEmail = DB::table('blocked_emails')->find($blockedEmailId);
        
        if (!$blockedEmail) {
            return response()->json(['message' => 'Blocked email record not found'], 404);
        }

        // Check if user data exists for restoration
        if (!$blockedEmail->user_data) {
            // Old format - just remove from blocked list
            DB::table('blocked_emails')->where('id', $blockedEmailId)->delete();
            return response()->json(['message' => 'User unblocked successfully. They can now register again with this email.']);
        }

        // Decode user data
        $userData = json_decode($blockedEmail->user_data, true);
        
        if (!$userData) {
            return response()->json(['message' => 'Invalid user data'], 400);
        }

        // Check if user already exists
        $existingUser = User::where('email', $blockedEmail->email)->first();
        if ($existingUser) {
            return response()->json(['message' => 'User with this email already exists'], 400);
        }

        // Restore user account
        $restoredUser = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => $userData['password'],
            'google_id' => $userData['google_id'] ?? null,
            'role' => $userData['role'],
            'secret_code' => $userData['secret_code'] ?? null,
            'avatar_url' => $userData['avatar_url'] ?? null,
            'bio' => $userData['bio'] ?? null,
            'location' => $userData['location'] ?? null,
            'phone' => $userData['phone'] ?? null,
            'is_private' => $userData['is_private'] ?? false,
            'email_verified_at' => $userData['email_verified_at'] ?? null,
            'profile_verified_at' => $userData['profile_verified_at'] ?? null,
            'created_at' => $userData['created_at'] ?? now(),
            'updated_at' => now(),
        ]);


        // Remove from blocked_emails table
        DB::table('blocked_emails')->where('id', $blockedEmailId)->delete();

        return response()->json([
            'message' => 'User unblocked and account restored successfully',
            'user' => $restoredUser
        ]);
    }

    public function unblockUserByEmail(Request $request)
    {
        $this->checkAdmin($request);
        
        $request->validate([
            'email' => 'required|email',
        ]);

        // Find blocked email record
        $blockedEmail = DB::table('blocked_emails')
            ->where('email', $request->email)
            ->first();
        
        if (!$blockedEmail) {
            return response()->json(['message' => 'User with this email is not blocked'], 404);
        }

        // Use the existing unblockUser method
        return $this->unblockUser($request, $blockedEmail->id);
    }

    public function getBlockedUsers(Request $request)
    {
        $this->checkAdmin($request);
        
        $query = DB::table('blocked_emails')
            ->leftJoin('users', 'blocked_emails.blocked_by', '=', 'users.id');
        
        // Search by email (name will be filtered client-side from user_data)
        if ($request->search) {
            $search = $request->search;
            $query->where('blocked_emails.email', 'like', "%{$search}%");
        }
        
        $query->select(
                'blocked_emails.id',
                'blocked_emails.email',
                'blocked_emails.blocked_at',
                'blocked_emails.created_at',
            'blocked_emails.user_data',
                'users.id as blocked_by_id',
                'users.name as blocked_by_name'
        );
        
        // Pagination
        $perPage = $request->per_page ?? 5;
        $blockedEmails = $query->orderBy('blocked_emails.blocked_at', 'desc')->paginate($perPage);
        
        // Extract name, avatar, role, phone, and location from user_data
        $blockedEmails->getCollection()->transform(function($item) {
            if ($item->user_data) {
                $userData = json_decode($item->user_data, true);
                if ($userData) {
                    $item->name = $userData['name'] ?? null;
                    $item->avatar_url = $userData['avatar_url'] ?? null;
                    $item->role = $userData['role'] ?? 'customer';
                    $item->phone = $userData['phone'] ?? null;
                    $item->location = $userData['location'] ?? null;
                    // Password is hashed, so we just note that it exists
                    $item->has_password = isset($userData['password']) && !empty($userData['password']);
                }
            }
            // If no name in user_data, use email as fallback
            if (!$item->name) {
                $item->name = explode('@', $item->email)[0];
            }
            // Default role if not found
            if (!isset($item->role)) {
                $item->role = 'customer';
            }
            return $item;
        });

        return response()->json($blockedEmails);
    }

    public function updateProduct(Request $request, $productId)
    {
        $this->checkAdmin($request);
        
        $product = Product::findOrFail($productId);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'nullable|exists:categories,id', // Keep for backward compatibility
            'category_ids' => 'nullable|array', // New: multiple categories
            'category_ids.*' => 'exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image_url' => 'nullable|url',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'nullable|url|max:2048',
        ]);

        // Handle categories - support both category_id (backward compat) and category_ids (new)
        $categoryIds = null;
        if ($request->has('category_ids') && is_array($request->category_ids)) {
            $categoryIds = $request->category_ids;
        } elseif ($request->has('category_id') && !empty($request->category_id)) {
            $categoryIds = [$request->category_id];
        }
        
        $data = $request->only(['name', 'description', 'price', 'stock', 'is_active', 'image_url', 'image_urls']);
        
        // Ensure image_urls is an array
        if (isset($data['image_urls']) && !is_array($data['image_urls'])) {
            $data['image_urls'] = json_decode($data['image_urls'], true) ?? [];
        }
        
        // Filter out empty/null image URLs
        if (isset($data['image_urls']) && is_array($data['image_urls'])) {
            $data['image_urls'] = array_filter($data['image_urls'], function($url) {
                return !empty($url) && filter_var($url, FILTER_VALIDATE_URL);
            });
            $data['image_urls'] = array_values($data['image_urls']); // Re-index array
        }
        
        // Set first image as main image_url if not set and we have image_urls
        if (!isset($data['image_url']) && isset($data['image_urls']) && count($data['image_urls']) > 0) {
            $data['image_url'] = $data['image_urls'][0];
        }
        
        // If image_urls is empty array, ensure it's saved as empty
        if (isset($data['image_urls']) && empty($data['image_urls'])) {
            $data['image_urls'] = [];
        }

        $product->update($data);
        
        // Sync categories if provided
        if ($categoryIds !== null) {
            $product->categories()->sync($categoryIds);
        }
        
        // Reload to get properly formatted data
        $product->refresh();
        
        // Ensure image_urls is properly formatted in response
        if ($product->image_urls && !is_array($product->image_urls)) {
            $decoded = json_decode($product->image_urls, true);
            $product->image_urls = is_array($decoded) ? $decoded : [];
        }
        if (!$product->image_url && count($product->image_urls ?? []) > 0) {
            $product->image_url = $product->image_urls[0];
        }

        return response()->json($product->load(['category']));
    }

    public function deleteProduct(Request $request, $productId)
    {
        $this->checkAdmin($request);
        
        $product = Product::findOrFail($productId);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function getAllOrders(Request $request)
    {
        $this->checkAdmin($request);
        
        $orders = Order::with(['user', 'items.product', 'items.package.products'])
            ->when($request->status, function($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function getUserOrders(Request $request, $userId)
    {
        $this->checkAdmin($request);
        
        $user = User::findOrFail($userId);
        
        $orders = Order::where('user_id', $userId)
            ->with(['items.product', 'items.package.products'])
            ->when($request->status, function($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->latest()
            ->paginate(20);

        return response()->json([
            'user' => $user,
            'orders' => $orders
        ]);
    }

    public function getUser(Request $request, $userId)
    {
        $this->checkAdmin($request);
        
        $user = User::findOrFail($userId);
        // Include profile_verified_at for admin viewing
        return response()->json($user);
    }

    public function storeUser(Request $request)
    {
        $this->checkAdmin($request);
        
        // Only super admin can create users as admin
        $isSuperAdmin = $this->isSuperAdmin($request->user());
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => $isSuperAdmin ? 'required|in:customer,admin' : 'required|in:customer',
            'secret_code' => 'required_if:role,admin|nullable|string|size:4|regex:/^[0-9]{4}$/',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'secret_code' => $request->secret_code,
            'bio' => $request->role === 'admin' ? 'admin, manage platform' : 'customer, buy items',
        ];

        // For admin role, ensure secret_code is unique if provided
        if ($request->role === 'admin' && $request->secret_code) {
            $existing = User::where('secret_code', $request->secret_code)->where('role', 'admin')->first();
            if ($existing && $request->secret_code !== '7986') {
                return response()->json(['message' => 'This admin secret code is already in use by another admin.'], 400);
            }
        }

        $user = User::create($userData);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, $userId)
    {
        $this->checkAdmin($request);
        
        $user = User::findOrFail($userId);

        if ($user->isAdmin() && !$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Cannot modify admin users'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:6',
            'role' => $this->isSuperAdmin($request->user()) ? 'sometimes|in:customer,admin' : 'sometimes|in:customer',
            'is_blocked' => 'sometimes|boolean',
        ]);

        $data = $request->only(['name', 'email', 'role', 'is_blocked']);
        
        // Update bio based on role if role is changed
        if ($request->has('role')) {
            $data['bio'] = match($request->role) {
                'customer' => 'customer, buy items',
                'admin' => 'admin, manage platform',
                default => $user->bio,
            };
        }
        
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function updateUserStatus(Request $request, $userId)
    {
        $this->checkAdmin($request);
        
        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot modify admin users'], 403);
        }

        $request->validate([
            'status' => 'required|in:active,pending,inactive,blocked',
        ]);

        $status = $request->status;
        
        if ($status === 'blocked') {
            $user->is_blocked = true;
            $user->blocked_at = now();
            $user->blocked_by = $request->user()->id;
        } else {
            $user->is_blocked = false;
            $user->blocked_at = null;
            $user->blocked_by = null;
        }

        $user->save();

        return response()->json($user);
    }

    public function getProductCustomers(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        
        // Allow admin only
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Get all customers who added this product to cart
        $customers = User::whereHas('carts', function($query) use ($productId) {
            $query->where('product_id', $productId);
        })
        ->where('role', 'customer')
        ->with(['carts' => function($query) use ($productId) {
            $query->where('product_id', $productId);
        }])
        ->get();

        return response()->json([
            'product' => $product,
            'customers' => $customers
        ]);
    }

    public function approveOrderPayment(Request $request, $orderId)
    {
        $this->checkAdmin($request);
        
        $order = Order::with('user')->findOrFail($orderId);
        
        // Update order status and mark payment as success (as requested)
        $order->update([
            'status' => 'processing',
            'payment_status' => 'success'
        ]);
        
        // Send message to user (authenticated or guest)
        $this->sendOrderStatusMessage($order, 'accepted', $request);
        
        return response()->json([
            'message' => 'Payment approved successfully',
            'order' => $order->load(['items.product', 'user'])
        ]);
    }

    public function rejectOrderPayment(Request $request, $orderId)
    {
        $this->checkAdmin($request);
        
        $order = Order::with(['items.product', 'user'])->findOrFail($orderId);
        
        // Restore stock for all items
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock', $item->qty);
            }
            if ($item->package) {
                // Use lockForUpdate when checking package stock
                $package = $item->package()->lockForUpdate()->first();
                if ($package) {
                    $package->increment('stock', $item->qty);
                }
            }
        }
        
        // Update order status and mark payment as rejected
        $order->update([
            'status' => 'rejected',
            'payment_status' => 'rejected'
        ]);
        
        // Send message to user (authenticated or guest)
        $this->sendOrderStatusMessage($order, 'rejected', $request);
        
        return response()->json([
            'message' => 'Payment rejected and stock restored',
            'order' => $order->load(['items.product', 'user'])
        ]);
    }

    /**
     * Send order status message to user (authenticated or guest)
     */
    private function sendOrderStatusMessage($order, $status, $request)
    {
        try {
            // Get admin user (sender)
            $admin = $request->user();
            
            // Get user language preference from Accept-Language header or default to Arabic
            $acceptLanguage = $request->header('Accept-Language', 'ar');
            $userLanguage = 'ar'; // Default to Arabic (app default language)
            
            // Parse Accept-Language header
            if (preg_match('/^([a-z]{2})/i', $acceptLanguage, $matches)) {
                $lang = strtolower($matches[1]);
                if ($lang === 'ar' || $lang === 'en') {
                    $userLanguage = $lang;
                }
            }
            
            // Build message text with order details
            $orderDate = $order->created_at->format('Y-m-d H:i');
            $orderTotal = number_format($order->total_price, 2);
            
            if ($status === 'accepted') {
                if ($userLanguage === 'ar') {
                    $messageText = "نجحت عملية الدفع\n";
                    $messageText .= "رقم الطلب: #{$order->id}\n";
                    $messageText .= "الحالة: نجاح (Success)\n";
                    $messageText .= "شكراً لك على طلبك!";
                } else {
                    $messageText = "Payment successful\n";
                    $messageText .= "Order ID: #{$order->id}\n";
                    $messageText .= "Status: Success\n";
                    $messageText .= "Thank you for your order!";
                }
            } else if ($status === 'rejected') {
                if ($userLanguage === 'ar') {
                    $messageText = "فشل في الدفع (failed to pay message)\n";
                    $messageText .= "رقم الطلب: #{$order->id}\n";
                    $messageText .= "الحالة: مرفوض (Rejected)\n";
                    $messageText .= "يرجى المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.";
                } else {
                    $messageText = "Failed to pay (failed to pay message)\n";
                    $messageText .= "Order ID: #{$order->id}\n";
                    $messageText .= "Status: Rejected\n";
                    $messageText .= "Please try again or choose another payment method.";
                }
            }
            
            // Create message - support both authenticated users and guests
            $messageData = [
                'from_user_id' => $admin->id,
                'order_id' => $order->id,
                'message' => $messageText,
            ];
            
            if ($order->user_id) {
                // Authenticated user - can chat
                $messageData['to_user_id'] = $order->user_id;
                $messageData['chat_status'] = 'accepted';
            } else {
                // Guest user - cannot chat back
                $messageData['to_user_id'] = null;
                $messageData['guest_email'] = $order->customer_email;
                $messageData['guest_phone'] = $order->customer_phone;
                $messageData['chat_status'] = 'rejected'; // Prevent guest from replying
            }
            
            $message = Message::create($messageData);
            
            // Broadcast message only for authenticated users (guest users can't receive real-time updates)
            if ($order->user_id && $message->to_user_id) {
                broadcast(new ChatMessageSent($message))->toOthers();
            }
            
        } catch (\Exception $e) {
            // Log error but don't fail the order update
            Log::error('Failed to send order status message: ' . $e->getMessage());
        }
    }

    /**
     * Get all admin codes (only super admin)
     */
    public function getAdminCodes(Request $request)
    {
        $this->checkAdmin($request);
        
        // Check if user is super admin
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized. Only super admin can manage admin codes.'], 403);
        }
        
        $adminCodes = AdminCode::orderBy('created_at', 'desc')->get();
        return response()->json($adminCodes);
    }

    /**
     * Create a new admin code (only super admin)
     * 
     * This allows super admin to create new admin codes that other users
     * can use to register as regular admins (not super admins).
     * Each code can only be used by ONE user at a time.
     */
    public function createAdminCode(Request $request)
    {
        $this->checkAdmin($request);
        
        // Check if user is super admin
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized. Only super admin can manage admin codes.'], 403);
        }
        
        $request->validate([
            'code' => 'required|string|size:4|regex:/^[0-9]{4}$/',
        ]);
        
        // Check if code already exists in admin_codes table
        $existing = AdminCode::where('code', $request->code)->first();
        if ($existing) {
            return response()->json(['message' => 'Admin code already exists.'], 400);
        }
        
        // Create new admin code (regular admin, not super admin)
        // Users can register with this code to become admins
        $adminCodeData = [
            'code' => $request->code,
            'is_active' => true,
        ];
        
        // Only add super_admin field if column exists
        if (Schema::hasColumn('admin_codes', 'super_admin')) {
            $adminCodeData['super_admin'] = false; // New codes are regular admin codes, not super admin
        }
        
        $adminCode = AdminCode::create($adminCodeData);
        
        return response()->json($adminCode, 201);
    }

    /**
     * Delete an admin code (only super admin)
     */
    public function deleteAdminCode(Request $request, $id)
    {
        $this->checkAdmin($request);
        
        // Check if user is super admin
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized. Only super admin can manage admin codes.'], 403);
        }
        
        $adminCode = AdminCode::findOrFail($id);
        
        // Prevent deleting super admin codes
        if ($this->isSuperAdminCode($adminCode)) {
            return response()->json(['message' => 'Cannot delete super admin code.'], 400);
        }
        
        // Change all admins using this code to customers before deleting
        User::where('secret_code', $adminCode->code)
            ->where('role', 'admin')
            ->update([
                'role' => 'customer',
                'bio' => 'customer, buy items' // Update bio to match customer role
            ]);
        
        $adminCode->delete();
        
        return response()->json(['message' => 'Admin code deleted successfully.']);
    }

    /**
     * Toggle admin code active status (only super admin)
     */
    public function toggleAdminCode(Request $request, $id)
    {
        $this->checkAdmin($request);
        
        // Check if user is super admin
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Unauthorized. Only super admin can manage admin codes.'], 403);
        }
        
        $adminCode = AdminCode::findOrFail($id);
        
        // Super admin codes cannot be deactivated or toggled
        if ($this->isSuperAdminCode($adminCode)) {
            return response()->json(['message' => 'Cannot deactivate or modify super admin code.'], 400);
        }
        
        $newStatus = !$adminCode->is_active;
        $adminCode->update(['is_active' => $newStatus]);
        
        if (!$newStatus) {
            // If deactivating the code, change all admins using this code to customers
            User::where('secret_code', $adminCode->code)
                ->where('role', 'admin')
                ->update([
                    'role' => 'customer',
                    'bio' => 'customer, buy items' // Update bio to match customer role
                ]);
        } else {
            // If activating the code, restore all customers with this code back to admin
            User::where('secret_code', $adminCode->code)
                ->where('role', 'customer')
                ->update([
                    'role' => 'admin',
                    'bio' => 'admin, manage platform' // Update bio to match admin role
                ]);
        }
        
        return response()->json($adminCode);
    }
}
