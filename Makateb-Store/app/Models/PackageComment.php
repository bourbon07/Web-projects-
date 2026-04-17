<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'user_id',
        'comment',
        'image_url',
        'rating'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
