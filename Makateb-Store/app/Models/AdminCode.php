<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class AdminCode extends Model
{
    protected $fillable = [
        'code',
        'is_active',
        'super_admin',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'super_admin' => 'boolean',
        ];
    }

    /**
     * Check if this is a super admin code
     */
    public function isSuperAdmin(): bool
    {
        // Check if super_admin column exists
        if (Schema::hasColumn('admin_codes', 'super_admin')) {
            return ($this->super_admin ?? false) === true;
        }
        
        // Fallback: check if code is 7986
        return $this->code === '7986';
    }

    /**
     * Boot the model and add event listeners to protect super admin codes
     */
    protected static function boot()
    {
        parent::boot();

        // Prevent updating super_admin field of existing super admin codes
        static::updating(function ($adminCode) {
            // Check if this is a super admin code
            $isSuperAdmin = $adminCode->isSuperAdmin();
            
            // If this is a super admin code, prevent changing super_admin field from true to false
            if ($isSuperAdmin && $adminCode->isDirty('super_admin')) {
                // Check original value if column exists
                if (Schema::hasColumn('admin_codes', 'super_admin')) {
                    $originalSuperAdmin = $adminCode->getOriginal('super_admin');
                    // Only prevent if trying to change from true to false
                    // Allow changing from false/null to true
                    if ($originalSuperAdmin === true && $adminCode->super_admin === false) {
                        return false; // Prevent changing super_admin from true to false
                    }
                    // Allow setting super_admin to true if it was false/null
                } else {
                    // Fallback: prevent changing super_admin field for code 7986 only if trying to set to false
                    if ($adminCode->code === '7986' && isset($adminCode->super_admin) && $adminCode->super_admin === false) {
                        return false;
                    }
                }
            }

            // Prevent deactivating super admin codes
            if ($isSuperAdmin && $adminCode->isDirty('is_active')) {
                if ($adminCode->is_active === false) {
                    return false; // Cannot deactivate super admin code
                }
            }

            // Prevent changing code field of super admin codes
            if ($isSuperAdmin && $adminCode->isDirty('code')) {
                return false; // Cannot change super admin code number
            }

            return true;
        });

        // Prevent deleting super admin codes
        static::deleting(function ($adminCode) {
            if ($adminCode->isSuperAdmin()) {
                return false;
            }
            return true;
        });
    }
}
