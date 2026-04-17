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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'description_en')) {
                $table->text('description_en')->nullable()->after('name_ar');
            }
            if (!Schema::hasColumn('products', 'original_price')) {
                $table->decimal('original_price', 8, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'average_rating')) {
                $table->decimal('average_rating', 3, 2)->default(0)->after('stock_quantity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['description_en', 'original_price', 'average_rating']);
        });
    }
};
