<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'admin'])->default('customer')->after('email');
            $table->string('secret_code')->nullable()->after('role'); // Admin: 4-digit code
            $table->string('avatar_url')->nullable()->after('secret_code');
            $table->text('bio')->nullable()->after('avatar_url');
            $table->string('location')->nullable()->after('bio');
            $table->string('phone')->nullable()->after('location');
            $table->boolean('is_private')->default(false)->after('phone'); // Hide email/phone from others
            $table->boolean('is_blocked')->default(false)->after('is_private');
            $table->timestamp('blocked_at')->nullable()->after('is_blocked');
            $table->foreignId('blocked_by')->nullable()->after('blocked_at')->constrained('users')->onDelete('set null');
            $table->string('email_verification_code')->nullable()->after('blocked_by');
            $table->timestamp('email_verification_code_expires_at')->nullable()->after('email_verification_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['blocked_by']);
            $table->dropColumn([
                'role', 'secret_code', 'avatar_url', 'bio', 'location', 'phone',
                'is_private', 'is_blocked', 'blocked_at', 'blocked_by',
                'email_verification_code', 'email_verification_code_expires_at'
            ]);
        });
    }
};
