<?php

namespace App\Services;

use App\Models\Program;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PricingService
{
    protected string $apiUrl;
    protected int $timeout;
    protected bool $useFallback;

    public function __construct()
    {
        $this->apiUrl = config('services.pricing_api.url', 'http://127.0.0.1:9000');
        $this->timeout = config('services.pricing_api.timeout', 3);
        $this->useFallback = config('services.pricing_api.fallback', true);
    }

    /**
     * Check if the pricing API is healthy and accessible
     */
    public function isApiHealthy(): bool
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get($this->apiUrl . '/health');

            return $response->successful() &&
                   ($response->json('status') === 'healthy' || $response->json('status') === 'running');
        } catch (\Exception $e) {
            Log::warning('Pricing API health check failed', [
                'error' => $e->getMessage(),
                'url' => $this->apiUrl
            ]);

            return false;
        }
    }

    /**
     * Calculate price using the dynamic pricing API
     */
    public function calculatePrice(
        string $programId,
        int $sessionCount,
        string $setting = 'online',
        ?string $startDate = null,
        ?string $startTime = null
    ): ?array {
        try {
            // Get the program from database to get its actual price and min sessions
            $program = Program::where('prog_id', $programId)->first();

            if (!$program) {
                Log::error('Program not found for pricing calculation', ['program_id' => $programId]);
                return null;
            }

            // Validate minimum sessions
            if ($sessionCount < $program->session_count) {
                Log::warning('Session count is less than program minimum', [
                    'program_id' => $programId,
                    'requested' => $sessionCount,
                    'minimum' => $program->session_count
                ]);
                return null;
            }

            // Check if API is healthy
            if (!$this->isApiHealthy()) {
                Log::info('Pricing API unavailable, using fallback calculation');
                return $this->calculateFallbackPrice($program, $sessionCount, $setting, $startDate, $startTime);
            }

            // Call the FastAPI service with minimum sessions
            $response = Http::timeout($this->timeout)
                ->post($this->apiUrl . '/calculate-price', [
                    'program_type' => $program->prog_type,
                    'session_count' => $sessionCount,
                    'setting' => $setting,
                    'start_date' => $startDate,
                    'start_time' => $startTime,
                    'min_sessions' => $program->session_count,
                ]);

            if ($response->successful()) {
                $apiResult = $response->json();

                // Override the base_price with the actual program price from database
                $basePrice = floatval($program->price);
                $sessionMultiplier = $apiResult['final_price'] / ($apiResult['base_price'] * $sessionCount);

                // Recalculate final price using actual program price
                $finalPrice = $basePrice * $sessionCount * $sessionMultiplier;
                $originalPrice = $basePrice * $sessionCount;
                $totalDiscount = (($originalPrice - $finalPrice) / $originalPrice) * 100;

                return [
                    'base_price' => $basePrice,
                    'session_discount' => $apiResult['session_discount'],
                    'setting_discount' => $apiResult['setting_discount'],
                    'time_discount' => $apiResult['time_discount'] ?? 0,
                    'day_discount' => $apiResult['day_discount'] ?? 0,
                    'total_discount' => round($totalDiscount, 2),
                    'final_price' => round($finalPrice, 2),
                    'price_per_session' => round($finalPrice / $sessionCount, 2),
                    'original_sessions' => $sessionCount,
                    'requested_sessions' => $sessionCount,
                    'min_sessions_required' => $program->session_count,
                    'discount_tier' => $apiResult['discount_tier'] ?? null
                ];
            }

            Log::warning('Pricing API returned error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return $this->calculateFallbackPrice($program, $sessionCount, $setting, $startDate, $startTime);

        } catch (\Exception $e) {
            Log::error('Failed to call pricing API', [
                'error' => $e->getMessage(),
                'program_id' => $programId,
                'session_count' => $sessionCount
            ]);

            // Get program for fallback calculation
            $program = Program::where('prog_id', $programId)->first();
            if ($program) {
                return $this->calculateFallbackPrice($program, $sessionCount, $setting, $startDate, $startTime);
            }

            return null;
        }
    }

    /**
     * Fallback pricing calculation when API is unavailable
     */
    protected function calculateFallbackPrice(
        Program $program,
        int $sessionCount,
        string $setting = 'online',
        ?string $startDate = null,
        ?string $startTime = null
    ): array {
        // Validate minimum sessions
        if ($sessionCount < $program->session_count) {
            throw new \Exception("Session count must be at least {$program->session_count}");
        }

        // Use the actual program price from database
        $basePrice = floatval($program->price);
        $minSessions = $program->session_count;

        // Calculate session multiplier based on multiples of minimum sessions
        $multiple = $sessionCount / $minSessions;

        if ($multiple >= 3) {
            $sessionMultiplier = 0.95; // 5% discount
            $sessionDiscount = 5;
            $discountTier = 'triple_plus';
        } elseif ($multiple >= 2) {
            $sessionMultiplier = 0.97; // 3% discount
            $sessionDiscount = 3;
            $discountTier = 'double';
        } else {
            $sessionMultiplier = 1.0; // No discount
            $sessionDiscount = 0;
            $discountTier = 'minimum';
        }

        // Setting multipliers (should match Python API: online = discount, onsite = no discount)
        $settingMultipliers = [
            'online' => 0.9,   // 10% discount for online
            'onsite' => 1.0,  // No discount for onsite
        ];

        // Day of week factors (should match Python API)
        $dayMultipliers = [
            0 => 1.0,   // Monday - no premium
            1 => 1.0,   // Tuesday - no premium
            2 => 1.0,   // Wednesday - no premium
            3 => 1.0,   // Thursday - no premium
            4 => 1.0,   // Friday - no premium
            5 => 1.1,   // Saturday - premium
            6 => 1.1,   // Sunday - premium
        ];

        // Time slot factors (should match Python API)
        $timeMultipliers = [
            'morning' => 0.95,    // Before 12pm - 5% discount
            'afternoon' => 1.0,   // 12pm - 5pm - no change
            'evening' => 1.1,     // After 5pm - 10% premium
            'default' => 1.0,
        ];

        // Calculate setting multiplier
        $settingMultiplier = $settingMultipliers[$setting] ?? 1.0;
        $settingDiscount = round((1 - $settingMultiplier) * 100, 2);

        // Calculate day multiplier
        $dayMultiplier = 1.0;
        if ($startDate) {
            try {
                $dayOfWeek = date('w', strtotime($startDate));
                $dayMultiplier = $dayMultipliers[$dayOfWeek] ?? 1.0;
            } catch (\Exception $e) {
                // Ignore and use default
            }
        }
        $dayDiscount = round((1 - $dayMultiplier) * 100, 2);

        // Calculate time multiplier
        $timeMultiplier = 1.0;
        if ($startTime) {
            try {
                $hour = (int) explode(':', $startTime)[0];
                if ($hour < 12) {
                    $timeMultiplier = $timeMultipliers['morning'];
                } elseif ($hour < 17) {
                    $timeMultiplier = $timeMultipliers['afternoon'];
                } else {
                    $timeMultiplier = $timeMultipliers['evening'];
                }
            } catch (\Exception $e) {
                // Ignore and use default
            }
        }
        $timeDiscount = round((1 - $timeMultiplier) * 100, 2);

        // Calculate total multiplier
        $totalMultiplier = $sessionMultiplier * $settingMultiplier * $dayMultiplier * $timeMultiplier;
        $finalPrice = $basePrice * $sessionCount * $totalMultiplier;
        $originalPrice = $basePrice * $sessionCount;
        $totalDiscount = round((($originalPrice - $finalPrice) / $originalPrice) * 100, 2);

        return [
            'base_price' => $basePrice,
            'session_discount' => $sessionDiscount,
            'setting_discount' => $settingDiscount,
            'time_discount' => $timeDiscount,
            'day_discount' => $dayDiscount,
            'total_discount' => $totalDiscount,
            'final_price' => round($finalPrice, 2),
            'price_per_session' => round($finalPrice / $sessionCount, 2),
            'original_sessions' => $sessionCount,
            'requested_sessions' => $sessionCount,
            'min_sessions_required' => $minSessions,
            'discount_tier' => $discountTier
        ];
    }

    /**
     * Format price as currency
     */
    public function formatPrice(float $price): string
    {
        return '₱' . number_format($price, 2);
    }

    /**
     * Get price breakdown text
     */
    public function getPriceBreakdownText(array $priceData): string
    {
        $parts = [];

        if (!empty($priceData['session_discount']) && $priceData['session_discount'] > 0) {
            $tier = $priceData['discount_tier'] ?? '';
            if ($tier === 'double') {
                $parts[] = "Double sessions (2x minimum): {$priceData['session_discount']}% discount";
            } elseif ($tier === 'triple_plus') {
                $parts[] = "Triple+ sessions (3x minimum): {$priceData['session_discount']}% discount";
            } else {
                $parts[] = "Bulk discount: {$priceData['session_discount']}%";
            }
        }

        if (!empty($priceData['setting_discount']) && $priceData['setting_discount'] > 0) {
            $parts[] = "Online discount: {$priceData['setting_discount']}%";
        }

        if (!empty($priceData['time_discount']) && $priceData['time_discount'] > 0) {
            $parts[] = "Time discount: {$priceData['time_discount']}%";
        } elseif (!empty($priceData['time_discount']) && $priceData['time_discount'] < 0) {
            $parts[] = "Peak time premium: " . abs($priceData['time_discount']) . "%";
        }

        if (!empty($priceData['day_discount']) && $priceData['day_discount'] > 0) {
            $parts[] = "Weekday discount: {$priceData['day_discount']}%";
        } elseif (!empty($priceData['day_discount']) && $priceData['day_discount'] < 0) {
            $parts[] = "Weekend premium: " . abs($priceData['day_discount']) . "%";
        }

        if (empty($parts)) {
            return "Standard pricing applied";
        }

        return implode(' + ', $parts);
    }
}
