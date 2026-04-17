import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConfirmationStore = defineStore('confirmation', () => {
  const isVisible = ref(false);
  const title = ref('');
  const message = ref('');
  const confirmText = ref('');
  const cancelText = ref('');
  const isDestructive = ref(false);
  const onConfirm = ref(null);
  const onCancel = ref(null);

  const show = (options) => {
    const {
      title: titleText,
      message: messageText,
      confirmText: confirmTextValue,
      cancelText: cancelTextValue,
      destructive = false,
      onConfirm: confirmCallback,
      onCancel: cancelCallback,
    } = options;

    title.value = titleText || '';
    message.value = messageText || '';
    confirmText.value = confirmTextValue || '';
    cancelText.value = cancelTextValue || '';
    isDestructive.value = destructive;
    onConfirm.value = confirmCallback || null;
    onCancel.value = cancelCallback || null;
    isVisible.value = true;
  };

  const hide = () => {
    isVisible.value = false;
    // Clear callbacks after a short delay to allow animations
    setTimeout(() => {
      title.value = '';
      message.value = '';
      confirmText.value = '';
      cancelText.value = '';
      isDestructive.value = false;
      onConfirm.value = null;
      onCancel.value = null;
    }, 300);
  };

  const handleConfirm = () => {
    if (onConfirm.value) {
      onConfirm.value();
    }
    hide();
  };

  const handleCancel = () => {
    if (onCancel.value) {
      onCancel.value();
    }
    hide();
  };

  return {
    isVisible,
    title,
    message,
    confirmText,
    cancelText,
    isDestructive,
    show,
    hide,
    handleConfirm,
    handleCancel,
  };
});

