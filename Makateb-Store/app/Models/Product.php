<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'is_active',
        'seller_id',
        'category_id',
        'image_url',
        'image_urls',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'image_urls' => 'array',
        ];
    }

    /**
     * Seller relationship (deprecated - kept for backward compatibility)
     * Note: seller_id column exists but seller role has been removed
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function comments()
    {
        return $this->hasMany(ProductComment::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function averageRating()
    {
        return $this->ratings()->avg('rating') ?? 0;
    }

    public function adminRating()
    {
        return $this->ratings()->whereHas('user', function($q) {
            $q->where('role', 'admin');
        })->with('user:id,name,role')->first();
    }

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'package_product');
    }

    public function category()
    {
        // Keep for backward compatibility - returns first category
        return $this->belongsTo(Category::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_product');
    }
}
