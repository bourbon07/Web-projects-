<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Package;
use Illuminate\Database\Seeder;

class MockDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $cats = [
            ['name_ar' => 'أدوات التزيين', 'name_en' => 'Decoration Tools'],
            ['name_ar' => 'أدوات الخبيز', 'name_en' => 'Baking Tools'],
            ['name_ar' => 'أجهزة المطبخ', 'name_en' => 'Kitchen Appliances'],
            ['name_ar' => 'قوالب السيليكون', 'name_en' => 'Silicone Molds'],
        ];

        foreach ($cats as $cat) {
            Category::updateOrCreate(['name_en' => $cat['name_en']], $cat);
        }

        // 2. Brands
        $brands = [
            ['name' => 'Wilton'],
            ['name' => 'KitchenAid'],
            ['name' => 'Nordic Ware'],
            ['name' => 'Ateco'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['name' => $brand['name']], $brand);
        }

        // 3. Products
        $products = [
            [
                'category_id' => 1,
                'brand_id' => 1,
                'name_ar' => 'أكياس تزيين احترافية',
                'name_en' => 'Professional Piping Bags',
                'description_ar' => 'أكياس تزيين عالية الجودة للاستخدام المرة الواحدة',
                'description_en' => 'High quality disposable piping bags for cake decoration',
                'price' => 45.00,
                'stock_quantity' => 100,
                'image' => 'https://images.unsplash.com/photo-1631827561806-18c59d7fde38?w=800',
            ],
            [
                'category_id' => 3,
                'brand_id' => 2,
                'name_ar' => 'خلاط كيك احترافي',
                'name_en' => 'Professional Stand Mixer',
                'description_ar' => 'خلاط كهربائي قوي متعدد السرعات',
                'description_en' => 'Powerful multi-speed electric stand mixer',
                'price' => 380.00,
                'stock_quantity' => 15,
                'image' => 'https://images.unsplash.com/photo-1578845425669-b6562f83b11e?w=800',
            ],
            [
                'category_id' => 4,
                'brand_id' => 3,
                'name_ar' => 'قالب باوند كيك',
                'name_en' => 'Bundt Cake Pan',
                'description_ar' => 'قالب خبز من الألمنيوم المصبوب بتصميم كلاسيكي',
                'description_en' => 'Cast aluminum baking pan with classic design',
                'price' => 65.00,
                'stock_quantity' => 25,
                'image' => 'https://images.unsplash.com/photo-1625207336348-1d1c31a6bd36?w=800',
            ],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['name_en' => $p['name_en']], $p);
        }

        // 4. Packages
        $p1 = Package::updateOrCreate(['name_en' => 'Starter Decoration Bundle'], [
            'name_ar' => 'باقة التزيين المبتدئة',
            'name_en' => 'Starter Decoration Bundle',
            'description_ar' => 'تشمل أكياس تزيين وأقماع منوعة وأدوات تنعيم الكيك',
            'description_en' => 'Includes piping bags, various tips, and cake smoothers',
            'price' => 120.00,
            'image' => 'https://images.unsplash.com/photo-1712723246766-3eaea22e52ff?w=800',
        ]);

        $p1->products()->attach([1, 2]);
    }
}
