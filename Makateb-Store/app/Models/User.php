<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'role',
        'secret_code',
        'avatar_url',
        'bio',
        'location',
        'phone',
        'is_private',
        'is_blocked',
        'blocked_at',
        'blocked_by',
        'email_verification_code',
        'email_verification_code_expires_at',
        'profile_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'secret_code',
        'email_verification_code',
    ];

    protected $appends = [
        'status',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'blocked_at' => 'datetime',
            'email_verification_code_expires_at' => 'datetime',
            'profile_verified_at' => 'datetime',
            'is_private' => 'boolean',
            'is_blocked' => 'boolean',
        ];
    }

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Products relationship (deprecated - kept for backward compatibility)
     * Note: seller_id column exists but seller role has been removed
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function productComments()
    {
        return $this->hasMany(ProductComment::class);
    }

    public function orderComments()
    {
        return $this->hasMany(OrderComment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'from_user_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'to_user_id');
    }

    public function blockedBy()
    {
        return $this->belongsTo(User::class, 'blocked_by');
    }

    // Helper methods
    public function isAdmin()
    {
        // The super admin code 7986 always grants admin privileges regardless of role
        return $this->role === 'admin' || $this->secret_code === '7986';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }

    // Get user status
    public function getStatusAttribute()
    {
        if ($this->is_blocked) {
            return 'blocked';
        }
        
        if (!$this->email_verified_at) {
            return 'pending';
        }
        
        // For now, if verified and not blocked, consider active
        // You can add more logic here based on last activity, etc.
        return 'active';
    }
}
