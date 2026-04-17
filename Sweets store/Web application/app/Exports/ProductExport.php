<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Product::with(['category', 'brand'])->get();
    }

    public function headings(): array
    {
        return [
            'name_en',
            'name_ar',
            'price',
            'stock_quantity',
            'description_en',
            'description_ar',
            'category_name',
            'category_name_ar',
            'brand_name',
            'brand_description'
        ];
    }

    /**
    * @var Product $product
    */
    public function map($product): array
    {
        return [
            $product->name_en,
            $product->name_ar,
            $product->price,
            $product->stock_quantity,
            $product->description_en,
            $product->description_ar,
            $product->category ? $product->category->name_en : '',
            $product->category ? $product->category->name_ar : '',
            $product->brand ? $product->brand->name : '',
            $product->brand ? $product->brand->description : ''
        ];
    }
}
