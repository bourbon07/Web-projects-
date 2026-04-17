import { useConfirmationStore } from '../stores/confirmation';
import { useLanguageStore } from '../stores/language';

/**
 * Utility function to show a confirmation modal
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.action - The action text (e.g., "remove this item", "delete this product")
 * @param {string} [options.title] - Custom title (defaults to translated "Confirm Action")
 * @param {string} [options.message] - Custom message (defaults to template with action)
 * @param {string} [options.confirmText] - Custom confirm button text (defaults to translated "Confirm")
 * @param {string} [options.cancelText] - Custom cancel button text (defaults to translated "Cancel")
 * @param {boolean} [options.destructive=false] - Whether this is a destructive action (red button)
 * @param {Function} [options.onConfirm] - Callback when user confirms
 * @param {Function} [options.onCancel] - Callback when user cancels
 * @returns {Promise<boolean>} - Promise that resolves to true if confirmed, false if cancelled
 */
export function confirmAction(options) {
  return new Promise((resolve) => {
    const confirmationStore = useConfirmationStore();
    const languageStore = useLanguageStore();
    const t = languageStore.t;
    
    const {
      action,
      title,
      message,
      confirmText,
      cancelText,
      destructive = false,
      onConfirm,
      onCancel,
    } = options;

    // Build title
    const modalTitle = title || t('confirm_action');
    
    // Build message
    let modalMessage = message;
    if (!modalMessage && action) {
      // Use template: "Are you sure you want to {action}?"
      const template = t('are_you_sure_you_want_to');
      modalMessage = template ? template.replace('{action}', action) : `${t('are_you_sure')} ${action}?`;
    } else if (!modalMessage) {
      modalMessage = t('are_you_sure');
    }

    // Show modal
    confirmationStore.show({
      title: modalTitle,
      message: modalMessage,
      confirmText: confirmText || t('confirm'),
      cancelText: cancelText || t('cancel'),
      destructive,
      onConfirm: () => {
        if (onConfirm) {
          onConfirm();
        }
        resolve(true);
      },
      onCancel: () => {
        if (onCancel) {
          onCancel();
        }
        resolve(false);
      },
    });
  });
}

