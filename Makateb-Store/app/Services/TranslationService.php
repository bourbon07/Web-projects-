<?php

namespace App\Services;

/**
 * Translation Service for automatic translation between Arabic and English
 * 
 * Currently uses dictionary-based translation with fallback to transliteration.
 * Can be extended to use translation APIs (Google Translate, Microsoft Translator, etc.)
 */
class TranslationService
{
    /**
     * Dictionary for common category translations (English -> Arabic)
     */
    private static $categoryDictionary = [
        'sport' => 'رياضة',
        'sports' => 'رياضة',
        'electronics' => 'إلكترونيات',
        'clothing' => 'ملابس',
        'food' => 'طعام',
        'books' => 'كتب',
        'furniture' => 'أثاث',
        'toys' => 'ألعاب',
        'beauty' => 'جمال',
        'health' => 'صحة',
        'automotive' => 'سيارات',
        'home' => 'منزل',
        'office' => 'مكتب',
        'general' => 'عام',
        'stationery' => 'قرطاسية',
        'beverages' => 'مشروبات',
        'snacks' => 'وجبات خفيفة',
        'breakfast' => 'فطور',
        'lunch' => 'غداء',
        'dinner' => 'عشاء',
        'hot drinks' => 'المشروبات الساخنة',
        'cold drinks' => 'المشروبات الباردة',
    ];

    /**
     * Reverse dictionary for Arabic -> English translations
     */
    private static $categoryDictionaryReverse = null;

    /**
     * Get reverse dictionary (lazy initialization)
     */
    private static function getReverseDictionary(): array
    {
        if (self::$categoryDictionaryReverse === null) {
            self::$categoryDictionaryReverse = array_flip(self::$categoryDictionary);
        }
        return self::$categoryDictionaryReverse;
    }

    /**
     * Detect if text is Arabic
     */
    public static function isArabic(string $text): bool
    {
        // Check if text contains Arabic characters
        return preg_match('/[\x{0600}-\x{06FF}]/u', $text) > 0;
    }

    /**
     * Detect if text is English (Latin characters)
     */
    private static function isEnglish(string $text): bool
    {
        // Check if text contains primarily Latin characters
        $textWithoutSpaces = preg_replace('/\s+/', '', $text);
        if (empty($textWithoutSpaces)) {
            return false;
        }
        return preg_match('/^[\x{0000}-\x{007F}\x{0080}-\x{00FF}]+$/u', $textWithoutSpaces) > 0;
    }

    /**
     * Translate category name from one language to another
     * 
     * @param string $text The text to translate
     * @param string $fromLanguage Source language ('ar' or 'en')
     * @param string $toLanguage Target language ('ar' or 'en')
     * @return string Translated text
     */
    public static function translateCategoryName(string $text, string $fromLanguage, string $toLanguage): string
    {
        if (empty(trim($text))) {
            return $text;
        }

        // If same language, return as is
        if ($fromLanguage === $toLanguage) {
            return $text;
        }

        $text = trim($text);

        // Auto-detect language if not explicitly provided
        if ($fromLanguage === 'auto') {
            $fromLanguage = self::isArabic($text) ? 'ar' : 'en';
        }

        // Translate English to Arabic
        if ($fromLanguage === 'en' && $toLanguage === 'ar') {
            return self::translateEnglishToArabic($text);
        }

        // Translate Arabic to English
        if ($fromLanguage === 'ar' && $toLanguage === 'en') {
            return self::translateArabicToEnglish($text);
        }

        // Fallback: return original text
        return $text;
    }

    /**
     * Translate English to Arabic
     */
    private static function translateEnglishToArabic(string $text): string
    {
        $textLower = strtolower(trim($text));

        // Check dictionary for exact match
        if (isset(self::$categoryDictionary[$textLower])) {
            return self::$categoryDictionary[$textLower];
        }

        // Check dictionary for partial matches
        foreach (self::$categoryDictionary as $en => $ar) {
            if (str_contains($textLower, $en) || str_contains($en, $textLower)) {
                return $ar;
            }
        }

        // Fallback: Use transliteration or return original
        // In a production environment, you might want to call a translation API here
        // For now, we'll return the original text as fallback
        // TODO: Integrate with translation API (Google Translate, Microsoft Translator, etc.)
        return $text;
    }

    /**
     * Translate Arabic to English
     */
    private static function translateArabicToEnglish(string $text): string
    {
        $reverseDict = self::getReverseDictionary();

        // Check reverse dictionary for exact match
        if (isset($reverseDict[$text])) {
            return $reverseDict[$text];
        }

        // Check reverse dictionary for partial matches
        foreach ($reverseDict as $ar => $en) {
            if (str_contains($text, $ar) || str_contains($ar, $text)) {
                return $en;
            }
        }

        // Fallback: Use transliteration or return original
        // In a production environment, you might want to call a translation API here
        // For now, we'll return the original text as fallback
        // TODO: Integrate with translation API (Google Translate, Microsoft Translator, etc.)
        return $text;
    }

