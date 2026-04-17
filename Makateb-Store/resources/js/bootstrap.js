import axios from 'axios';
window.axios = axios;

// Set base URL for API routes
window.axios.defaults.baseURL = '/api';

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';
window.axios.defaults.headers.common['Content-Type'] = 'application/json';

// Set CSRF token
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Set language header based on localStorage
const currentLang = localStorage.getItem('language') || 'ar';
window.axios.defaults.headers.common['Accept-Language'] = currentLang;

// Restore authorization header if token exists
const savedToken = localStorage.getItem('token');
if (savedToken) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

// Set guest ID header if exists
const guestId = localStorage.getItem('guest_id');
if (guestId) {
    window.axios.defaults.headers.common['X-Guest-Id'] = guestId;
}

// Update language and guest ID header
window.axios.interceptors.request.use(config => {
    const lang = localStorage.getItem('language') || 'ar';
    const gId = localStorage.getItem('guest_id');

    config.headers['Accept-Language'] = lang;
    if (gId) {
        config.headers['X-Guest-Id'] = gId;
    }

    return config;
});

// Update language header when language changes
window.addEventListener('storage', (e) => {
    if (e.key === 'language') {
        window.axios.defaults.headers.common['Accept-Language'] = e.newValue || 'ar';
    }
    if (e.key === 'guest_id') {
        if (e.newValue) {
            window.axios.defaults.headers.common['X-Guest-Id'] = e.newValue;
        } else {
            delete window.axios.defaults.headers.common['X-Guest-Id'];
        }
    }
});

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY || '4a04e3bbc78e240d328a',
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap2',
    forceTLS: true,
    authEndpoint: '/api/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'X-App-ID': import.meta.env.VITE_PUSHER_APP_ID || '2089399',
        }
    }
});
