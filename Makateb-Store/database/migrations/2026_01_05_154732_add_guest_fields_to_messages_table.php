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
        Schema::table('messages', function (Blueprint $table) {
            // Make to_user_id nullable for guest messages
            $table->unsignedBigInteger('to_user_id')->nullable()->change();
            // Add guest fields
            $table->string('guest_email')->nullable()->after('to_user_id');
            $table->string('guest_phone')->nullable()->after('guest_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['guest_email', 'guest_phone']);
            // Note: We don't revert to_user_id to not nullable as it might break existing data
        });
    }
};
