<template>
  <AppLayout>
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{{ t('settings') }}</h1>

        <div class="space-y-6">
          <!-- Basic Information (Authenticated Only) -->
          <div v-if="user" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
            <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('basic_information') }}</h2>
            <form @submit.prevent="savePersonalInfo" class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('first_name') }} *</label>
                  <input
                    v-model="settings.firstName"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('last_name') }} *</label>
                  <input
                    v-model="settings.lastName"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('email_address') }} *</label>
                <input
                  v-model="settings.email"
                  type="email"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <WoodButton type="submit" :disabled="savingPersonalInfo" class="flex items-center space-x-2">
                <Save :size="16" />
                <span>{{ savingPersonalInfo ? t('saving') : t('save_changes') }}</span>
              </WoodButton>
            </form>
          </div>

          <!-- Change Password (Authenticated Only) -->
          <div v-if="user" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
            <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('change_password') }}</h2>
            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('current_password') }} *</label>
                <input
                  v-model="passwordForm.current_password"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('new_password') }} *</label>
                <input
                  v-model="passwordForm.password"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  minLength="8"
                />
              </div>
              <div>
                <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('confirm_password') }} *</label>
                <input
                  v-model="passwordForm.password_confirmation"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  minLength="8"
                />
              </div>
              <WoodButton type="submit" :disabled="changingPassword">
                {{ changingPassword ? t('changing') : t('change_password') }}
              </WoodButton>
            </form>
          </div>

          <!-- Language Settings -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
            <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('language') }}</h2>
            <div class="space-y-4">
              <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('select_language') }}</label>
              <select
                v-model="selectedLanguage"
                @change="handleLanguageChange"
                class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ar">{{ t('arabic') }}</option>
                <option value="en">{{ t('english') }}</option>
              </select>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-amber-100 dark:border-amber-900/30">
            <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('payment_method') }}</h2>
            <form @submit.prevent="savePaymentMethod" class="space-y-4">
              <div>
                <label class="block font-medium mb-2 text-gray-900 dark:text-white">{{ t('credit_card') }}</label>
                <div class="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{{ t('card_number') }}</label>
                    <input
                      v-model="paymentMethod.cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{{ t('expiry_date') }}</label>
                      <input
                        v-model="paymentMethod.expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{{ t('cvv') }}</label>
                      <input
                        v-model="paymentMethod.cvv"
                        type="text"
                        placeholder="123"
                        class="w-full px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <WoodButton type="submit" class="flex items-center space-x-2">
                <CreditCard :size="16" />
                <span>{{ t('save_changes') }}</span>
              </WoodButton>
            </form>
          </div>

          <!-- Delete Account (Authenticated Only) -->
          <div v-if="user" class="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6 border-2 border-red-200 dark:border-red-800">
            <h2 class="text-2xl font-bold mb-4 text-red-900 dark:text-red-400">
              {{ t('danger_zone') }}
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              {{ t('delete_account_warning') }}
            </p>
            <div v-if="showDeleteConfirm" class="space-y-4">
              <p class="font-semibold text-red-900 dark:text-red-400">
                {{ t('are_you_sure') }}
              </p>
              <div class="flex gap-4">
                <button
                  @click="handleDeleteAccount"
                  class="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {{ t('yes_delete') }}
                </button>
                <WoodButton
                  @click="showDeleteConfirm = false"
                  variant="outline"
                  class="flex-1"
                >
                  {{ t('cancel') }}
                </WoodButton>
              </div>
            </div>
            <button
              v-else
              @click="showDeleteConfirm = true"
              class="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 :size="16" />
              <span>{{ t('delete_account') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import { Save, Trash2, CreditCard } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import WoodButton from '../components/WoodButton.vue';
import { showNotification } from '../utils/notifications';

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const settings = ref({ firstName: '', lastName: '', email: '' });
const savingPersonalInfo = ref(false);
const changingPassword = ref(false);
const showDeleteConfirm = ref(false);
const selectedLanguage = ref(languageStore.currentLanguage);
const paymentMethod = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
});
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
});

const isDarkMode = computed(() => authStore.isDarkMode);
const user = computed(() => authStore.user);

const handleLanguageChange = () => {
  languageStore.setLanguage(selectedLanguage.value);
};

const savePaymentMethod = () => {
  const userId = user.value ? user.value.id : 'guest';
  localStorage.setItem(`payment_method_${userId}`, JSON.stringify(paymentMethod.value));
  localStorage.setItem(`default_payment_method_${userId}`, 'credit_card');
  showNotification(t('basic_information_updated_successfully'), 'success');
};


// Split name into first and last name
const splitName = (name) => {
  if (!name) return { first: '', last: '' };
  const parts = name.trim().split(' ');
  if (parts.length === 1) return { first: parts[0], last: '' };
  const last = parts.pop();
  const first = parts.join(' ');
  return { first, last };
};

const savePersonalInfo = async () => {
  savingPersonalInfo.value = true;
  
  try {
    const fullNameValue = `${settings.value.firstName} ${settings.value.lastName}`.trim();
    if (!fullNameValue) {
      showNotification(t('please_enter_first_name'), 'warning');
      savingPersonalInfo.value = false;
      return;
    }

    await window.axios.put('/profile', {
      name: fullNameValue,
      email: settings.value.email,
    });
    await authStore.fetchUser();
    
    showNotification(t('basic_information_updated_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_update_profile'), 'error');
  } finally {
    savingPersonalInfo.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    showNotification(t('passwords_do_not_match'), 'warning');
    return;
  }
  if (passwordForm.value.password.length < 8) {
    showNotification(t('password_min_length'), 'warning');
    return;
  }
  
  changingPassword.value = true;
  try {
    await window.axios.post('/profile/change-password', passwordForm.value);
    showNotification(t('password_changed_successfully'), 'success');
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_change_password'), 'error');
  } finally {
    changingPassword.value = false;
  }
};

const handleDeleteAccount = async () => {
  try {
    await window.axios.post('/profile/delete-account', {
      password: passwordForm.value.current_password || 'confirm'
    });
    await authStore.logout();
    router.push('/');
    showNotification(t('account_deleted_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_delete_account'), 'error');
  }
};

onMounted(() => {
  if (authStore.user) {
    const nameParts = splitName(authStore.user.name);
    settings.value = {
      firstName: nameParts.first,
      lastName: nameParts.last,
      email: authStore.user.email || '',
    };
  }
  
  // Load payment method (for both user and guest)
  const userId = authStore.user ? authStore.user.id : 'guest';
  const savedPayment = localStorage.getItem(`payment_method_${userId}`);
  if (savedPayment) {
    paymentMethod.value = JSON.parse(savedPayment);
  }
});
</script>
