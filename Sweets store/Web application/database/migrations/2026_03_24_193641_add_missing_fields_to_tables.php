<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'description_en')) {
                $table->text('description_en')->nullable()->after('name_ar');
            }
        });

        Schema::table('packages', function (Blueprint $table) {
            if (!Schema::hasColumn('packages', 'description_en')) {
                $table->text('description_en')->nullable()->after('name_ar');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('description_en');
        });
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('description_en');
        });
    }
};
