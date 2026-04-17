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
        Schema::table('order_items', function (Blueprint $table) {
            // Make product_id nullable and ensure package_id exists and is nullable
            $table->foreignId('product_id')->nullable()->change();
            
            if (!Schema::hasColumn('order_items', 'package_id')) {
                $table->foreignId('package_id')->nullable()->after('product_id')->constrained('packages')->onDelete('cascade');
            } else {
                $table->foreignId('package_id')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable(false)->change();
            // We usually don't want to drop package_id if it was already there, 
            // but if we are reversing, we should at least make product_id required again.
        });
    }
};
