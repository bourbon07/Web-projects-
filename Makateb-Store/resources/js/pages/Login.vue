<template>
  <div class="min-h-screen flex items-center justify-center p-4" :class="isDarkMode ? 'bg-gray-900' : 'bg-amber-900'">
    <!-- Centered Modal -->
    <div class="w-full max-w-md rounded-lg shadow-xl border-2 border-amber-500 relative" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
      <!-- Close Button -->
        <button 
        @click="$router.push('/dashboard')"
        class="absolute top-4 right-4 transition-colors"
        :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
        >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>

      <div class="p-8">
      <!-- Welcome Section -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ t('welcome_back') }}</h1>
        <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('sign_in_account') }}</p>
      </div>


      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-5 max-w-md">
        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('email') }} *</label>
          <div class="relative">
            <input
              v-model="loginForm.email"
              type="email"
              :placeholder="t('name_example')"
              required
              class="w-full pl-3 pr-10 py-3 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              :class="isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('password') }} *</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('enter_your_password')"
              required
              class="w-full pl-10 pr-12 py-3 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              :class="isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
              :class="isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'"
            >
              <svg v-if="showPassword" class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Role *</label>
          <div class="relative">
            <select
              v-model="loginForm.role"
              class="w-full px-4 py-3 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none appearance-none cursor-pointer"
              :class="isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'"
            >
              <option value="" :class="isDarkMode ? 'bg-gray-700' : 'bg-white'">{{ t('select_role') }}</option>
              <option value="customer" :class="isDarkMode ? 'bg-gray-700' : 'bg-white'">{{ t('customer') }}</option>
              <option value="admin" :class="isDarkMode ? 'bg-gray-700' : 'bg-white'">{{ t('admin') }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-400' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Secret Code (for admin) -->
        <div v-if="loginForm.role === 'admin'">
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('admin_code') }} *</label>
          <input
            v-model="loginForm.secret_code"
            type="text"
            :placeholder="t('enter_admin_code')"
            class="w-full px-4 py-3 border-2 border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            :class="isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'"
            maxlength="4"
          />
        </div>

        <!-- Login Button -->
        <WoodButton
          type="submit"
          :disabled="loading"
          class="w-full"
        >
          {{ t('sign_in') }}
        </WoodButton>

        <!-- Error Message -->
        <div v-if="error" class="text-sm text-center py-2 px-4 rounded-lg mt-4" :class="isDarkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50'">{{ error }}</div>

        <!-- Links -->
        <div class="mt-4 space-y-2 text-center">
          <p class="text-sm">
            <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('dont_have_account') }} </span>
            <button @click="isLogin = false" class="text-amber-600 dark:text-amber-400 hover:underline font-medium">{{ t('sign_up') }}</button>
          </p>
          <button @click="$router.push('/dashboard')" class="text-sm hover:underline" :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'">
            {{ t('continue_as_guest') }}
          </button>
        </div>
      </form>

      <!-- Register Form -->
      <form v-if="!isLogin" @submit.prevent="handleRegister" class="space-y-5">
        <!-- Name Field -->
        <div>
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('full_name') }}</label>
          <input
            v-model="registerForm.name"
            type="text"
            :placeholder="t('enter_full_name')"
            required
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6D4C41] focus:border-[#6D4C41] outline-none"
            :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">{{ t('email') }} *</label>
          <div class="relative">
            <input
              v-model="registerForm.email"
              type="email"
              :placeholder="t('name_example')"
              required
              class="w-full pl-3 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#6D4C41] focus:border-[#6D4C41] outline-none"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-700">{{ t('password') }} *</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('enter_your_password')"
              required
              class="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#6D4C41] focus:border-[#6D4C41] outline-none"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
              :class="isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'"
            >
              <svg v-if="showPassword" class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('confirm_password') }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              v-model="registerForm.password_confirmation"
              type="password"
              :placeholder="t('confirm_password')"
              required
              class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6D4C41] focus:border-[#6D4C41] outline-none"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'"
            />
          </div>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ t('role') }} *</label>
          <div class="relative">
            <select
              v-model="registerForm.role"
              required
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6D4C41] focus:border-[#6D4C41] outline-none appearance-none cursor-pointer"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
            >
              <option value="customer">{{ t('customer') }}</option>
              <option value="admin">{{ t('admin') }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Secret Code (for admin) -->
        <div v-if="registerForm.role === 'admin'">
          <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
            {{ t('admin_code') }} *
          </label>
          <input
            v-model="registerForm.secret_code"
            type="text"
            :placeholder="t('enter_admin_code')"
            required
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6D4C41] focus:border-[#6D4C41] outline-none"
            :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'"
            maxlength="4"
          />
        </div>

        <!-- Register Button -->
        <WoodButton
          type="submit"
          :disabled="loading"
          class="w-full"
        >
          {{ t('create_account') }}
        </WoodButton>

        <!-- Error Message -->
        <div v-if="error" class="text-sm text-center py-2 px-4 rounded-lg mt-4" :class="isDarkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50'">{{ error }}</div>

        <!-- Links -->
        <div class="mt-4 space-y-2 text-center">
          <p class="text-sm">
            <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ t('already_have_account') }} </span>
            <button @click="isLogin = true" class="text-amber-600 dark:text-amber-400 hover:underline font-medium">{{ t('sign_in') }}</button>
          </p>
          <button @click="$router.push('/dashboard')" class="text-sm hover:underline" :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'">
            {{ t('continue_as_guest') }}
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import WoodButton from '../components/WoodButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;

const isLogin = ref(true);
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

const isDarkMode = computed(() => authStore.isDarkMode);

const loginForm = ref({
  email: '',
  password: '',
  role: 'customer',
  secret_code: '',
});

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'customer',
  secret_code: '',
});

const handleContactSupport = async () => {
  // If user is not authenticated, they need to login first
  if (!authStore.isAuthenticated) {
    error.value = 'Please login first to contact support';
    return;
  }

  try {
    // Fetch admins and open chat with the first admin
    const response = await window.axios.get('/admins');
    const admins = response.data;
    
    if (admins && admins.length > 0) {
      // Navigate to chat with the first admin
      router.push(`/chat/${admins[0].id}`);
    } else {
      error.value = 'No admins available at the moment';
    }
  } catch (err) {
    if (err.response?.status === 401) {
      error.value = 'Please login first to contact support';
    } else {
      error.value = 'Failed to connect to support. Please try again later.';
    }
  }
};

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const data = {
      email: loginForm.value.email,
      password: loginForm.value.password,
    };

    // Add role if selected
    if (loginForm.value.role) {
      data.role = loginForm.value.role;
    }

    // For admin, secret_code is required
    if (loginForm.value.role === 'admin') {
      if (!loginForm.value.secret_code) {
        error.value = 'Admin code is required for admin login.';
        loading.value = false;
        return;
      }
      data.secret_code = loginForm.value.secret_code;
    }

    await authStore.login(data);
    await authStore.fetchUser();
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      if (errors.secret_code) {
        error.value = errors.secret_code[0];
      } else if (errors.email) {
        error.value = errors.email[0];
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.register(registerForm.value);
    await authStore.fetchUser();
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      if (errors.secret_code) {
        error.value = errors.secret_code[0];
      } else if (errors.email) {
        error.value = errors.email[0];
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleGoogleAuth = async () => {
  try {
    const response = await window.axios.get('/auth/google/redirect');
    window.location.href = response.data.url;
  } catch (err) {
    error.value = 'Google authentication failed';
  }
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});
</script>
