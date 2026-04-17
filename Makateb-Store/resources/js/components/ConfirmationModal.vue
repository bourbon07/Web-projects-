<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <!-- Modal -->
        <div
          :class="[
            'relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full',
            'transform transition-all duration-300',
            isRTL ? 'text-right' : 'text-left'
          ]"
          :dir="isRTL ? 'rtl' : 'ltr'"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ title }}
            </h3>
          </div>

          <!-- Body -->
          <div class="px-6 py-4">
            <p class="text-gray-700 dark:text-gray-300">
              {{ message }}
            </p>
          </div>

          <!-- Footer -->
          <div
            :class="[
              'px-6 py-4 border-t border-gray-200 dark:border-gray-700',
              'flex gap-3',
              isRTL ? 'flex-row-reverse' : 'flex-row',
              'justify-end'
            ]"
          >
            <button
              @click="handleCancel"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'border-2 border-gray-300 dark:border-gray-600',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'focus:ring-gray-500'
              ]"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'text-white',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useConfirmationStore } from '../stores/confirmation';
import { useLanguageStore } from '../stores/language';

const confirmationStore = useConfirmationStore();
const languageStore = useLanguageStore();

const isVisible = computed(() => confirmationStore.isVisible);
const title = computed(() => confirmationStore.title);
const message = computed(() => confirmationStore.message);
const confirmText = computed(() => confirmationStore.confirmText);
const cancelText = computed(() => confirmationStore.cancelText);
const isDestructive = computed(() => confirmationStore.isDestructive);
const isRTL = computed(() => languageStore.isRTL);

const handleConfirm = () => {
  confirmationStore.handleConfirm();
};

const handleCancel = () => {
  confirmationStore.handleCancel();
};
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>

