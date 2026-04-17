<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Facades\Log;

class ProductImport implements ToCollection, WithHeadingRow, WithValidation, SkipsEmptyRows, WithCustomCsvSettings
{
    private $rowsImported = 0;
    private $rowsSkipped = 0;

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            Log::warning('Excel Import: The uploaded file appears to be empty or has no readable rows.');
            return;
        }

        // Log the first row's keys so we can see what headings were detected
        if ($rows->first()) {
            Log::info('Excel Import Detected Headings: ' . json_encode(array_keys($rows->first()->toArray())));
        }

        foreach ($rows as $row) {
            $data = $row->toArray();
            
            try {
                // Determine names with multiple fallback options in case of header mismatches
                $nameEn = $data['name_en'] ?? $data['name'] ?? $data['title_en'] ?? null;
                $nameAr = $data['name_ar'] ?? $data['name_arabic'] ?? $data['title_ar'] ?? ($data['name'] ?? null);
                
                if (empty($nameEn)) {
                    Log::warning('Excel Import: Skipping row due to missing English Name (name_en). Row data: ' . json_encode($data));
                    $this->rowsSkipped++;
                    continue;
                }

                // Create category and brand with defaults if not provided
                $categoryNameEn = $data['category_name'] ?? $data['category'] ?? 'General';
                $categoryNameAr = $data['category_name_ar'] ?? ($data['category_ar'] ?? $categoryNameEn);
                $category = Category::firstOrCreate(['name_en' => $categoryNameEn], ['name_ar' => $categoryNameAr]);

                $brandName = $data['brand_name'] ?? $data['brand'] ?? 'Enjoy Plus';
                $brand = Brand::firstOrCreate(['name' => $brandName], ['description' => $data['brand_description'] ?? 'Imported']);

                $product = Product::where('name_en', $nameEn)->first();

                $params = [
                    'category_id'    => $category->id,
                    'brand_id'       => $brand->id,
                    'name_ar'        => $nameAr ?? $nameEn, // Fallback to EN if AR is missing
                    'price'          => $data['price'] ?? 0,
                    'stock_quantity' => $data['stock_quantity'] ?? 0,
                    'description_en' => $data['description_en'] ?? ($data['description'] ?? null),
                    'description_ar' => $data['description_ar'] ?? ($data['description'] ?? null),
                ];

                if ($product) {
                    $product->update($params);
                } else {
                    $params['name_en'] = $nameEn;
                    Product::create($params);
                }

                $this->rowsImported++;

            } catch (\Exception $e) {
                Log::error('Excel Import Row Error: ' . $e->getMessage() . ' | Data: ' . json_encode($data));
                $this->rowsSkipped++;
            }
        }
    }

    public function rules(): array
    {
        // We handle most validation inside the loop for better fallbacks,
        // but can keep basic type checking here.
        return [
            'name_en' => 'sometimes',
        ];
    }

    public function getSummary()
    {
        return [
            'imported' => $this->rowsImported,
            'skipped'  => $this->rowsSkipped,
        ];
    }

    public function getCsvSettings(): array
    {
        return [
            'delimiter' => ",", 
            'input_encoding' => 'UTF-8'
        ];
    }
}
