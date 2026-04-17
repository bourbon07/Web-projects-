<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DeliveryFee;
use Illuminate\Http\Request;

class DeliveryFeeController extends Controller
{
    private function checkAdmin($request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function index()
    {
        $deliveryFees = DeliveryFee::orderBy('location')->get();
        return response()->json($deliveryFees);
    }

    public function getByLocation($location)
    {
        $deliveryFee = DeliveryFee::where('location', $location)
            ->where('is_active', true)
            ->first();

        if (!$deliveryFee) {
            // Return default fee if location not found
            return response()->json([
                'location' => $location,
                'fee' => 15.00, // Default fee
                'is_default' => true,
            ]);
        }

        return response()->json($deliveryFee);
    }

    // Admin methods
    public function adminIndex(Request $request)
    {
        $this->checkAdmin($request);

        $deliveryFees = DeliveryFee::orderBy('location')->get();
        return response()->json($deliveryFees);
    }

    public function adminStore(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'location' => 'required|string|max:255|unique:delivery_fees,location',
            'fee' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $deliveryFee = DeliveryFee::create([
            'location' => $request->location,
            'fee' => $request->fee,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json($deliveryFee, 201);
    }

    public function adminUpdate(Request $request, $id)
    {
        $this->checkAdmin($request);

        $deliveryFee = DeliveryFee::findOrFail($id);

        $request->validate([
            'location' => 'sometimes|string|max:255|unique:delivery_fees,location,' . $id,
            'fee' => 'sometimes|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $deliveryFee->update($request->only(['location', 'fee', 'is_active']));

        return response()->json($deliveryFee);
    }

    public function adminDestroy(Request $request, $id)
    {
        $this->checkAdmin($request);

        $deliveryFee = DeliveryFee::findOrFail($id);
        $deliveryFee->delete();

        return response()->json(['message' => 'Delivery fee deleted successfully']);
    }
}
