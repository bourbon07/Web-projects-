<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Proxies chat messages to the Flowise AI endpoint.
     * All internal AI logic and personas have been removed to ensure the AI's 
     * character is managed entirely within the Flowise chatflow.
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message'    => 'required|string',
            'user_name'  => 'nullable|string',
            'session_id' => 'nullable|string',
        ]);

        set_time_limit(120);
        try {
            $url = env('FLOWISE_CHAT_URL', 'http://127.0.0.1:3000/api/v1/prediction/e3bc3187-8684-41ad-aba7-59d64e41833e');
            $apiKey = env('FLOWISE_API_KEY');
            
            $headers = [
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ];

            if ($apiKey && $apiKey !== 'your_secure_api_key_here') {
                $headers['Authorization'] = "Bearer {$apiKey}";
            }

            // Prepare minimal body to avoid configuration conflicts
            $body = [
                'question' => $request->message,
            ];

            // Only add overrideConfig if specific values are present in .env
            $googleKey = env('FLOWISE_GOOGLE_API_KEY', env('GOOGLE_API_KEY'));
            if ($googleKey || env('FLOWISE_MODEL_NAME')) {
                $body['overrideConfig'] = [
                    'sessionId' => $request->session_id ?? 'default_session',
                ];
                if ($googleKey) $body['overrideConfig']['googleGenerativeAPIKey'] = $googleKey;
                if (env('FLOWISE_MODEL_NAME')) $body['overrideConfig']['modelName'] = env('FLOWISE_MODEL_NAME');
            }

            $response = Http::withHeaders($headers)
                ->timeout(90) // Increased to 90s
                ->post($url, $body);

            // If Flowise returns an error, pass that specific error through to the frontend
            if (!$response->successful()) {
                $errorData = $response->json();
                $errorMessage = $errorData['message'] ?? $errorData['error'] ?? "Flowise API Error (Status: {$response->status()})";
                throw new \Exception($errorMessage);
            }

            // Return the raw JSON from Flowise directly to the React frontend
            return response()->json($response->json());

        } catch (\Exception $e) {
            Log::error("Shehab Proxy Error: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'url'   => $url ?? 'unknown'
            ]);
            
            return response()->json([
                'text'    => $e->getMessage(),
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
