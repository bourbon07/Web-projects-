<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('rating')->default(0); // 1-5 stars
            $table->timestamps();
            
            $table->unique(['product_id', 'user_id']); // One rating per user per product
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
