import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Load user from localStorage on initialization
  let savedUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      savedUser = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Error parsing saved user:', e);
    localStorage.removeItem('user');
  }
  
  const user = ref(savedUser);
  const token = ref(localStorage.getItem('token') || null);
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false);

  const isAuthenticated = computed(() => !!token.value);

  // Restore axios authorization header if token exists
  if (token.value && typeof window !== 'undefined' && window.axios) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  // Watch user changes and persist to localStorage
  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, { deep: true });

  // Watch token changes and update axios header
  watch(token, (newToken) => {
    if (typeof window !== 'undefined' && window.axios) {
      if (newToken) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        localStorage.setItem('token', newToken);
      } else {
        delete window.axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
      }
    }
  });

  // Get axios instance with baseURL already set
  const getAxios = () => {
    const axios = window.axios;
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }
    return axios;
  };

  async function login(credentials) {
    try {
      const axios = getAxios();
      const response = await axios.post('/login', credentials);
      token.value = response.data.access_token;
      user.value = response.data.user;
      // Token and user are automatically saved via watchers
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async function register(data) {
    try {
      const axios = getAxios();
      const response = await axios.post('/register', data);
      token.value = response.data.access_token;
      user.value = response.data.user;
      // Token and user are automatically saved via watchers
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async function logout() {
    try {
      const axios = getAxios();
      await axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      token.value = null;
      user.value = null;
      // Token and user are automatically cleared via watchers
    }
  }

  async function fetchUser() {
    try {
      const axios = getAxios();
      const response = await axios.get('/user');
      user.value = response.data;
      
      // Check if user is blocked and redirect
      if (response.data.is_blocked) {
        logout();
        window.location.href = '/blocked';
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('darkMode', isDarkMode.value);
    applyDarkMode();
  }

  function setDarkMode(value) {
    isDarkMode.value = value;
    localStorage.setItem('darkMode', value);
    applyDarkMode();
  }

  function applyDarkMode() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Initialize dark mode on store creation
  if (typeof document !== 'undefined') {
    applyDarkMode();
  }

  // Initialize session - fetch user if token exists but user is null
  const initializeSession = async () => {
    // If we have a token but no user data, fetch user from server
    if (token.value && !user.value) {
      try {
        await fetchUser();
      } catch (error) {
        // If fetch fails (e.g., token expired), clear session
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
      }
    }
    // If we have both token and user, session is already restored from localStorage
    // The router guard will handle verification if needed
  };

  return {
    user,
    token,
    isDarkMode,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    toggleDarkMode,
    setDarkMode,
    initializeSession
  };
});

