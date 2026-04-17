<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration removes 'seller' from the role enum and updates any existing seller users
     */
    public function up(): void
    {
        // First, update any existing users with 'seller' role to 'customer'
        DB::table('users')
            ->where('role', 'seller')
            ->update(['role' => 'customer']);

        // Update the enum column to remove 'seller'
        // Note: MySQL/MariaDB requires using raw SQL to modify enum columns
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin') DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the enum to include 'seller'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'seller', 'admin') DEFAULT 'customer'");
    }
};

