<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create the pivot table
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->timestamps();
            
            // Ensure unique combination
            $table->unique(['category_id', 'product_id']);
        });

        // Migrate existing category_id data to pivot table
        // Only migrate products that have a category_id set
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("
                INSERT OR IGNORE INTO category_product (category_id, product_id, created_at, updated_at)
                SELECT category_id, id, datetime('now'), datetime('now')
                FROM products
                WHERE category_id IS NOT NULL
            ");
        } else {
            DB::statement('
                INSERT INTO category_product (category_id, product_id, created_at, updated_at)
                SELECT category_id, id, NOW(), NOW()
                FROM products
                WHERE category_id IS NOT NULL
                ON DUPLICATE KEY UPDATE updated_at = NOW()
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};
