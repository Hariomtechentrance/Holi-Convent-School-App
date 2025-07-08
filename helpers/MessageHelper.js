// Message Helper for Holy Cross Convent School App
// Provides message display utilities

export class MessageHelper {
  static showMessage(showMessageFunc, message, type = 'info') {
    if (showMessageFunc) {
      showMessageFunc({
        message: message,
        type: type,
        duration: 3000,
        floating: true,
      });
    } else {
      // Fallback to console if no message function provided
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  static showSuccess(showMessageFunc, message) {
    MessageHelper.showMessage(showMessageFunc, message, 'success');
  }

  static showError(showMessageFunc, message) {
    MessageHelper.showMessage(showMessageFunc, message, 'danger');
  }

  static showWarning(showMessageFunc, message) {
    MessageHelper.showMessage(showMessageFunc, message, 'warning');
  }

  static showInfo(showMessageFunc, message) {
    MessageHelper.showMessage(showMessageFunc, message, 'info');
  }
}

export default MessageHelper;
