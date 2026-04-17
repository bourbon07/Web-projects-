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
        Schema::table('products', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['category_id']);
        });
        
        Schema::table('products', function (Blueprint $table) {
            // Make category_id nullable
            $table->foreignId('category_id')->nullable()->change();
            // Re-add foreign key constraint with set null on delete
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
            $table->dropForeign(['category_id']);
        });
        
        Schema::table('products', function (Blueprint $table) {
            // Make category_id required again
            $table->foreignId('category_id')->nullable(false)->change();
            // Re-add foreign key constraint
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict');
        });
    }
};
