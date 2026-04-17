<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CloudinaryController extends Controller
{
    /**
     * Get Cloudinary configuration from environment
     */
    private function getCloudinaryConfig()
    {
        // First, try to use CLOUDINARY_URL if available
        $cloudinaryUrl = env('CLOUDINARY_URL');
        
        if ($cloudinaryUrl) {
            return $cloudinaryUrl;
        }
        
        // Fallback to individual environment variables
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');
        
        if ($cloudName && $apiKey && $apiSecret) {
            return [
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key'    => $apiKey,
                    'api_secret' => $apiSecret,
                ],
            ];
        }
        
        return null;
    }

    /**
     * Check if Cloudinary is configured
     */
    private function isCloudinaryConfigured()
    {
        $cloudinaryUrl = env('CLOUDINARY_URL');
        if ($cloudinaryUrl) {
            return true;
        }
        
        return env('CLOUDINARY_CLOUD_NAME') && 
               env('CLOUDINARY_API_KEY') && 
               env('CLOUDINARY_API_SECRET');
    }

    /**
     * Extract cloud name from CLOUDINARY_URL or env
     */
    private function getCloudName()
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        if ($cloudName) {
            return $cloudName;
        }
        
        // Extract from CLOUDINARY_URL if available
        $cloudinaryUrl = env('CLOUDINARY_URL');
        if ($cloudinaryUrl && preg_match('/@([^\/]+)/', $cloudinaryUrl, $matches)) {
            return $matches[1] ?? null;
        }
        
        return null;
    }

    public function listImages()
    {
        try {
            // Check if Cloudinary class exists
            if (!class_exists(\Cloudinary\Cloudinary::class)) {
                return response()->json([
                    'message' => 'Cloudinary package not installed',
                    'images' => [],
                    'error' => 'Please install cloudinary/cloudinary_php package',
                ]);
            }

            // Check if Cloudinary is configured
            if (!$this->isCloudinaryConfigured()) {
                return response()->json([
                    'message' => 'Cloudinary credentials not configured',
                    'images' => [],
                    'error' => 'Please configure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env',
                ]);
            }

            // Get configuration
            $config = $this->getCloudinaryConfig();
            if (!$config) {
                return response()->json([
                    'message' => 'Cloudinary credentials not configured',
                    'images' => [],
                    'error' => 'Please configure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env',
                ]);
            }

            // Initialize Cloudinary client
            $cloudinary = new Cloudinary($config);

            // Get cloud name for URL construction
            $cloudName = $this->getCloudName();

            // Fetch resources (images) from Cloudinary
            $resources = $cloudinary->adminApi()->assets([
                'type' => 'upload',       // only uploaded images
                'resource_type' => 'image', 
                'max_results' => 100,     // max number of images to fetch
            ]);

            // Return the URLs
            $images = [];
            if (isset($resources['resources']) && is_array($resources['resources'])) {
            foreach ($resources['resources'] as $res) {
                    // Use secure_url if available, otherwise fallback to url
                    $imageUrl = $res['secure_url'] ?? $res['url'] ?? '';
                    
                    // If URL doesn't start with http, construct it
                    if (!empty($imageUrl) && !str_starts_with($imageUrl, 'http')) {
                        $publicId = $res['public_id'] ?? '';
                        $format = $res['format'] ?? '';
                        $imageUrl = "https://res.cloudinary.com/{$cloudName}/image/upload/{$publicId}.{$format}";
                    }
                    
                $images[] = [
                        'public_id' => $res['public_id'] ?? '',
                        'url' => $imageUrl,
                        'width' => $res['width'] ?? 0,
                        'height' => $res['height'] ?? 0,
                        'format' => $res['format'] ?? '',
                ];
            }
            }

            \Log::info('Cloudinary images fetched', [
                'count' => count($images),
                'cloud_name' => $cloudName,
            ]);

            return response()->json([
                'message' => 'Images fetched successfully',
                'images' => $images,
                'count' => count($images),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch images',
                'images' => [],
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
            'upload_to_cloudinary' => 'nullable|in:true,false,1,0,"true","false"', // Accept string or boolean
        ]);

        try {
            $uploadToCloudinary = $request->boolean('upload_to_cloudinary', false);
            
            // If Cloudinary is requested and configured, upload there
            if ($uploadToCloudinary) {
                // Check if Cloudinary is configured
                if (!class_exists(\Cloudinary\Cloudinary::class)) {
                    throw new \Exception('Cloudinary package not installed');
                }

                if (!$this->isCloudinaryConfigured()) {
                    throw new \Exception('Cloudinary credentials not configured. Please configure CLOUDINARY_URL or individual credentials in .env');
                }

                // Get configuration
                $config = $this->getCloudinaryConfig();
                if (!$config) {
                    throw new \Exception('Cloudinary credentials not configured');
                }

                // Initialize Cloudinary client
                $cloudinary = new Cloudinary($config);

                // Upload to Cloudinary
                $uploadResult = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'makateb-store',
                        'resource_type' => 'image',
                    ]
                );

                return response()->json([
                    'message' => 'Image uploaded to Cloudinary successfully',
                    'url' => $uploadResult['secure_url'] ?? $uploadResult['url'],
                    'public_id' => $uploadResult['public_id'],
                    'cloudinary' => true,
                ]);
            }

            // Otherwise, store locally
            $path = $request->file('image')->store('products', 'public');
            $url = Storage::disk('public')->url($path);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'url' => $url,
                'public_id' => $path,
                'cloudinary' => false,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
