<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'guest_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'total_price',
        'status',
        'payment_method',
        'payment_status',
        'delivery_location',
        'is_confirmed',
        'confirmed_at',
        'is_hidden_for_user',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'is_confirmed' => 'boolean',
            'confirmed_at' => 'datetime',
            'is_hidden_for_user' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function comments()
    {
        return $this->hasMany(OrderComment::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
