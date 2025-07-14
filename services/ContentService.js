// Content Service for Holy Cross Convent School App
// Handles fetching and processing of student content (alerts, circulars, homework, moments)

const API_BASE_URL = 'https://pinnacleapp.in/SchoolConnect/rest/school/v1';

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
  // Fetch content with pagination using correct offset logic
  static async fetchStudentContentWithPagination(userName, password, offset = "0", limit = "10", filter = "All") {
    try {
      if (!userName || !password) {
        throw new Error('User credentials not available');
      }

      // Convert page-based offset to item-based offset for API
      // offset 0 = items 0-9, offset 1 = items 10-19, offset 2 = items 20-29, etc.
      const pageNumber = parseInt(offset, 10);
      const itemOffset = pageNumber * parseInt(limit, 10);

      // Prepare API request payload with correct offset calculation
      const requestPayload = {
        albumId: "0",
        appVersion: "1.0.17.1",
        deviceKey: "eeP__0F0L0ljsd8BckIChp:APA91bEDSUr09XKBuXIT42bTSWO7dINeGZubxMXbR1xg7rC2jfFfAXQjGhNb-PXj9wuO9443r2a5Cd7yHKitht2oMqxbU29zHQHcTmt0i41EsqwWDKp21c4",
        deviceType: "p_ios iPhone 15 Pro",
        lastFetchDateFlag: "Y",
        firstCall: offset === "0" ? "Y" : "N",
        password: password,
        source: "APP",
        userName: userName,
        lastFetchDate: getCurrentDateTime(),
        offset: itemOffset.toString(), // Use calculated item offset for API
        limit: limit
      };

      // Add filter if not 'All'
      if (filter !== 'All') {
        requestPayload.listType = filter;
      }

      console.log(`Fetching content - Page: ${offset}, Item Offset: ${itemOffset}, Limit: ${limit}, Filter: ${filter}`);

      // Make API call with HTTPS/HTTP fallback
      const data = await this.makeApiCall('validateLoginOptimized', requestPayload);

      // Check if request was successful
      if (data.loginStatus === 'success') {
        return {
          success: true,
          data: data,
          message: "Content fetched successfully"
        };
      } else {
        return {
          success: false,
          data: null,
          message: data.resultMsg || "Failed to fetch content"
        };
      }

    } catch (error) {
      console.error('Content API Error:', error);
      return {
        success: false,
        data: null,
        message: "Network error. Please check your internet connection and try again."
      };
    }
  }

  // API call helper with HTTPS/HTTP fallback
  static async makeApiCall(endpoint, payload) {
    const baseUrls = [
      'https://pinnacleapp.in/SchoolConnect/rest/school/v1',
      'http://pinnacleapp.in/SchoolConnect/rest/school/v1'
    ];

    for (let i = 0; i < baseUrls.length; i++) {
      const baseUrl = baseUrls[i];
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
          body: JSON.stringify(payload),
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
        console.log(`Failed to fetch from ${baseUrl}:`, error.message);

        if (i === baseUrls.length - 1) {
          // Last attempt failed
          throw error;
        }
        // Continue to next URL
      }
    }
  }

  // Legacy method for backward compatibility
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

      // Use the new pagination method with default values
      const response = await this.fetchStudentContentWithPagination(userName, password, "0", "50", "All");

      if (response.success && response.data && response.data.LIST) {
        return {
          success: true,
          data: response.data.LIST,
          message: response.message
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.message
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
