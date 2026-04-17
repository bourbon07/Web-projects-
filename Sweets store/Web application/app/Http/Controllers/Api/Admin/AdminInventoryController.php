<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Imports\ProductImport;
use App\Exports\ProductExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class AdminInventoryController extends Controller
{
    /**
     * Upload an Excel file to import products.
     */
    public function uploadExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // Limit to 10MB
        ]);

        try {
            $import = new ProductImport();
            
            // Execute the import
            Excel::import($import, $request->file('file'));

            // Retrieve summary from the import object
            $summary = $import->getSummary();

            return response()->json([
                'success' => true,
                'message' => 'Inventory Import process completed.',
                'summary' => $summary,
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = [
                    'row' => $failure->row(),
                    'attribute' => $failure->attribute(),
                    'errors' => $failure->errors(),
                ];
            }

            return response()->json([
                'success' => false,
                'message' => 'Excel validation failed in some rows.',
                'errors'  => array_values($errors),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Admin Excel Upload Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred during the import process.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download an Excel file of the products inventory.
     */
    public function exportExcel()
    {
        return Excel::download(new ProductExport, 'inventory_export_' . now()->format('Y-m-d') . '.xlsx');
    }
}
