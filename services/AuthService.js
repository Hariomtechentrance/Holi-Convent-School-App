// Authentication Service for Holy Cross Convent School App
// Integrates with the real API endpoint and supports multi-user functionality

import { StorageHelper } from '../helpers/StorageHelper';
import { LOGIN_CURRENTUSER } from '../helpers/constants';

const API_BASE_URL_HTTPS = 'https://pinnacleapp.in/SchoolConnect/rest/school/v1';
const API_BASE_URL_HTTP = 'http://pinnacleapp.in/SchoolConnect/rest/school/v1';

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

// Helper function to make API calls with fallback from HTTPS to HTTP
const makeApiCall = async (endpoint, requestPayload) => {
  const urls = [API_BASE_URL_HTTPS, API_BASE_URL_HTTP];

  for (let i = 0; i < urls.length; i++) {
    const baseUrl = urls[i];
    const fullUrl = `${baseUrl}/${endpoint}`;

    try {
      console.log(`Attempting API call to: ${fullUrl} (attempt ${i + 1})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Response status: ${response.status} from ${baseUrl}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response successful from:', baseUrl);
      return data;

    } catch (error) {
      console.log(`API call failed for ${baseUrl}:`, error.message);

      // If this is the last URL, throw the error
      if (i === urls.length - 1) {
        throw error;
      }

      // Otherwise, continue to the next URL
      console.log('Trying next URL...');
    }
  }
};

class AuthService {
  // Test network connectivity
  static async testNetworkConnectivity() {
    try {
      console.log('Testing network connectivity...');
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000
      });
      console.log('Network test successful:', response.status);
      return true;
    } catch (error) {
      console.log('Network test failed:', error.message);
      return false;
    }
  }

  static async validateLogin(username, password, isAddChild = false) {
    try {
      // Test network connectivity first
      const isConnected = await this.testNetworkConnectivity();
      if (!isConnected) {
        return {
          success: false,
          message: "No internet connection. Please check your network settings."
        };
      }

      // Basic validation - only check if fields are not empty
      if (!username || !password) {
        return {
          success: false,
          message: "Please enter both username and password"
        };
      }

      // Prepare API request payload with pagination support
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
        offset: "0", // Start from beginning for pagination
        limit: "50"
      };

      console.log('Request payload:', requestPayload);

      // Make API call with HTTPS/HTTP fallback
      const data = await makeApiCall('validateLoginOptimized', requestPayload);

      // Check if login was successful
      if (data.loginStatus === 'success') {
        // Store user credentials securely
        await StorageHelper.storeUserInfo(
          username.trim().toLowerCase(),
          password.trim(),
          !isAddChild, // First user is default, additional children are not
          data.studentName || username
        );

        // Always set as current user (for both regular login and add child)
        // This ensures the last logged-in user is remembered
        const currentUser = {
          username: username.trim().toLowerCase(),
          password: "NA", // Don't store password in regular storage
          isDefault: !isAddChild, // First user is default, additional children are not
          fullName: data.studentName || username
        };
        await StorageHelper.store(LOGIN_CURRENTUSER, currentUser);
        console.log("Set current user:", currentUser.username);

        // For add child, ensure the new child becomes the active user
        if (isAddChild) {
          console.log("New child added and set as current user:", currentUser.username);
        }

        return {
          success: true,
          data: {
            ...data,
            // Preserve original credentials for future API calls
            originalUserName: username.trim(),
            originalPassword: password.trim(),
            username: username.trim().toLowerCase(),
            isAddChild: isAddChild
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

      // Provide more specific error messages
      let errorMessage = "Network error. Please check your internet connection and try again.";

      if (error.name === 'AbortError') {
        errorMessage = "Request timeout. Please check your internet connection and try again.";
      } else if (error.message.includes('Network request failed')) {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else if (error.message.includes('HTTP error')) {
        errorMessage = "Server error. Please try again later.";
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async logout() {
    try {
      // Clear current user session but keep credentials for auto-login
      // We'll clear the current user only temporarily for this session
      await StorageHelper.remove(LOGIN_CURRENTUSER);

      // Clear general cached data to ensure clean logout
      const generalKeys = [
        'contentData',
        'notifications',
        'lastFetchDate',
        'userPreferences',
        'cachedData'
      ];

      for (const key of generalKeys) {
        await StorageHelper.remove(key);
      }

      console.log('User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: "Error during logout" };
    }
  }

  // Complete logout - removes all user data (for complete sign out)
  static async completeLogout() {
    try {
      // Clear all user credentials and data
      await StorageHelper.resetUser();
      console.log('Complete logout successful');
      return { success: true };
    } catch (error) {
      console.error('Complete logout error:', error);
      return { success: false, message: "Error during complete logout" };
    }
  }

  // Switch to a different user/child
  static async switchUser(userCredentials) {
    try {
      const currentUser = {
        username: userCredentials.username,
        password: "NA", // Don't store password in regular storage
        isDefault: userCredentials.isDefault,
        fullName: userCredentials.fullName
      };
      await StorageHelper.store(LOGIN_CURRENTUSER, currentUser);
      return { success: true, data: currentUser };
    } catch (error) {
      console.error('Switch user error:', error);
      return { success: false, message: "Error switching user" };
    }
  }

  // Switch user and fetch their data immediately
  static async switchUserWithData(userCredentials) {
    try {
      console.log('Switching to user:', userCredentials.fullName);

      // Validate input
      if (!userCredentials || !userCredentials.username || !userCredentials.fullName) {
        throw new Error('Invalid user credentials provided');
      }

      // Get full user credentials from storage
      const storedUsers = await this.getStoredUsers();
      if (!storedUsers.success) {
        throw new Error('Failed to get stored users. Please try logging in again.');
      }

      if (!storedUsers.data || storedUsers.data.length === 0) {
        throw new Error('No stored users found. Please login first.');
      }

      const fullUserData = storedUsers.data.find(user => user.username === userCredentials.username);
      if (!fullUserData) {
        throw new Error('Selected user not found in stored credentials. Please login again.');
      }

      if (!fullUserData.password) {
        throw new Error('User password not found. Please login again.');
      }

      // Update current user in storage
      const switchResult = await this.switchUser(userCredentials);
      if (!switchResult.success) {
        throw new Error('Failed to update current user in storage');
      }

      // Fetch fresh data for the switched user
      console.log('Fetching data for switched user...');
      const loginResult = await this.validateLogin(fullUserData.username, fullUserData.password);
      if (!loginResult.success) {
        // Restore previous user if login fails
        console.error('Login failed for switched user, attempting to restore previous state');
        throw new Error(loginResult.message || 'Failed to authenticate switched user. Please check your internet connection.');
      }

      console.log('User switched successfully to:', userCredentials.fullName);
      return {
        success: true,
        data: {
          ...loginResult.data,
          isSwitchedUser: true
        }
      };

    } catch (error) {
      console.error('Switch user with data error:', error);

      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('Network')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('credentials')) {
        userMessage = 'Authentication failed. Please login again.';
      } else if (error.message.includes('stored users')) {
        userMessage = 'User data not found. Please login again.';
      } 

      return {
        success: false,
        message: userMessage
      };
    }
  }

  // Get all stored users/children
  static async getStoredUsers() {
    try {
      const users = await StorageHelper.getCredentials();
      return { success: true, data: users || [] };
    } catch (error) {
      console.error('Get stored users error:', error);
      return { success: false, data: [] };
    }
  }

  // Remove a specific user/child
  static async removeUser(username) {
    try {
      await StorageHelper.removeUserInfo(username);
      return { success: true };
    } catch (error) {
      console.error('Remove user error:', error);
      return { success: false, message: "Error removing user" };
    }
  }

  // Auto-login with stored credentials (last logged-in user)
  static async autoLogin() {
    try {
      console.log("AuthService: Starting auto-login process");

      // Get the current/last logged-in user
      const currentUser = await StorageHelper.getCurrentUserInfo();
      console.log("AuthService: Current user from storage:", currentUser?.username);

      if (currentUser && currentUser.username) {
        // Get the full credentials for this user
        const userCredentials = await StorageHelper.getUserInfo(currentUser.username);
        console.log("AuthService: User credentials found:", !!userCredentials);

        if (userCredentials && userCredentials.password) {
          console.log("AuthService: Attempting auto-login for:", userCredentials.username);

          // Validate stored credentials with API
          const result = await this.validateLogin(userCredentials.username, userCredentials.password);
          if (result.success) {
            console.log("AuthService: Auto-login successful");
            return {
              success: true,
              data: {
                ...result.data,
                isAutoLogin: true,
                lastLoginUser: userCredentials.username
              }
            };
          } else {
            console.log("AuthService: Auto-login failed - invalid credentials");
          }
        } else {
          console.log("AuthService: No password found for user");
        }
      } else {
        console.log("AuthService: No current user found");
      }

      return { success: false, message: "No valid stored credentials" };
    } catch (error) {
      console.error('Auto login error:', error);
      return { success: false, message: "Auto login failed" };
    }
  }

  // Fetch data with pagination support
  static async fetchDataWithPagination(username, password, offset = "0", limit = "50", filter = "All") {
    try {
      const requestPayload = {
        albumId: "0",
        appVersion: "1.0.17.1",
        deviceKey: "eeP__0F0L0ljsd8BckIChp:APA91bEDSUr09XKBuXIT42bTSWO7dINeGZubxMXbR1xg7rC2jfFfAXQjGhNb-PXj9wuO9443r2a5Cd7yHKitht2oMqxbU29zHQHcTmt0i41EsqwWDKp21c4",
        deviceType: "p_android",
        lastFetchDateFlag: "Y",
        firstCall: offset === "0" ? "Y" : "N",
        password: password.trim(),
        source: "APP",
        userName: username.trim(),
        lastFetchDate: getCurrentDateTime(),
        offset: offset,
        limit: limit,
        filter: filter
      };

      const data = await makeApiCall('validateLoginOptimized', requestPayload);
      return {
        success: data.loginStatus === 'success',
        data: data,
        hasMore: data.payload && data.payload.length >= parseInt(limit)
      };
    } catch (error) {
      console.error('Fetch data with pagination error:', error);
      return { success: false, message: "Error fetching data" };
    }
  }
}

export default AuthService;
