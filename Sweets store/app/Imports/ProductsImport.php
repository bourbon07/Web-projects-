<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProductsImport implements ToCollection, WithHeadingRow, WithCustomCsvSettings
{
    private int $importedCount = 0;
    private array $errors = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowIndex = $index + 2; // +1 for 0-index, +1 for heading row

            // Mapping exactly to the requested columns
            $data = [
                'name_english'          => $row['name_english'] ?? null,
                'name_arabic'           => $row['name_arabic'] ?? null,
                'price'                 => $row['price'] ?? null,
                'stock_quantity'        => $row['stock_quantity'] ?? 0,
                'description_english'   => $row['description_english'] ?? null,
                'description_arabic'    => $row['description_arabic'] ?? null,
                'category_name_english' => $row['category_name_english'] ?? 'General',
                'category_name_arabic'  => $row['category_name_arabic'] ?? 'عام',
                'brand_name'            => $row['brand_name'] ?? 'Enjoy Plus',
                'brand_description'     => $row['brand_description'] ?? 'Imported',
            ];

            // Validation rules
            $validator = Validator::make($data, [
                'name_english' => 'required|string|unique:products,name_en',
                'price'        => 'required|numeric',
            ], [
                'name_english.required' => 'name_english is required.',
                'name_english.unique'   => 'name_english already exists.',
                'price.required'        => 'Price is required.',
                'price.numeric'         => 'Price must be a number.',
            ]);

            if ($validator->fails()) {
                foreach ($validator->errors()->all() as $error) {
                    $this->errors[] = "Row {$rowIndex}: {$error}";
                }
                continue; // Skip this row
            }

            // Find or Create Category
            $category = Category::firstOrCreate(
                ['name_en' => $data['category_name_english']],
                ['name_ar' => $data['category_name_arabic']]
            );

            // Find or Create Brand
            $brand = Brand::firstOrCreate(
                ['name' => $data['brand_name']],
                ['description' => $data['brand_description']]
            );

            // Add Product
            Product::create([
                'name_en'        => $data['name_english'],
                'name_ar'        => $data['name_arabic'] ?? $data['name_english'], 
                'price'          => $data['price'],
                'description_en' => $data['description_english'],
                'description_ar' => $data['description_arabic'],
                'stock_quantity' => $data['stock_quantity'],
                'category_id'    => $category->id,
                'brand_id'       => $brand->id,
            ]);

            $this->importedCount++;
        }
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getCsvSettings(): array
    {
        return [
            'delimiter' => ",", 
            'input_encoding' => 'UTF-8'
        ];
    }
}
