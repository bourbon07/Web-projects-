<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if package_id column exists
        $columns = DB::select("
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'wishlists' 
            AND COLUMN_NAME = 'package_id'
        ");

        // Add package_id column if it doesn't exist
        if (empty($columns)) {
            Schema::table('wishlists', function (Blueprint $table) {
                $table->foreignId('package_id')->nullable()->after('product_id')->constrained('packages')->onDelete('cascade');
            });
        }

        // Check if product_id is nullable
        $productIdInfo = DB::select("
            SELECT IS_NULLABLE 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'wishlists' 
            AND COLUMN_NAME = 'product_id'
        ");

        // Make product_id nullable if it's not already
        if (!empty($productIdInfo) && $productIdInfo[0]->IS_NULLABLE === 'NO') {
            // Get foreign key name
            $productFk = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'wishlists' 
                AND COLUMN_NAME = 'product_id' 
                AND REFERENCED_TABLE_NAME = 'products'
                LIMIT 1
            ");

            // Drop foreign key if exists
            if (!empty($productFk)) {
                $fkName = $productFk[0]->CONSTRAINT_NAME;
                DB::statement("ALTER TABLE wishlists DROP FOREIGN KEY `{$fkName}`");
            }

            // Drop unique constraint if exists
            try {
                DB::statement("ALTER TABLE wishlists DROP INDEX wishlists_user_id_product_id_unique");
            } catch (\Exception $e) {
                // Index might not exist, continue
            }

            // Make product_id nullable
            Schema::table('wishlists', function (Blueprint $table) {
                $table->foreignId('product_id')->nullable()->change();
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            });

            // Add unique constraints if they don't exist
            try {
                DB::statement("CREATE UNIQUE INDEX wishlists_user_product_unique ON wishlists(user_id, product_id)");
            } catch (\Exception $e) {
                // Index might already exist
            }

            try {
                DB::statement("CREATE UNIQUE INDEX wishlists_user_package_unique ON wishlists(user_id, package_id)");
            } catch (\Exception $e) {
                // Index might already exist
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wishlists', function (Blueprint $table) {
            // Drop new constraints
            $table->dropUnique('wishlists_user_product_unique');
            $table->dropUnique('wishlists_user_package_unique');

            // Drop package_id
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');

            // Restore product_id to not nullable
            $table->foreignId('product_id')->nullable(false)->change();

            // Restore original unique constraint
            $table->unique(['user_id', 'product_id']);
        });
    }
};
