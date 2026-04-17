<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->after('to_user_id')->constrained('orders')->onDelete('set null');
            $table->string('image_url')->nullable()->after('message');
            $table->boolean('is_read')->default(false)->after('image_url');
            $table->timestamp('read_at')->nullable()->after('is_read');
            $table->enum('chat_status', ['pending', 'accepted', 'rejected'])->default('pending')->after('read_at'); // For same-role privacy
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropColumn(['order_id', 'image_url', 'is_read', 'read_at', 'chat_status']);
        });
    }
};
