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
        // Populate categories: copy existing name to both name_ar and name_en
        DB::table('categories')->whereNull('name_ar')->whereNull('name_en')->update([
            'name_ar' => DB::raw('name'),
            'name_en' => DB::raw('name'),
        ]);

        // Populate packages: copy existing name to both name_ar and name_en
        DB::table('packages')->whereNull('name_ar')->whereNull('name_en')->update([
            'name_ar' => DB::raw('name'),
            'name_en' => DB::raw('name'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse - we keep the data
    }
};

