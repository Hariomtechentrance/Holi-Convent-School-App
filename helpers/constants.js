// Constants for Holy Cross Convent School App
// Contains API endpoints, configuration, and common constants

// Main API endpoints
export const SCHOOL_CONNECT_API_HTTP = "http://pinnacleapp.in/SchoolConnect/rest/school/v1";
export const SCHOOL_CONNECT_API_HTTPS = "https://pinnacleapp.in/SchoolConnect/rest/school/v1";
export const FEES_APP_API = "http://pinnacleapp.in/Fees/rest/fees/v1/";
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
  SCHOOL_CONNECT_API_HTTP,
  SCHOOL_CONNECT_API_HTTPS,
  FEES_APP_API,
  PAYMENT_GATEWAY_API,
  EPATHSHALA_FEES_URL,
  EPATHSHALA_FEES_JSON_URL,
  EPATHSHALA_FEES_IMAGE_URL,
  GATEWAY_SOURCE,
  NOTIFICATION_TYPES,
  imageFileTypes,
  formatString,
  decodeString
};
