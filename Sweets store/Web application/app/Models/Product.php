<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'price',
        'original_price',
        'average_rating',
        'currency',
        'stock_quantity',
        'image',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function packages()
    {
        return $this->belongsToMany(Package::class)->withPivot('quantity');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getImageAttribute($value)
    {
        if ($this->hasMedia('images')) {
            return $this->getFirstMediaUrl('images');
        }
        return $value;
    }
}
