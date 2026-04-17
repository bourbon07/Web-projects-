<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    private function checkAdmin($request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function index(Request $request)
    {
        $packages = Package::withCount('products')
            ->where('is_active', true)
            ->get();

        return response()->json($packages);
    }

    public function show(Request $request, $id)
    {
        $package = Package::with(['products' => function($q) {
            $q->where('is_active', true);
        }])->withCount('products')->findOrFail($id);
        
        return response()->json($package);
    }

    public function products($id)
    {
        $package = Package::findOrFail($id);
        $products = $package->products()
            ->where('is_active', true)
            ->get()
            ->map(function($product) {
                // Add description_ar and description_en fields (fallback to description if not exists)
                if (!isset($product->description_ar)) {
                    $product->description_ar = $product->description ?? null;
                }
                if (!isset($product->description_en)) {
                    $product->description_en = $product->description ?? null;
                }
                return $product;
            });

        return response()->json($products);
    }

    // Admin methods
    public function adminIndex(Request $request)
    {
        $this->checkAdmin($request);

        $query = Package::withCount('products');

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Get all packages (no pagination for admin management page)
        $packages = $query->latest()->get();

        // Transform to include calculated price
        $packages = $packages->map(function($package) {
            if (!$package->price) {
                $totalPrice = $package->products()->sum('price');
                $package->price = $totalPrice;
            }
            return $package;
        });

        return response()->json($packages);
    }

    public function adminStore(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'options' => 'nullable|array',
        ]);

        // At least one name must be provided
        if (!$request->name && !$request->name_ar && !$request->name_en) {
            return response()->json(['message' => 'At least one name (name, name_ar, or name_en) is required'], 422);
        }

        // Use name_ar or name_en if name is not provided
        $name = $request->name ?? $request->name_ar ?? $request->name_en;
        $nameAr = $request->name_ar ?? $request->name;
        $nameEn = $request->name_en ?? $request->name;

        // Generate unique slug
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;
        while (Package::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $package = Package::create([
            'name' => $name,
            'name_ar' => $nameAr,
            'name_en' => $nameEn,
            'slug' => $slug,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'price' => $request->price,
            'stock' => $request->stock ?? 0,
            'is_active' => $request->is_active ?? true,
            'options' => $request->options,
        ]);

        // Attach products if provided
        if ($request->has('product_ids') && is_array($request->product_ids) && count($request->product_ids) > 0) {
            $package->products()->sync($request->product_ids);
        }

        $package->loadCount('products');

        return response()->json($package, 201);
    }

    public function adminUpdate(Request $request, $id)
    {
        $this->checkAdmin($request);

        $package = Package::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
            'price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'options' => 'nullable|array',
        ]);

        $updateData = $request->only(['description', 'image_url', 'price', 'stock', 'is_active', 'name_ar', 'name_en', 'options']);
        
        // Update name and slug if any name field is provided
        if ($request->has('name') || $request->has('name_ar') || $request->has('name_en')) {
            $name = $request->name ?? $request->name_ar ?? $request->name_en ?? $package->name;
            $updateData['name'] = $name;
            
            // Generate unique slug (only if name changed)
            if ($name !== $package->name) {
                $baseSlug = Str::slug($name);
                $slug = $baseSlug;
                $counter = 1;
                while (Package::where('slug', $slug)->where('id', '!=', $package->id)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                $updateData['slug'] = $slug;
            }
            
            // If name_ar or name_en is not provided, use the main name
            if (!$request->has('name_ar') && !$package->name_ar) {
                $updateData['name_ar'] = $name;
            }
            if (!$request->has('name_en') && !$package->name_en) {
                $updateData['name_en'] = $name;
            }
        }

        $package->update($updateData);

        // Sync products if provided
        if ($request->has('product_ids') && is_array($request->product_ids)) {
            $package->products()->sync($request->product_ids);
        }

        $package->loadCount('products');

        return response()->json($package);
    }

    public function adminDestroy(Request $request, $id)
    {
        $this->checkAdmin($request);

        $package = Package::findOrFail($id);
        $package->delete();

        return response()->json(['message' => 'Package deleted successfully']);
    }

    public function adminAttachProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $package = Package::findOrFail($id);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $package->products()->syncWithoutDetaching($request->product_ids);

        return response()->json(['message' => 'Products attached successfully']);
    }

    public function adminDetachProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $package = Package::findOrFail($id);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $package->products()->detach($request->product_ids);

        return response()->json(['message' => 'Products detached successfully']);
    }

    public function adminSyncProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $package = Package::findOrFail($id);

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $package->products()->sync($request->product_ids);

        return response()->json(['message' => 'Products synced successfully']);
    }

    public function adminGetPackageProducts(Request $request, $id)
    {
        $this->checkAdmin($request);

        $package = Package::findOrFail($id);
        $products = $package->products()->get();

        return response()->json($products);
    }

}

