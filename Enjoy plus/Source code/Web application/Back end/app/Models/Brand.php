<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Brand extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'logo', // URL fallback
        'description',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getLogoAttribute($value)
    {
        if ($this->hasMedia('logos')) {
            return $this->getFirstMediaUrl('logos');
        }
        return $value;
    }
}
