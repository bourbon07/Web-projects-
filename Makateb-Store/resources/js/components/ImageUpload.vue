<template>
  <div class="space-y-4">
    <!-- Upload Methods Tabs -->
    <div class="flex gap-2 border-b border-amber-200 dark:border-amber-800">
      <button
        @click="activeTab = 'link'"
        :class="[
          'px-4 py-2 font-medium transition-colors',
          activeTab === 'link'
            ? 'border-b-2 border-amber-600 text-amber-600 dark:text-amber-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
        ]"
      >
        {{ t('image_link') }}
      </button>
      <button
        v-if="showCloudinary"
        @click="activeTab = 'cloudinary'"
        :class="[
          'px-4 py-2 font-medium transition-colors',
          activeTab === 'cloudinary'
            ? 'border-b-2 border-amber-600 text-amber-600 dark:text-amber-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
        ]"
      >
        {{ t('cloudinary') }}
      </button>
    </div>

    <!-- Link Input -->
    <div v-if="activeTab === 'link'" class="space-y-2">
      <label class="block text-sm font-medium text-gray-900 dark:text-white">
        {{ t('enter_image_url') }}
      </label>
      <div class="flex gap-2">
        <input
          v-model="imageLink"
          type="text"
          :placeholder="t('image_url_placeholder')"
          class="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          @keyup.enter="addImageFromLink"
        />
        <button
          @click="addImageFromLink"
          class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          {{ t('add_image') }}
        </button>
      </div>
      <!-- URL Preview -->
      <div v-if="imageLink && isValidUrl(imageLink)" class="mt-2">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ t('preview') }}:</p>
        <img
          :src="normalizeUrl(imageLink)"
          @error="handlePreviewError"
          class="w-full h-32 object-cover rounded-lg border-2 border-amber-200 dark:border-amber-800"
          alt="URL Preview"
        />
      </div>
    </div>

    <!-- Cloudinary -->
    <div v-if="activeTab === 'cloudinary' && showCloudinary" class="space-y-4">
      <!-- Upload to Cloudinary -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
          {{ t('upload_to_cloudinary') }}
        </label>
        <div class="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <input
            ref="cloudinaryFileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleCloudinaryFileSelect"
          />
          <Upload :size="32" class="mx-auto mb-2 text-amber-600 dark:text-amber-400" />
          <button
            @click="$refs.cloudinaryFileInput?.click()"
            class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
          >
            {{ t('upload_to_cloudinary') }}
          </button>
        </div>
      </div>

      <!-- Browse Cloudinary -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
          {{ t('select_from_cloudinary') }}
        </label>
        <button
          @click="openCloudinarySelector"
          class="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          {{ t('browse_cloudinary') }}
        </button>
        <div v-if="cloudinaryLoading" class="text-center py-4 text-gray-500 dark:text-gray-400">
          {{ t('loading') }}...
        </div>
        <div v-else-if="cloudinaryError" class="text-center py-4 px-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {{ cloudinaryError }}
        </div>
        <div v-else-if="cloudinaryImages.length > 0" class="grid grid-cols-4 gap-2 mt-4 max-h-64 overflow-y-auto">
          <div
            v-for="img in cloudinaryImages"
            :key="img.public_id || img.url || img.secure_url"
            @click="selectCloudinaryImage(img.secure_url || img.url)"
            class="relative cursor-pointer group"
          >
            <img
              :src="img.secure_url || img.url"
              :alt="img.public_id || 'Cloudinary image'"
              class="w-full h-24 object-cover rounded-lg border-2 border-amber-200 dark:border-amber-800 group-hover:border-amber-500"
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <Check v-if="(props.multiple ? images.includes(img.secure_url || img.url) : selectedImage === (img.secure_url || img.url))" :size="24" class="text-white" />
            </div>
          </div>
        </div>
        <div v-else-if="!cloudinaryLoading && !cloudinaryError" class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          {{ t('no_images_found') || 'No images found in Cloudinary' }}
        </div>
      </div>
    </div>

    <!-- Image Preview -->
    <div v-if="selectedImage || (multiple && images.length > 0)" class="space-y-2">
      <label class="block text-sm font-medium text-gray-900 dark:text-white">
        {{ multiple ? t('selected_images') : t('selected_image') }}
      </label>
      <div :class="multiple ? 'grid grid-cols-4 gap-4' : 'flex'">
        <div
          v-for="(img, index) in displayImages"
          :key="index"
          class="relative group"
        >
          <img
            :src="img"
            :alt="`Image ${index + 1}`"
            class="w-full h-32 object-cover rounded-lg border-2 border-amber-200 dark:border-amber-800"
          />
          <button
            @click="removeImage(index)"
            class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X :size="16" />
          </button>
          <div v-if="index === 0 && multiple" class="absolute bottom-1 left-1 bg-amber-600 text-white text-xs px-2 py-1 rounded">
            {{ t('primary') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useLanguageStore } from '../stores/language';
import { Upload, X, Check } from 'lucide-vue-next';
import { showNotification } from '../utils/notifications';

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: null
  },
  multiple: {
    type: Boolean,
    default: false
  },
  showCloudinary: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

const languageStore = useLanguageStore();
const t = languageStore.t;

const activeTab = ref('link');
const imageLink = ref('');
const selectedImage = ref(null);
const images = ref([]);
const cloudinaryImages = ref([]);
const cloudinaryLoading = ref(false);
const cloudinaryError = ref('');
const cloudinaryFileInput = ref(null);

const displayImages = computed(() => {
  if (props.multiple) {
    return images.value;
  }
  return selectedImage.value ? [selectedImage.value] : [];
});

