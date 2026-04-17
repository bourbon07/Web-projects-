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
        // ============================================================
        // 1. CATEGORIES (5 Categories)
        // ============================================================
        $cats = [
            ['name_ar' => 'أدوات تزيين الكيك', 'name_en' => 'Cake Decorating Tools', 'icon' => '🎂'],
            ['name_ar' => 'أدوات الخبيز',      'name_en' => 'Baking Tools',           'icon' => '🍞'],
            ['name_ar' => 'أجهزة المطبخ',      'name_en' => 'Kitchen Appliances',     'icon' => '🔌'],
            ['name_ar' => 'قوالب وصواني',      'name_en' => 'Molds & Pans',           'icon' => '🧁'],
            ['name_ar' => 'مكونات الخبيز',     'name_en' => 'Baking Ingredients',     'icon' => '🥄'],
        ];

        $categoryMap = [];
        foreach ($cats as $cat) {
            $c = Category::updateOrCreate(['name_en' => $cat['name_en']], $cat);
            $categoryMap[$cat['name_en']] = $c->id;
        }

        // ============================================================
        // 2. BRANDS
        // ============================================================
        $brands = [
            ['name' => 'Wilton'],
            ['name' => 'KitchenAid'],
            ['name' => 'Ateco'],
        ];

        $brandMap = [];
        foreach ($brands as $brand) {
            $b = Brand::updateOrCreate(['name' => $brand['name']], $brand);
            $brandMap[$brand['name']] = $b->id;
        }

        // ============================================================
        // 3. PRODUCTS (8 Products)
        // ============================================================
        $products = [
            [
                'category_id' => $categoryMap['Cake Decorating Tools'],
                'brand_id' => $brandMap['Wilton'],
                'name_ar' => 'أكياس تزيين احترافية',
                'name_en' => 'Professional Piping Bags',
                'description_ar' => 'أكياس تزيين شفافة عالية الجودة للاستخدام مرة واحدة.',
                'description_en' => 'High quality transparent disposable piping bags.',
                'price' => 15.00,
                'stock_quantity' => 200,
                'image' => 'https://images.unsplash.com/photo-1631827561806-18c59d7fde38?w=600',
            ],
            [
                'category_id' => $categoryMap['Cake Decorating Tools'],
                'brand_id' => $brandMap['Ateco'],
                'name_ar' => 'طقم أقماع تزيين ستانلس',
                'name_en' => 'Stainless Steel Decorating Tips Set',
                'description_ar' => 'مجموعة أقماع تزيين من الاستانلس ستيل الغذائي.',
                'description_en' => 'Food-grade stainless steel decorating tips.',
                'price' => 35.00,
                'stock_quantity' => 80,
                'image' => 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600',
            ],
            [
                'category_id' => $categoryMap['Baking Tools'],
                'brand_id' => $brandMap['Wilton'],
                'name_ar' => 'مضرب خفق يدوي',
                'name_en' => 'Hand Whisk',
                'description_ar' => 'مضرب خفق يدوي احترافي بـ 12 سلكًا.',
                'description_en' => 'Professional hand whisk with 12 wires.',
                'price' => 8.00,
                'stock_quantity' => 200,
                'image' => 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600',
            ],
            [
                'category_id' => $categoryMap['Kitchen Appliances'],
                'brand_id' => $brandMap['KitchenAid'],
                'name_ar' => 'خلاط كيك كهربائي',
                'name_en' => 'Professional Stand Mixer',
                'description_ar' => 'خلاط كيك كهربائي بقوة 800 واط مع 10 سرعات.',
                'description_en' => '800W stand mixer with 10 speeds.',
                'price' => 380.00,
                'stock_quantity' => 15,
                'image' => 'https://images.unsplash.com/photo-1578845425669-b6562f83b11e?w=600',
            ],
            [
                'category_id' => $categoryMap['Molds & Pans'],
                'brand_id' => $brandMap['Wilton'],
                'name_ar' => 'قوالب سيليكون كب كيك',
                'name_en' => 'Silicone Cupcake Molds',
                'description_ar' => 'قالب كب كيك من السيليكون الغذائي المرن.',
                'description_en' => 'Flexible food-grade silicone cupcake mold.',
                'price' => 18.00,
                'stock_quantity' => 100,
                'image' => 'https://images.unsplash.com/photo-1625207336348-1d1c31a6bd36?w=600',
            ],
            [
                'category_id' => $categoryMap['Baking Ingredients'],
                'brand_id' => $brandMap['Wilton'],
                'name_ar' => 'شوكولاتة بلجيكية فاخرة',
                'name_en' => 'Premium Belgian Chocolate',
                'description_ar' => 'شوكولاتة بلجيكية داكنة 72% كاكاو.',
                'description_en' => '72% dark Belgian chocolate.',
                'price' => 28.00,
                'stock_quantity' => 100,
                'image' => 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600',
            ],
            [
                'category_id' => $categoryMap['Kitchen Appliances'],
                'brand_id' => $brandMap['KitchenAid'],
                'name_ar' => 'خلاط يدوي كهربائي',
                'name_en' => 'Electric Hand Mixer',
                'description_ar' => 'خلاط يدوي خفيف بقوة 300 واط.',
                'description_en' => 'Lightweight 300W hand mixer.',
                'price' => 55.00,
                'stock_quantity' => 40,
                'image' => 'https://images.unsplash.com/photo-1578845425669-b6562f83b11e?w=600',
            ],
            [
                'category_id' => $categoryMap['Baking Tools'],
                'brand_id' => $brandMap['Ateco'],
                'name_ar' => 'ترمومتر حلويات رقمي',
                'name_en' => 'Digital Candy Thermometer',
                'description_ar' => 'ترمومتر رقمي لقياس درجة حرارة السكر والكراميل.',
                'description_en' => 'Digital thermometer for sugar and caramel temperatures.',
                'price' => 18.00,
                'stock_quantity' => 70,
                'image' => 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600',
            ],
        ];

        $productModels = [];
        foreach ($products as $p) {
            $prod = Product::updateOrCreate(['name_en' => $p['name_en']], $p);
            $productModels[] = $prod;
        }

        // ============================================================
        // 4. PACKAGES (3 Packages)
        // ============================================================
        $p1 = Package::updateOrCreate(['name_en' => 'Cake Decorator Starter Kit'], [
            'name_ar' => 'باقة مبتدئ تزيين الكيك',
            'name_en' => 'Cake Decorator Starter Kit',
            'description_ar' => 'كل ما تحتاجه للبدء في تزيين الكيك.',
            'description_en' => 'Everything you need to start cake decorating.',
            'price' => 45.00,
            'stock_quantity' => 25,
            'image' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        ]);

        $p2 = Package::updateOrCreate(['name_en' => 'Professional Baker Bundle'], [
            'name_ar' => 'باقة الخباز المحترف',
            'name_en' => 'Professional Baker Bundle',
            'description_ar' => 'مجموعة أدوات احترافية للخباز المتميز.',
            'description_en' => 'Professional tool set for the serious baker.',
            'price' => 420.00,
            'stock_quantity' => 8,
            'image' => 'https://images.unsplash.com/photo-1578845425669-b6562f83b11e?w=600',
        ]);

        $p3 = Package::updateOrCreate(['name_en' => 'Baking Essentials Kit'], [
            'name_ar' => 'باقة أساسيات الخبيز',
            'name_en' => 'Baking Essentials Kit',
            'description_ar' => 'أساسيات المطبخ لصنع أشهى الحلويات.',
            'description_en' => 'Kitchen essentials for making delicious treats.',
            'price' => 60.00,
            'stock_quantity' => 20,
            'image' => 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600',
        ]);

        // Attach products
        $p1->products()->sync([$productModels[0]->id, $productModels[1]->id]);
        $p2->products()->sync([$productModels[3]->id, $productModels[6]->id]);
        $p3->products()->sync([$productModels[2]->id, $productModels[5]->id, $productModels[7]->id]);
    }
}
