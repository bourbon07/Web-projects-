<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'name_ar',
        'name_en',
        'slug',
        'description',
        'image_url',
        'price',
        'stock',
        'is_active',
        'options',
    ];

    protected $appends = [
        'name',
        'products_count',
        'min_price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
            'options' => 'array',
        ];
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'package_product');
    }

    public function getNameAttribute()
    {
        $lang = request()->header('Accept-Language', 'ar');
        $isArabic = $lang === 'ar' || strpos($lang, 'ar') !== false;

        return $isArabic 
            ? ($this->name_ar ?? $this->name_en ?? $this->attributes['name'] ?? '')
            : ($this->name_en ?? $this->name_ar ?? $this->attributes['name'] ?? '');
    }

    public function getProductsCountAttribute()
    {
        return $this->products()->count();
    }

    public function getMinPriceAttribute()
    {
        return $this->products()->min('price') ?? 0;
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function comments()
    {
        return $this->hasMany(PackageComment::class);
    }

    public function averageRating()
    {
        return $this->ratings()->avg('rating') ?? 0;
    }

    public function adminRating()
    {
        return $this->ratings()
            ->whereHas('user', function ($query) {
                $query->where('role', 'admin');
            })
            ->avg('rating') ?? 0;
    }
}

