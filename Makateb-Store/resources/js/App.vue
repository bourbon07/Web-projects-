<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <Navbar v-if="showNavbar" />
    <router-view />
    <NotificationToast />
    <ConfirmationModal />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import NotificationToast from './components/NotificationToast.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';
import { useLanguageStore } from './stores/language';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const languageStore = useLanguageStore();
const authStore = useAuthStore();

const showNavbar = computed(() => {
  return route.name !== 'login';
});

// Initialize language and session on app mount
onMounted(async () => {
  // Initialize language - ensure Arabic is default
  if (!localStorage.getItem('language')) {
    languageStore.setLanguage('ar');
  } else {
    // Ensure HTML attributes are set correctly
    const currentLang = languageStore.currentLanguage;
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLang);
    // Update axios language header
    if (typeof window !== 'undefined' && window.axios) {
      window.axios.defaults.headers.common['Accept-Language'] = currentLang;
    }
  }

  // Initialize session - restore user if token exists
  // This ensures user stays logged in after page refresh
  try {
    await authStore.initializeSession();
  } catch (error) {
    console.error('Error initializing session:', error);
  }
});

// Watch for language changes to update HTML attributes and axios header
watch(() => languageStore.currentLanguage, (newLang) => {
  document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', newLang);
  // Update axios language header
  if (typeof window !== 'undefined' && window.axios) {
    window.axios.defaults.headers.common['Accept-Language'] = newLang;
  }
});
</script>