watch(() => props.modelValue, (newVal) => {
  if (props.multiple) {
    images.value = Array.isArray(newVal) ? [...newVal] : (newVal ? [newVal] : []);
  } else {
    selectedImage.value = newVal || null;
  }
}, { immediate: true });

// Auto-fetch Cloudinary images when Cloudinary tab is opened
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'cloudinary' && props.showCloudinary && cloudinaryImages.value.length === 0 && !cloudinaryLoading.value) {
    fetchCloudinaryImages();
  }
});

const normalizeUrl = (url) => {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }
  return normalized;
};

const handleLinkInput = () => {
  // Just validate, don't auto-add
};

const handlePreviewError = (event) => {
  event.target.style.display = 'none';
};

const addImageFromLink = () => {
  if (!imageLink.value || !isValidUrl(imageLink.value)) {
    showNotification(t('please_enter_valid_url'), 'warning');
    return;
  }

  // Normalize URL - add https:// if missing
  let url = imageLink.value.trim();
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  // Validate URL
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      showNotification(t('please_enter_valid_url'), 'warning');
      return;
    }
  } catch (e) {
    showNotification(t('please_enter_valid_url'), 'warning');
    return;
  }

  if (props.multiple) {
    if (!images.value.includes(url)) {
      images.value.push(url);
      emit('update:modelValue', [...images.value]);
    }
  } else {
    selectedImage.value = url;
    emit('update:modelValue', url);
  }
  imageLink.value = '';
};

const uploadFile = async (file, uploadToCloudinary = false) => {
  if (!file.type.startsWith('image/')) {
    showNotification(t('please_select_image_file'), 'warning');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showNotification(t('file_too_large'), 'warning');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    if (uploadToCloudinary) {
      formData.append('upload_to_cloudinary', 'true');
    }

    // Try upload endpoint first
    let response;
    try {
      response = await window.axios.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      // Fallback to profile avatar upload if available
      if (props.modelValue && typeof props.modelValue === 'string' && props.modelValue.includes('avatar')) {
        response = await window.axios.post('/profile/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        throw error;
      }
    }

    const imageUrl = response.data.url || response.data.secure_url || response.data.avatar_url;
    
    if (props.multiple) {
      if (!images.value.includes(imageUrl)) {
        images.value.push(imageUrl);
        emit('update:modelValue', [...images.value]);
      }
    } else {
      selectedImage.value = imageUrl;
      emit('update:modelValue', imageUrl);
    }
    
    if (uploadToCloudinary) {
      fetchCloudinaryImages(); // Refresh Cloudinary images after upload
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showNotification(error.response?.data?.message || error.response?.data?.error || t('failed_to_upload_image'), 'error');
  }
};

const handleCloudinaryFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  await uploadFile(file, true); // Upload to Cloudinary
  event.target.value = ''; // Reset input
};

const fetchCloudinaryImages = async () => {
  cloudinaryLoading.value = true;
  cloudinaryError.value = '';
  cloudinaryImages.value = [];
  
  try {
    const response = await window.axios.get('/list-images');
    
    console.log('Cloudinary response:', response.data);
    
    // Handle different response formats
    if (response.data.images && Array.isArray(response.data.images)) {
      cloudinaryImages.value = response.data.images.map(img => ({
        url: img.url || img.secure_url || '',
        secure_url: img.secure_url || img.url || '',
        public_id: img.public_id || '',
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || ''
      }));
    } else if (response.data.resources && Array.isArray(response.data.resources)) {
      cloudinaryImages.value = response.data.resources.map(img => ({
        url: img.secure_url || img.url || '',
        secure_url: img.secure_url || img.url || '',
        public_id: img.public_id || '',
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || ''
      }));
    } else if (Array.isArray(response.data)) {
      cloudinaryImages.value = response.data.map(img => ({
        url: img.url || img.secure_url || '',
        secure_url: img.secure_url || img.url || '',
        public_id: img.public_id || '',
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || ''
      }));
    }
    
    console.log('Processed Cloudinary images:', cloudinaryImages.value);
    
    if (response.data.error) {
      cloudinaryError.value = response.data.error;
    }
    
    // If no images found and no error, show message
    if (cloudinaryImages.value.length === 0 && !response.data.error) {
      console.log('No images found in Cloudinary');
    }
  } catch (error) {
    console.error('Error fetching Cloudinary images:', error);
    cloudinaryError.value = error.response?.data?.error || error.response?.data?.message || error.message || t('failed_to_load_cloudinary_images');
  } finally {
    cloudinaryLoading.value = false;
  }
};

const handleImageError = (event) => {
  console.error('Image load error:', event);
  // Hide broken images
  event.target.style.display = 'none';
};

const openCloudinarySelector = () => {
  fetchCloudinaryImages();
};

const selectCloudinaryImage = (url) => {
  if (props.multiple) {
    images.value.push(url);
    emit('update:modelValue', [...images.value]);
  } else {
    selectedImage.value = url;
    emit('update:modelValue', url);
  }
};

const removeImage = (index) => {
  if (props.multiple) {
    images.value.splice(index, 1);
    emit('update:modelValue', [...images.value]);
  } else {
    selectedImage.value = null;
    emit('update:modelValue', null);
  }
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

onMounted(() => {
  if (props.modelValue) {
    if (props.multiple) {
      images.value = Array.isArray(props.modelValue) ? [...props.modelValue] : [props.modelValue];
    } else {
      selectedImage.value = props.modelValue;
    }
  }
});
</script>

