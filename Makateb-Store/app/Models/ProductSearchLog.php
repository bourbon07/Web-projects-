<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSearchLog extends Model
{
    protected $fillable = [
        'product_id',
        'search_query',
        'ip_address',
        'user_agent',
        'user_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

