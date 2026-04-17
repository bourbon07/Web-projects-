<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Package;
use App\Models\User;
use App\Models\Order;
use App\Models\Category;
use App\Models\Brand;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Requests\Admin\BanUserRequest;
use App\Http\Requests\Admin\StorePackageRequest;
use App\Http\Requests\Admin\UpdatePackageRequest;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\PackageResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\BrandResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Monthly Sales & Orders (Last 6 months)
        $salesData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $sales = Order::where('status', 'delivered')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total_price');
            $orders = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            
            $salesData[] = [
                'monthAr' => $month->translatedFormat('F'),
                'monthEn' => $month->format('F'),
                'sales' => (float)$sales,
                'orders' => $orders
            ];
        }

        // Category Distribution
        $topCategories = Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->take(4)
            ->get();
        
        $totalProducts = Product::count();
        $categoryData = $topCategories->map(function($cat) use ($totalProducts) {
            return [
                'nameAr' => $cat->name_ar,
                'nameEn' => $cat->name_en,
                'value' => $totalProducts > 0 ? round(($cat->products_count / $totalProducts) * 100) : 0,
                'color' => sprintf('#%06X', mt_rand(0, 0xFFFFFF)) // Random colors for now or we could use a palette
            ];
        });
        
        // Ensure static colors for first few items for look & feel
        $colors = ["#E5233B", "#FF6B8A", "#FFDDE4", "#FFB3BF"];
        foreach($categoryData as $idx => &$item) {
            if(isset($colors[$idx])) $item['color'] = $colors[$idx];
        }

        return response()->json([
            'stats' => [
                'total_products' => $totalProducts,
                'total_packages' => Package::count(),
                'total_users' => User::count(),
                'total_orders' => Order::count(),
                'total_reviews' => Review::count(),
                'total_sales' => (float)Order::where('status', 'delivered')->sum('total_price'),
            ],
            'sales_chart' => $salesData,
            'category_chart' => $categoryData,
            'recent_orders' => OrderResource::collection(Order::with('user')->latest()->take(5)->get()),
            'out_of_stock' => ProductResource::collection(Product::where('stock_quantity', '<=', 0)->get()),
        ]);
    }

    public function indexReviews()
    {
        return ReviewResource::collection(Review::with(['user', 'product', 'package'])->latest()->get());
    }

    public function destroyReview(Request $request, $id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Review deleted successfully']);
    }

    public function indexOrders()
    {
        $orders = Order::with(['user', 'orderItems.product.media', 'orderItems.package.media'])->latest()->get();
        return OrderResource::collection($orders);
    }

    public function showOrder($id)
    {
        $order = Order::with(['user', 'orderItems.product.media', 'orderItems.package.media'])->findOrFail($id);
        return new OrderResource($order);
    }

    public function indexCategories()
    {
        return CategoryResource::collection(Category::all());
    }

    public function indexBrands()
    {
        return BrandResource::collection(Brand::all());
    }

    public function storeProduct(StoreProductRequest $request)
    {
        $data = $request->validated();
        unset($data['image']);
        $product = Product::create($data);

        if ($request->hasFile('image')) {
            $product->addMediaFromRequest('image')->toMediaCollection('images');
        } elseif ($request->image_url) {
            $product->image = $request->image_url;
            $product->save();
        }

        return new ProductResource($product);
    }

    public function updateProduct(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->validated();
        unset($data['image']);
        $product->update($data);

        if ($request->hasFile('image')) {
            $product->clearMediaCollection('images');
            $product->addMediaFromRequest('image')->toMediaCollection('images');
        } elseif ($request->image_url) {
            $product->image = $request->image_url;
            $product->save();
        }

        return new ProductResource($product);
    }

    public function destroyProduct(Request $request, $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function storePackage(StorePackageRequest $request)
    {
        $data = $request->validated();
        unset($data['image']);
        $package = Package::create($data);

        if ($request->hasFile('image')) {
            $package->addMediaFromRequest('image')->toMediaCollection('images');
        } elseif ($request->image_url) {
            $package->image = $request->image_url;
            $package->save();
        }

        if ($request->product_ids) {
            $package->products()->sync($request->product_ids);
        }

        return new PackageResource($package->load('products'));
    }

    public function updatePackage(UpdatePackageRequest $request, $id)
    {
        $package = Package::findOrFail($id);
        $data = $request->validated();
        unset($data['image']);
        $package->update($data);

        if ($request->hasFile('image')) {
            $package->clearMediaCollection('images');
            $package->addMediaFromRequest('image')->toMediaCollection('images');
        } elseif ($request->image_url) {
            $package->image = $request->image_url;
            $package->save();
        }

        if ($request->product_ids) {
            $package->products()->sync($request->product_ids);
        }

        return new PackageResource($package->load('products'));
    }

    public function destroyPackage(Request $request, $id)
    {
        Package::findOrFail($id)->delete();
        return response()->json(['message' => 'Package deleted successfully']);
    }

    public function storeCategory(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());
        return new CategoryResource($category);
    }

    public function updateCategory(UpdateCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());
        return new CategoryResource($category);
    }

    public function destroyCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete category with products'], 422);
        }
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }

    public function storeBrand(StoreBrandRequest $request)
    {
        $brand = Brand::create($request->validated());
        if ($request->hasFile('logo')) {
            $brand->addMediaFromRequest('logo')->toMediaCollection('logos');
        }
        return new BrandResource($brand);
    }

    public function updateBrand(UpdateBrandRequest $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $brand->update($request->validated());
        if ($request->hasFile('logo')) {
            $brand->clearMediaCollection('logos');
            $brand->addMediaFromRequest('logo')->toMediaCollection('logos');
        }
        return new BrandResource($brand);
    }

    public function destroyBrand(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        if ($brand->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete brand with products'], 422);
        }
        $brand->delete();
        return response()->json(['message' => 'Brand deleted successfully']);
    }

    public function indexUsers()
    {
        return UserResource::collection(User::latest()->get());
    }

    public function toggleUserBan(Request $request, $id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'Admin') {
            return response()->json(['message' => 'Cannot ban admin users'], 422);
        }
        $user->is_banned = !$user->is_banned;
        $user->save();
        
        $msg = $user->is_banned ? 'User banned successfully' : 'User unbanned successfully';
        return response()->json(['message' => $msg, 'is_banned' => $user->is_banned]);
    }

    public function updateOrderStatus(UpdateOrderStatusRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->status = $request->validated()['status'];
        $order->save();

        return new OrderResource($order);
    }

    public function destroyOrder(Request $request, $id)
    {
        Order::findOrFail($id)->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function getSettings()
    {
        return response()->json([
            'site_name' => Setting::getValue('site_name', 'Enjoy Plus'),
            'site_logo' => Setting::getValue('site_logo') ? asset('storage/' . Setting::getValue('site_logo')) : null,
        ]);
    }

    public function updateSettings(Request $request)
    {
        try {
            \Log::info("Settings Update Request", $request->all());

            if ($request->has('site_name')) {
                Setting::setValue('site_name', $request->site_name);
            }

            if ($request->remove_logo) {
                $oldLogo = Setting::getValue('site_logo');
                if ($oldLogo) {
                    Storage::disk('public')->delete($oldLogo);
                }
                Setting::setValue('site_logo', null);
            } elseif ($request->hasFile('site_logo')) {
                $path = $request->file('site_logo')->store('settings', 'public');
                
                // Delete old logo if exists
                $oldLogo = Setting::getValue('site_logo');
                if ($oldLogo) {
                    Storage::disk('public')->delete($oldLogo);
                }

                Setting::setValue('site_logo', $path);
            }

            return $this->getSettings();
        } catch (\Exception $e) {
            \Log::error("Settings Update Failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to save settings: ' . $e->getMessage()], 500);
        }
    }
}
