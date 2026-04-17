// Page Visit Tracking Utility
// Tracks page visits using localStorage

const STORAGE_KEY = 'page_visits';

// Get all page visits from localStorage
export const getPageVisits = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading page visits:', error);
    return {};
  }
};

// Track a page visit
export const trackPageVisit = (pagePath, pageName) => {
  try {
    const visits = getPageVisits();
    const now = new Date().toISOString();
    
    if (!visits[pagePath]) {
      visits[pagePath] = {
        name: pageName,
        path: pagePath,
        visits: 0,
        last_visit: now
      };
    }
    
    visits[pagePath].visits += 1;
    visits[pagePath].last_visit = now;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    return visits[pagePath];
  } catch (error) {
    console.error('Error tracking page visit:', error);
    return null;
  }
};

// Get visit count for a specific page
export const getPageVisitCount = (pagePath) => {
  const visits = getPageVisits();
  return visits[pagePath]?.visits || 0;
};

// Get all pages with their visit counts
export const getAllPageVisits = () => {
  return getPageVisits();
};

// Clear all page visits (for testing)
export const clearPageVisits = () => {
  localStorage.removeItem(STORAGE_KEY);
};

