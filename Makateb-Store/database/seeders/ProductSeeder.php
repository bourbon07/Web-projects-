<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch images from Cloudinary
        $images = $this->fetchCloudinaryImages();

        // Create products (32 total)
        $productNames = [
            'Wireless Headphones',
            'Smart Watch',
            'Laptop Stand',
            'USB-C Cable',
            'Phone Case',
            'Wireless Mouse',
            'Keyboard',
            'Monitor Stand',
            'Desk Lamp',
            'Webcam',
            'Microphone',
            'Speaker',
            'Tablet Stand',
            'Charging Pad',
            'Cable Organizer',
            'Desk Mat',
            'Laptop Bag',
            'Backpack',
            'Water Bottle',
            'Coffee Mug',
            'Notebook',
            'Pen Set',
            'Sticky Notes',
            'File Organizer',
            'Desk Fan',
            'Air Purifier',
            'Plant Pot',
            'Wall Clock',
            'Photo Frame',
            'Desk Calendar',
            'Bookend',
            'Desk Organizer',
        ];

        $descriptions = [
            'High-quality product with excellent features and durability.',
            'Premium design with modern aesthetics and functionality.',
            'Perfect for everyday use with reliable performance.',
            'Innovative solution for your needs with great value.',
        ];

        $prices = [9.99, 19.99, 29.99, 39.99, 49.99, 59.99, 69.99, 79.99, 89.99, 99.99];

        for ($i = 0; $i < 32; $i++) {
            $imageIndex = ($i % count($images));
            $imageUrl = $images[$imageIndex]['url'] ?? null;
            $descriptionIndex = $i % count($descriptions);

            Product::firstOrCreate(
                [
                    'slug' => Str::slug($productNames[$i] . '-' . $i),
                ],
                [
                    'name' => $productNames[$i],
                    'description' => $descriptions[$descriptionIndex],
                    'price' => $prices[array_rand($prices)],
                    'stock' => rand(10, 100),
                    'is_active' => true,
                    'seller_id' => null,
                    'image_url' => $imageUrl,
                ]
            );
        }
    }

    private function fetchCloudinaryImages(): array
    {
        try {
            if (!class_exists(\Cloudinary\Cloudinary::class)) {
                return array_fill(0, 32, ['url' => 'https://via.placeholder.com/400']);
            }

            // Get Cloudinary configuration - prefer CLOUDINARY_URL, fallback to individual vars
            $cloudinaryUrl = env('CLOUDINARY_URL');
            $config = $cloudinaryUrl;

            if (!$config) {
                // Fallback to individual environment variables
                $cloudName = env('CLOUDINARY_CLOUD_NAME');
                $apiKey = env('CLOUDINARY_API_KEY');
                $apiSecret = env('CLOUDINARY_API_SECRET');

                if ($cloudName && $apiKey && $apiSecret) {
                    $config = [
                        'cloud' => [
                            'cloud_name' => $cloudName,
                            'api_key' => $apiKey,
                            'api_secret' => $apiSecret,
                        ],
                    ];
                } else {
                    return array_fill(0, 32, ['url' => 'https://via.placeholder.com/400']);
                }
            }

            $cloudinary = new \Cloudinary\Cloudinary($config);

            $resources = $cloudinary->adminApi()->assets([
                'type' => 'upload',
                'resource_type' => 'image',
                'max_results' => 50,
            ]);

            $images = [];
            foreach ($resources['resources'] as $res) {
                $images[] = [
                    'url' => $res['secure_url'],
                ];
            }

            return count($images) > 0 ? $images : array_fill(0, 32, ['url' => 'https://via.placeholder.com/400']);
        } catch (\Exception $e) {
            // If Cloudinary fails, return placeholder URLs
            return array_fill(0, 32, ['url' => 'https://via.placeholder.com/400']);
        }
    }
}
