<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdminCode;
use Illuminate\Support\Facades\Schema;

class AdminCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin_codes table exists
        if (!Schema::hasTable('admin_codes')) {
            $this->command->error('admin_codes table does not exist. Please run migrations first.');
            return;
        }

        // Create the default super admin code (7986)
        try {
            // Check if super_admin column exists
            $hasSuperAdminColumn = Schema::hasColumn('admin_codes', 'super_admin');
            
            // First, try to find existing code
            $superAdminCode = AdminCode::where('code', '7986')->first();
            
            if (!$superAdminCode) {
                // Create new super admin code
                $attributes = ['is_active' => true];
                if ($hasSuperAdminColumn) {
                    $attributes['super_admin'] = true;
                }
                
                $superAdminCode = AdminCode::create($attributes + ['code' => '7986']);
                $this->command->info('Super admin code (7986) created successfully.');
            } else {
                // Update existing code to ensure it's marked as super admin and active
                $updateData = ['is_active' => true];
                if ($hasSuperAdminColumn) {
                    $updateData['super_admin'] = true;
                }
                
                $superAdminCode->update($updateData);
                $this->command->info('Super admin code (7986) updated successfully.');
            }
            
            // Double-check: Ensure existing 7986 code is marked as super admin (if column exists)
            if ($hasSuperAdminColumn) {
                $superAdminCode = AdminCode::where('code', '7986')->first();
                if ($superAdminCode && !$superAdminCode->super_admin) {
                    $superAdminCode->update(['super_admin' => true]);
                    $this->command->info('Super admin code (7986) marked as super admin.');
                }
            }
        } catch (\Exception $e) {
            $this->command->error('Failed to create admin code: ' . $e->getMessage());
        }
    }
}

