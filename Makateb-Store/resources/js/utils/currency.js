/**
 * Currency utility for Jordanian Dinar (JOD)
 */

export const CURRENCY_SYMBOL = 'JD';
export const CURRENCY_CODE = 'JOD';
export const CURRENCY_LOCALE = 'ar-JO';

/**
 * Format price with Jordanian Dinar symbol
 * @param {number|string} price - The price to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price string
 */
export function formatPrice(price, options = {}) {
  if (price === null || price === undefined) return '0.00 ' + CURRENCY_SYMBOL;
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00 ' + CURRENCY_SYMBOL;
  
  const {
    showSymbol = true,
    decimals = 2,
    locale = 'en-US'
  } = options;
  
  const formatted = numPrice.toFixed(decimals);
  
  if (showSymbol) {
    return `${formatted} ${CURRENCY_SYMBOL}`;
  }
  
  return formatted;
}

/**
 * Format price with currency symbol using Intl.NumberFormat
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPriceIntl(price) {
  if (price === null || price === undefined) return '0.00 ' + CURRENCY_SYMBOL;
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numPrice)) return '0.00 ' + CURRENCY_SYMBOL;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: CURRENCY_CODE,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  } catch (e) {
    return formatPrice(price);
  }
}

/**
 * Format price for display (simple format: "XX.XX JD")
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPriceDisplay(price) {
  return formatPrice(price, { showSymbol: true });
}

/**
 * Get currency symbol
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol() {
  return CURRENCY_SYMBOL;
}

/**
 * Get currency code
 * @returns {string} Currency code
 */
export function getCurrencyCode() {
  return CURRENCY_CODE;
}

