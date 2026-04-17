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
        // First, drop the foreign key constraint
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        // Set a default category for existing products if any
        $defaultCategory = \App\Models\Category::first();
        if (!$defaultCategory) {
            // Create a default category if none exists
            $defaultCategory = \App\Models\Category::create([
                'name' => 'General',
                'slug' => 'general',
                'description' => 'General category for products',
            ]);
        }
        DB::table('products')->whereNull('category_id')->update(['category_id' => $defaultCategory->id]);

        // Make category_id required and re-add foreign key with restrict
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable(false)->change();
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreignId('category_id')->nullable()->change();
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict');
        });
    }
};
