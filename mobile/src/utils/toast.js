import Toast from 'react-native-toast-message';

/**
 * Show a customized toast notification
 * @param {string} type - 'success', 'error', or 'info'
 * @param {string} title - The main message (bold)
 * @param {string} message - Optional secondary message
 */
export const showToast = (type, title, message = '') => {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 70,
  });
};

export const successToast = (title, message = '') => showToast('success', title, message);
export const errorToast = (title, message = '') => showToast('error', title, message);
export const infoToast = (title, message = '') => showToast('info', title, message);

export default {
  show: showToast,
  success: successToast,
  error: errorToast,
  info: infoToast,
};
