// Content Service for Holy Cross Convent School App
// Handles fetching and processing of student content (alerts, circulars, homework, moments)

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

class ContentService {
  static async fetchStudentContent(userData) {
    try {
      if (!userData) {
        throw new Error('User data not available');
      }

      // Extract credentials from userData
      const userName = userData.originalUserName || userData.userName;
      const password = userData.originalPassword || userData.password;

      if (!userName || !password) {
        throw new Error('User credentials not available');
      }

      // Prepare API request payload using stored user credentials
      const requestPayload = {
        albumId: "0",
        appVersion: "1.0.17.1",
        deviceKey: "eeP__0F0L0ljsd8BckIChp:APA91bEDSUr09XKBuXIT42bTSWO7dINeGZubxMXbR1xg7rC2jfFfAXQjGhNb-PXj9wuO9443r2a5Cd7yHKitht2oMqxbU29zHQHcTmt0i41EsqwWDKp21c4",
        deviceType: "p_ios iPhone 15 Pro",
        lastFetchDateFlag: "Y",
        firstCall: "Y",
        password: password,
        source: "APP",
        userName: userName,
        lastFetchDate: "2025-06-10 07:46:49",
        offset: "10",
        limit: "50"
      };

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

      // Check if request was successful
      if (data.loginStatus === 'success' && data.LIST) {
        return {
          success: true,
          data: data.LIST,
          message: "Content fetched successfully"
        };
      } else {
        return {
          success: false,
          data: [],
          message: data.resultMsg || "Failed to fetch content"
        };
      }

    } catch (error) {
      console.error('Content API Error:', error);
      return {
        success: false,
        data: [],
        message: "Network error. Please check your internet connection and try again."
      };
    }
  }

  // Process and categorize content items
  static processContentItems(contentList) {
    if (!Array.isArray(contentList)) {
      return {
        all: [],
        alerts: [],
        circulars: [],
        homework: [],
        moments: []
      };
    }

    const processedItems = contentList.map(item => {
      // Add processed date for sorting
      const sentDate = item.sentDate || item.startDate || '';
      const processedDate = this.parseDate(sentDate);

      return {
        ...item,
        processedDate,
        displayDate: this.formatDisplayDate(sentDate)
      };
    });

    // Sort by newest first
    const sortedItems = processedItems.sort((a, b) => {
      return new Date(b.processedDate) - new Date(a.processedDate);
    });

    // Categorize items
    const categorized = {
      all: sortedItems,
      alerts: sortedItems.filter(item => item.type === 'alert'),
      circulars: sortedItems.filter(item => item.type === 'circular'),
      homework: sortedItems.filter(item => item.type === 'classwork'),
      moments: sortedItems.filter(item => item.type === 'photos')
    };

    return categorized;
  }

  // Parse date string to standardized format
  static parseDate(dateString) {
    if (!dateString) return new Date(0);

    try {
      // Handle format: "22-03-2025 18:50:10" or "2025-03-22 18:50:10"
      const parts = dateString.split(' ');
      if (parts.length >= 1) {
        const datePart = parts[0];
        const timePart = parts[1] || '00:00:00';

        // Check if date is in DD-MM-YYYY format
        if (datePart.includes('-') && datePart.split('-')[0].length <= 2) {
          const [day, month, year] = datePart.split('-');
          return new Date(`${year}-${month}-${day} ${timePart}`);
        } else {
          // Assume YYYY-MM-DD format
          return new Date(`${datePart} ${timePart}`);
        }
      }

      return new Date(dateString);
    } catch (error) {
      console.warn('Error parsing date:', dateString, error);
      return new Date(0);
    }
  }

  // Format date for display
  static formatDisplayDate(dateString) {
    if (!dateString) return '';

    try {
      const date = this.parseDate(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return `${diffDays} days ago`;
      } else {
        // Format as DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      return dateString;
    }
  }

  // Get content type display name
  static getContentTypeDisplayName(type) {
    const typeMap = {
      'alert': 'Alert',
      'circular': 'Circular',
      'classwork': 'Homework',
      'photos': 'Moments'
    };

    return typeMap[type] || type;
  }

  // Get content type color
  static getContentTypeColor(type) {
    // const colorMap = {
    //   'alert': '#FF5722',
    //   'circular': '#2196F3',
    //   'classwork': '#4CAF50',
    //   'photos': '#FF9800'
    // };

    const colorMap = {
      'alert': '#4CAF50',
      'circular': '#4CAF50',
      'classwork': '#4CAF50',
      'photos': '#4CAF50'
    };

    return colorMap[type] || '#757575';
  }
}

export default ContentService;
