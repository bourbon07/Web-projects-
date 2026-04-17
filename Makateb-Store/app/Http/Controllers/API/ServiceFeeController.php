<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ServiceFee;
use Illuminate\Http\Request;

class ServiceFeeController extends Controller
{
    private function checkAdmin($request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function get()
    {
        $serviceFee = ServiceFee::first();
        if (!$serviceFee) {
            // Create default service fee if none exists
            $serviceFee = ServiceFee::create(['fee' => 0]);
        }
        return response()->json($serviceFee);
    }

    // Admin methods
    public function adminGet(Request $request)
    {
        $this->checkAdmin($request);

        $serviceFee = ServiceFee::first();
        if (!$serviceFee) {
            $serviceFee = ServiceFee::create(['fee' => 0]);
        }
        return response()->json($serviceFee);
    }

    public function adminUpdate(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'fee' => 'required|numeric|min:0',
        ]);

        $serviceFee = ServiceFee::first();
        if (!$serviceFee) {
            $serviceFee = ServiceFee::create(['fee' => $request->fee]);
        } else {
            $serviceFee->update(['fee' => $request->fee]);
        }

        return response()->json($serviceFee);
    }
}
