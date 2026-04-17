<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing foreign key constraint if it exists
        // We'll try to drop it, but if it doesn't exist, that's fine
        try {
            Schema::table('products', function (Blueprint $table) {
                $table->dropForeign(['products_category_id_foreign']);
            });
        } catch (\Exception $e) {
            // Try alternative foreign key name
            try {
                Schema::table('products', function (Blueprint $table) {
                    $table->dropForeign(['category_id']);
                });
            } catch (\Exception $e2) {
                // Foreign key might not exist or have different name, continue
            }
        }
        
        // Use raw SQL to modify the column to be nullable
        // This is more reliable than using Schema::table with change()
        \DB::statement('ALTER TABLE `products` MODIFY COLUMN `category_id` BIGINT UNSIGNED NULL');
        
        // Re-add foreign key constraint with set null on delete
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop the foreign key constraint
            try {
                $table->dropForeign(['category_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist, continue
            }
        });
        
        Schema::table('products', function (Blueprint $table) {
            // Make category_id required again (but only if all products have a category)
            // For safety, we'll keep it nullable in the down migration
            $table->unsignedBigInteger('category_id')->nullable()->change();
        });
    }
};

