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
        // Check if package_id column exists
        if (!Schema::hasColumn('carts', 'package_id')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->foreignId('package_id')->nullable()->after('product_id')->constrained('packages')->onDelete('cascade');
            });
        }

        // Make product_id nullable using Laravel's cross-platform Schema builder
        if (Schema::hasColumn('carts', 'product_id')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });
    }
};
