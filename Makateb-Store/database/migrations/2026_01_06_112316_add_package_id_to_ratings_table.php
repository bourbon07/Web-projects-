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
        // Drop foreign key constraint first
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });
        
        // Drop the old unique constraint
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropUnique(['product_id', 'user_id']);
        });
        
        // Make product_id nullable and add package_id
        Schema::table('ratings', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->foreignId('package_id')->nullable()->after('product_id')->constrained('packages')->onDelete('cascade');
        });
        
        // Re-add foreign key constraint for product_id
        Schema::table('ratings', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
        
        // Note: Unique constraints on nullable columns don't work well in MySQL
        // Uniqueness will be handled in application logic using updateOrCreate
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            // Drop package_id foreign key and column
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');
        });
        
        // Drop product_id foreign key
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });
        
        // Restore product_id as not nullable and add unique constraint
        Schema::table('ratings', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable(false)->change();
            $table->unique(['product_id', 'user_id']);
        });
        
        // Re-add foreign key constraint for product_id
        Schema::table('ratings', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }
};
