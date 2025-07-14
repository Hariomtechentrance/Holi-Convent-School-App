// Constants for Holy Cross Convent School App
// Contains API endpoints, configuration, and common constants

export const API_BASE = "http://pinnacleapp.in/";
export const MOBILE_APP_API = API_BASE + "MobileApp/rest/";
export const SCHOOL_CONNECT_APP_API = API_BASE + "SchoolConnect/rest/school/v1/";
export const FEES_APP_API = API_BASE + "Fees/rest/fees/v1/";
export const PAYMENT_GATEWAY_API = "https://pinnacleeasebuzz.in/config";
export const EPATHSHALA_FEES_URL = "https://epathshalainfo.com/FeesAkash/";
export const EPATHSHALA_FEES_JSON_URL = "https://epathshalainfo.com/parentJson/";
export const EPATHSHALA_FEES_IMAGE_URL = "https://epathshalainfo.com/photos/";

export const GATEWAY_SOURCE = "AndroidApp";

// Action types
export const ACTION_FILTER = "filter";
export const ACTION_FILTER_WITH_REFRESH = "filterWithREFRESH";
export const ACTION_REFRESH = "refresh";
export const ACTION_ADD_CHILD = "addchild";
export const ACTION_LOGOUT = "logout";

// Notification types
export const NOTIFICATION_TYPES = {
  ALERT: "alert",
  CIRCULAR: "circular", 
  CLASSWORK: "classwork",
  PHOTOS: "photos"
};

// Login constants
export const LOGIN_CURRENTUSER = "currentUser";

// Action constants for multi-user functionality
// export const ACTION_LOGOUT = "logout";
// export const ACTION_ADD_CHILD = "add_child";
// export const ACTION_FILTER = "filter";
// export const ACTION_REFRESH = "refresh";
// export const ACTION_FILTER_WITH_REFRESH = "filter_with_refresh";

// File types
export const imageFileTypes = ["jpg", "jpeg", "bmp", "png", "gif", "webp", "tiff"];

// Storage keys
export const NOTIFICATION_KEY = "_notifications";
export const SCHOOL_FEATURE_STORAGE_KEY = "parentSchoolFeature";

// UI Constants
export const BUTTON_MODE = "elevated";
export const BUTTON_COLOR = "#4CAF50";
export const BUTTON_TEXT_COLOR = "#fff";
export const BUTTON_STYLE_MODE = "elevated";

// Currency
export const rupees = "₹ ";
export const rupees_withoutspace = "₹";

// Global font configuration
export const globalFont = {
  fontFamily: 'Avenir',
  fontSize: 20,
};

// Format string helper
export function formatString(originalString) {
  if (originalString) {
    const replacedString = originalString.replace(/\+/g, " ");
    return decodeString(replacedString);
  }
  return originalString;
}

// Decode string helper
export function decodeString(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

export default {
  API_BASE,
  MOBILE_APP_API,
  SCHOOL_CONNECT_APP_API,
  FEES_APP_API,
  PAYMENT_GATEWAY_API,
  GATEWAY_SOURCE,
  NOTIFICATION_TYPES,
  imageFileTypes,
  formatString,
  decodeString
};
