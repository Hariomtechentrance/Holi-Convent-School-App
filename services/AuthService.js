// Authentication Service for Holy Cross Convent School App
// Integrates with the real API endpoint

const API_BASE_URL = 'http://pinnacleapp.in/SchoolConnect/rest/school/v1';

// Helper function to get current date in required format
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

class AuthService {
  static async validateLogin(username, password) {
    try {
      // Basic validation - only check if fields are not empty
      if (!username || !password) {
        return {
          success: false,
          message: "Please enter both username and password"
        };
      }

      // Prepare API request payload - send any username/password to API
      const requestPayload = {
        albumId: "0",
        appVersion: "1.0.17.1",
        deviceKey: "eeP__0F0L0ljsd8BckIChp:APA91bEDSUr09XKBuXIT42bTSWO7dINeGZubxMXbR1xg7rC2jfFfAXQjGhNb-PXj9wuO9443r2a5Cd7yHKitht2oMqxbU29zHQHcTmt0i41EsqwWDKp21c4",
        deviceType: "p_android",
        lastFetchDateFlag: "Y",
        firstCall: "Y",
        password: password.trim(),
        source: "APP",
        userName: username.trim(),
        lastFetchDate: getCurrentDateTime(),
        offset: "10",
        limit: "10"
      };

      console.log('Sending API request:', requestPayload);

      // Make API call
      const response = await fetch(`${API_BASE_URL}/validateLoginOptimized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
      console.log('API Response:', data);

      // Check if login was successful
      if (data.loginStatus === 'success') {
        return {
          success: true,
          data: {
            ...data,
            // Preserve original credentials for future API calls
            originalUserName: username.trim(),
            originalPassword: password.trim()
          },
          message: data.resultMsg || "Login successful"
        };
      } else {
        return {
          success: false,
          message: data.resultMsg || "Invalid username or password"
        };
      }

    } catch (error) {
      console.error('Login API Error:', error);
      return {
        success: false,
        message: "Network error. Please check your internet connection and try again."
      };
    }
  }

  static async logout() {
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
}

export default AuthService;
