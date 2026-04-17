<?php

namespace App\Http\Controllers;

use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(City::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'delivery_fee' => 'required|numeric|min:0',
        ]);

        $city = City::create($validated);
        return response()->json($city, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'name_ar' => 'string|max:255',
            'name_en' => 'string|max:255',
            'delivery_fee' => 'numeric|min:0',
        ]);

        $city->update($validated);
        return response()->json($city);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(City $city)
    {
        $city->delete();
        return response()->json(null, 204);
    }
}