    /**
     * Automatically generate translations for category names
     * Detects the actual language of the entered text and generates the translation
     * 
     * @param string|null $nameAr Arabic name
     * @param string|null $nameEn English name
     * @param string|null $enteredName The name entered by admin (if only one field was used)
     * @return array ['name_ar' => string, 'name_en' => string]
     */
    public static function generateCategoryTranslations(?string $nameAr, ?string $nameEn, ?string $enteredName = null): array
    {
        $result = [
            'name_ar' => $nameAr,
            'name_en' => $nameEn,
        ];

        // If we have an entered name but no specific language fields, detect the language
        if (!empty($enteredName) && empty($nameAr) && empty($nameEn)) {
            $detectedLang = self::isArabic($enteredName) ? 'ar' : 'en';
            if ($detectedLang === 'ar') {
                $nameAr = $enteredName;
                $nameEn = null;
            } else {
                $nameEn = $enteredName;
                $nameAr = null;
            }
            $result['name_ar'] = $nameAr;
            $result['name_en'] = $nameEn;
        }

        // If we have Arabic but no English, translate Arabic to English
        if (!empty($result['name_ar']) && empty($result['name_en'])) {
            $result['name_en'] = self::translateCategoryNameWithAPI($result['name_ar'], 'ar', 'en');
            // If translation failed, use transliteration
            if ($result['name_en'] === $result['name_ar'] || empty($result['name_en'])) {
                $result['name_en'] = self::transliterateArabicToEnglish($result['name_ar']);
            }
        }

        // If we have English but no Arabic, translate English to Arabic
        if (!empty($result['name_en']) && empty($result['name_ar'])) {
            $result['name_ar'] = self::translateCategoryNameWithAPI($result['name_en'], 'en', 'ar');
            // If translation failed, try dictionary first, then fallback
            if ($result['name_ar'] === $result['name_en'] || empty($result['name_ar'])) {
                // Try dictionary first
                $dictResult = self::translateCategoryName($result['name_en'], 'en', 'ar');
                if ($dictResult !== $result['name_en']) {
                    $result['name_ar'] = $dictResult;
                } else {
                    // Last resort: use English text (better than nothing)
                    $result['name_ar'] = $result['name_en'];
                }
            }
        }

        return $result;
    }

    /**
     * Translate using free translation API (MyMemory or similar)
     * Falls back to dictionary if API fails
     */
    private static function translateCategoryNameWithAPI(string $text, string $fromLang, string $toLang): string
    {
        // First try dictionary (fastest)
        $dictResult = self::translateCategoryName($text, $fromLang, $toLang);
        if ($dictResult !== $text && !empty($dictResult)) {
            return $dictResult;
        }

        // Try free translation API (MyMemory - free tier)
        try {
            $url = sprintf(
                'https://api.mymemory.translated.net/get?q=%s&langpair=%s|%s',
                urlencode($text),
                $fromLang === 'ar' ? 'ar' : 'en',
                $toLang === 'ar' ? 'ar' : 'en'
            );

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);
                if (isset($data['responseData']['translatedText']) && !empty($data['responseData']['translatedText'])) {
                    $translated = trim($data['responseData']['translatedText']);
                    // MyMemory sometimes returns the same text if translation is not found
                    if ($translated !== $text && !empty($translated)) {
                        return $translated;
                    }
                }
            }
        } catch (\Exception $e) {
            // Silently fail and use fallback
        }

        // Fallback to dictionary result or original text
        return $dictResult !== $text ? $dictResult : $text;
    }

    /**
     * Basic transliteration from Arabic to English (phonetic approximation)
     * This is a fallback when dictionary translation is not available
     */
    private static function transliterateArabicToEnglish(string $text): string
    {
        // Simple transliteration mapping (can be expanded)
        $transliterationMap = [
            'رياضة' => 'Sports',
            'إلكترونيات' => 'Electronics',
            'ملابس' => 'Clothing',
            'طعام' => 'Food',
            'كتب' => 'Books',
            'أثاث' => 'Furniture',
            'ألعاب' => 'Toys',
            'جمال' => 'Beauty',
            'صحة' => 'Health',
            'سيارات' => 'Automotive',
            'منزل' => 'Home',
            'مكتب' => 'Office',
            'عام' => 'General',
        ];

        // Check if we have a transliteration
        if (isset($transliterationMap[$text])) {
            return $transliterationMap[$text];
        }

        // Basic fallback: return a generic name or the Arabic text
        // In production, you would use a proper transliteration library or API
        return $text; // Return original as last resort
    }
}

