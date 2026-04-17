<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    private function checkAdmin($request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function index(Request $request)
    {
        $lang = $request->header('Accept-Language', 'ar');
        $isArabic = $lang === 'ar' || strpos($lang, 'ar') !== false;
        
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->get()
            ->map(function ($category) use ($isArabic) {
                $category->name = $isArabic 
                    ? ($category->name_ar ?? $category->name_en ?? $category->name)
                    : ($category->name_en ?? $category->name_ar ?? $category->name);
                return $category;
            });
        return response()->json($categories);
    }

    public function show(Request $request, $id)
    {
        $lang = $request->header('Accept-Language', 'ar');
        $isArabic = $lang === 'ar' || strpos($lang, 'ar') !== false;
        
        $category = Category::withCount('products')->findOrFail($id);
        $category->name = $isArabic 
            ? ($category->name_ar ?? $category->name_en ?? $category->name)
            : ($category->name_en ?? $category->name_ar ?? $category->name);
        return response()->json($category);
    }

    // Admin methods
    public function adminIndex(Request $request)
    {
        $this->checkAdmin($request);

        $query = Category::withCount('products');

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Sort
        if ($request->sort_by === 'name_asc') {
            $query->orderBy('name', 'asc');
        } elseif ($request->sort_by === 'name_desc') {
            $query->orderBy('name', 'desc');
        } elseif ($request->sort_by === 'products_asc') {
            $query->orderBy('products_count', 'asc');
        } elseif ($request->sort_by === 'products_desc') {
            $query->orderBy('products_count', 'desc');
        } else {
            $query->latest();
        }

        $perPage = $request->per_page ?? 10;
        $categories = $query->paginate($perPage);

        return response()->json($categories);
    }

    public function adminStore(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'admin_language' => 'nullable|string|in:ar,en',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        // Get the name entered by admin (from single name field)
        $enteredName = $request->name ?? $request->name_ar ?? $request->name_en;

        // At least one name must be provided
        if (empty(trim($enteredName))) {
            return response()->json(['message' => 'Category name is required'], 422);
        }

        // Get explicit language fields if provided
        $nameAr = $request->name_ar;
        $nameEn = $request->name_en;

        // Automatically generate translations - detects actual language of entered text
        $translations = TranslationService::generateCategoryTranslations($nameAr, $nameEn, $enteredName);
        $nameAr = $translations['name_ar'] ?? $nameAr ?? $enteredName;
        $nameEn = $translations['name_en'] ?? $nameEn ?? $enteredName;

        // Use the entered name for the main 'name' field (for backward compatibility)
        $name = $enteredName;

        // Generate unique slug based on the main name
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $category = Category::create([
            'name' => $name,
            'name_ar' => $nameAr,
            'name_en' => $nameEn,
            'slug' => $slug,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'is_active' => true,
        ]);

        return response()->json($category, 201);
    }

    public function adminUpdate(Request $request, $id)
    {
        $this->checkAdmin($request);

        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'admin_language' => 'nullable|string|in:ar,en',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $updateData = [];

        // Update description and image_url if provided
        if ($request->has('description')) {
            $updateData['description'] = $request->description;
        }
        if ($request->has('image_url')) {
            $updateData['image_url'] = $request->image_url;
        }

        // Handle name updates with automatic translation
        if ($request->has('name') || $request->has('name_ar') || $request->has('name_en')) {
            $enteredName = $request->name ?? $request->name_ar ?? $request->name_en ?? $category->name;
            
            // Get explicit language fields
            $nameAr = $request->has('name_ar') ? $request->name_ar : null;
            $nameEn = $request->has('name_en') ? $request->name_en : null;

            // If updating via single 'name' field, detect language and preserve the other
            if ($request->has('name') && !$request->has('name_ar') && !$request->has('name_en')) {
                // Detect the actual language of the entered text
                $isEnteredArabic = TranslationService::isArabic($enteredName);
                if ($isEnteredArabic) {
                    $nameAr = $enteredName;
                    $nameEn = $category->name_en; // Preserve existing English name
                } else {
                    $nameEn = $enteredName;
                    $nameAr = $category->name_ar; // Preserve existing Arabic name
                }
            } else {
                // If specific fields provided, preserve the other if not provided
                if ($request->has('name_ar') && !$request->has('name_en')) {
                    $nameEn = $category->name_en; // Preserve existing
                }
                if ($request->has('name_en') && !$request->has('name_ar')) {
                    $nameAr = $category->name_ar; // Preserve existing
                }
            }

            // Ensure both languages are set - generate missing translation if needed
            $finalTranslations = TranslationService::generateCategoryTranslations($nameAr, $nameEn, $enteredName);
            
            // Use generated translations, but fallback to existing if generation failed
            $updateData['name_ar'] = !empty($finalTranslations['name_ar']) ? $finalTranslations['name_ar'] : ($category->name_ar ?? $enteredName);
            $updateData['name_en'] = !empty($finalTranslations['name_en']) ? $finalTranslations['name_en'] : ($category->name_en ?? $enteredName);
            $updateData['name'] = $enteredName; // Use entered name for backward compatibility
            
            // Generate unique slug (only if name changed)
            if ($enteredName !== $category->name) {
                $baseSlug = Str::slug($enteredName);
                $slug = $baseSlug;
                $counter = 1;
                while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $updateData['slug'] = $slug;
            }
        }

        $category->update($updateData);

        return response()->json($category);
    }

    public function adminDestroy(Request $request, $id)
    {
        $this->checkAdmin($request);

        $category = Category::findOrFail($id);
        
        // Get count before detaching (for response)
        $productsCount = $category->products()->count();
        
        // Detach all products from this category (they may still be in other categories)
        $category->products()->detach();

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
            'products_detached' => $productsCount
        ]);
    }

    public function adminGetCategoryProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $category = Category::findOrFail($id);
        $products = $category->products()->get();

        return response()->json($products);
    }

    public function adminAttachProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $category = Category::findOrFail($id);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        // Attach products to category using many-to-many relationship
        // syncWithoutDetaching ensures products can be in multiple categories
        $category->products()->syncWithoutDetaching($request->product_ids);

        return response()->json([
            'message' => 'Products attached successfully',
            'attached_count' => count($request->product_ids)
        ]);
    }

    public function adminDetachProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $category = Category::findOrFail($id);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        // Detach products from category using many-to-many relationship
        $category->products()->detach($request->product_ids);

        return response()->json(['message' => 'Products detached successfully']);
    }
}
