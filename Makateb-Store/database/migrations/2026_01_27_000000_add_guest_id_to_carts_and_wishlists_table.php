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
        // 1. Update 'carts' table
        Schema::table('carts', function (Blueprint $table) {
            // Add guest_id column if not exists
            if (!Schema::hasColumn('carts', 'guest_id')) {
                $table->string('guest_id')->nullable()->after('user_id')->index();
            }
        });

        // Make user_id nullable in carts
        // DB::statement('ALTER TABLE `carts` MODIFY `user_id` BIGINT UNSIGNED NULL');

        // Add unique constraints for guest items in carts
        // Note: We use raw SQL to avoid issues if indexes already exist or with distinct naming
        try {
            DB::statement('CREATE UNIQUE INDEX carts_guest_product_unique ON carts(guest_id, product_id) WHERE guest_id IS NOT NULL');
        } catch (\Exception $e) {
            // Index might already exist or DB might not support WHERE clause (MySQL 8+ supports functional index, older might not)
            // Fallback for standard MySQL:
             try {
                // If the above advanced index fails, we might skip it or use a standard one.
                // Standard unique index allows multiple NULLs, so (guest_id, product_id) works fine if we just create it.
                // But wait, if guest_id is NULL for authenticated users, we don't want unique(NULL, product_id) to block multiple users.
                // Actually, standard SQL unique constraint allows multiple (NULL, value) rows.
                // So unique(guest_id, product_id) is safe IF guest_id is NULL for auth users.
                Schema::table('carts', function (Blueprint $table) {
                    $table->unique(['guest_id', 'product_id'], 'carts_guest_product_unique');
                    $table->unique(['guest_id', 'package_id'], 'carts_guest_package_unique');
                });
            } catch (\Exception $e2) {
                // Ignore if exists
            }
        }


        // 2. Update 'wishlists' table
        Schema::table('wishlists', function (Blueprint $table) {
            if (!Schema::hasColumn('wishlists', 'guest_id')) {
                $table->string('guest_id')->nullable()->after('user_id')->index();
            }
        });

        // Make user_id nullable in wishlists
        // DB::statement('ALTER TABLE `wishlists` MODIFY `user_id` BIGINT UNSIGNED NULL');
        
        // Add unique constraints for guest items in wishlists
        try {
             Schema::table('wishlists', function (Blueprint $table) {
                $table->unique(['guest_id', 'product_id'], 'wishlists_guest_product_unique');
                $table->unique(['guest_id', 'package_id'], 'wishlists_guest_package_unique');
            });
        } catch (\Exception $e) {
            // Ignore if exists
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We generally don't reverse this as it might lose guest data
        // But for completeness:
        
        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('carts_guest_product_unique');
            $table->dropIndex('carts_guest_package_unique');
            $table->dropColumn('guest_id');
        });
        
        // Revert user_id to not nullable (Warning: will fail if there are nulls)
        // DB::statement('ALTER TABLE `carts` MODIFY `user_id` BIGINT UNSIGNED NOT NULL');
        
        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropIndex('wishlists_guest_product_unique');
            $table->dropIndex('wishlists_guest_package_unique');
            $table->dropColumn('guest_id');
        });
    }
};
