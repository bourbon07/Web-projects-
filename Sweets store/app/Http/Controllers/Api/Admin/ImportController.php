<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ProductsImport;

class ImportController extends Controller
{
    public function importProducts(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xls,xlsx', // PDF is handled in UI but rejected here by mimes as requested.
        ]);

        try {
            $import = new ProductsImport();
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            if (count($errors) > 0) {
                return response()->json([
                    'success'  => false,
                    'message'  => 'Validation errors occurred during import.',
                    'errors'   => $errors,
                    'imported' => $import->getImportedCount()
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Products imported successfully.',
                'total'   => $import->getImportedCount()
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Bulk Import Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while importing products.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
