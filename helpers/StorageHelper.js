// Storage Helper for Holy Cross Convent School App
// Manages multi-user credentials and session data securely

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { LOGIN_CURRENTUSER } from './constants';

export class StorageHelper {
  // Store user credentials securely in keychain
  static async storeUserInfo(userId, password, isDefault, fullName) {
    try {
      const username = `${userId}`.trim().toLowerCase();
      let existingUsers = await this.getCredentials();
      let userInfos = [];

      console.log(`****** storeUserInfo storing user info ***   need to store [${userId}] existingUsers`, existingUsers);

      if (existingUsers == null) {
        // First user being added
        userInfos.push({
          username: username,
          password: password,
          isDefault: isDefault,
          fullName: fullName
        });
      } else {
        // Check if user already exists
        let userExists = false;
        for (let i = 0; i < existingUsers.length; i++) {
          if (existingUsers[i].username === username) {
            // Update existing user
            existingUsers[i].password = password;
            existingUsers[i].fullName = fullName;
            existingUsers[i].isDefault = isDefault;
            userExists = true;
            break;
          }
        }

        if (!userExists) {
          // Add new user
          existingUsers.push({
            username: username,
            password: password,
            isDefault: isDefault,
            fullName: fullName
          });
        }

        userInfos = existingUsers;
      }

      const userInfosString = JSON.stringify(userInfos);
      console.log("storeUserInfo Storing " + userInfosString);
      await Keychain.setGenericPassword('users', userInfosString);

      console.log(`${userId} information saved in secure vault`);
    } catch (err) {
      await Keychain.resetGenericPassword()
        .then(() => console.log('Password removed successfully'))
        .catch((error) => console.log(error));
      console.error(`${userId} vault save error ${err}`);
    }
  }

  // Get all stored user credentials
  static async getCredentials() {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (err) {
      console.error(`vault get credentials error ${err}`);
      return null;
    }
  }

  // Get specific user info by userId
  static async getUserInfo(userId) {
    try {
      let existingUsers = await this.getCredentials();
      if (existingUsers === null) {
        return null;
      }

      for (let index = 0; index < existingUsers.length; index++) {
        if (existingUsers[index].username === userId) {
          return existingUsers[index];
        }
      }

      return null;
    } catch (err) {
      console.error(`vault get error ${err}`);
      return null;
    }
  }

  // Get current active user info
  static async getCurrentUserInfo() {
    try {
      let currentUser = await StorageHelper.get(LOGIN_CURRENTUSER);
      let existingUsers = await this.getCredentials();

      console.log("StorageHelper: existingUsers count:", existingUsers?.length || 0);
      console.log("StorageHelper: currentUser from storage:", currentUser?.username);

      let currentUserInfo = null;
      if (existingUsers && existingUsers.length > 0) {
        if (currentUser == null) {
          // No current user set, use the most recently used or first available user
          // For auto-login, we'll use the first user as default
          currentUserInfo = existingUsers[0];
          console.log("StorageHelper: No current user, using first available:", currentUserInfo.username);

          // Store this as current user for future reference
          let storeInfo = JSON.parse(JSON.stringify(currentUserInfo));
          storeInfo.password = "NA"; // password stored only in secure keychain
          await StorageHelper.store(LOGIN_CURRENTUSER, storeInfo);
        } else {
          // Find current user in existing users
          for (let index = 0; index < existingUsers.length; index++) {
            if (existingUsers[index].username === currentUser.username) {
              currentUserInfo = existingUsers[index];
              console.log("StorageHelper: Found current user:", currentUserInfo.username);
              break;
            }
          }

          // If current user not found in credentials, use first available
          if (!currentUserInfo && existingUsers.length > 0) {
            currentUserInfo = existingUsers[0];
            console.log("StorageHelper: Current user not found, using first available:", currentUserInfo.username);
          }
        }
      }

      if (currentUserInfo == null) {
        console.log("StorageHelper: No current user available for auto-login");
      } else {
        console.log("StorageHelper: Returning current user:", currentUserInfo.username, currentUserInfo.fullName);
      }
      return currentUserInfo;
    } catch (err) {
      console.error(`getCurrentUserInfo error ${err}`);
      return null;
    }
  }

  // Remove specific user info
  static async removeUserInfo(userId) {
    console.log("remove user info", userId);
    let existingUsers = await this.getCredentials();
    if (existingUsers === null) {
      Keychain.resetGenericPassword()
        .then(() => console.log('Password removed successfully'))
        .catch((error) => console.log(error));
    } else {
      let newItems = existingUsers.filter(item => item.username !== userId);
      console.log("Now we have", newItems.length);
      const userInfosString = JSON.stringify(newItems);

      await this.remove(LOGIN_CURRENTUSER);
      await Keychain.setGenericPassword('users', userInfosString);
    }
  }

  // Reset all user data
  static async resetUser() {
    await Keychain.resetGenericPassword()
      .then(() => console.log('Password removed successfully'))
      .catch((error) => console.log(error));

    await AsyncStorage.clear();
  }

  // Generic storage methods
  static async store(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`error in saving ${key}`);
    }
  }

  static async get(key) {
    try {
      let item = await AsyncStorage.getItem(key);
      return item == null ? null : JSON.parse(item);
    } catch (err) {
      console.error(`error in retrieving ${key} ${err}`);
      return null;
    }
  }

  static async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`error in removing ${key} ${err}`);
      return false;
    }
  }

  // Clear all user-specific data for user switching
  static async clearUserSpecificData(username) {
    try {
      const userSpecificKeys = [
        `${username}_notifications`,
        `${username}_contentData`,
        `${username}_lastFetchDate`,
        `${username}_payFeesTermsAccepted`,
        `${username}_preferences`,
        `${username}_cachedData`
      ];

      for (const key of userSpecificKeys) {
        await this.remove(key);
      }

      console.log(`Cleared user-specific data for ${username}`);
      return true;
    } catch (error) {
      console.error(`Error clearing user-specific data for ${username}:`, error);
      return false;
    }
  }

  // Store user-specific cached data
  static async storeUserCachedData(username, dataType, data) {
    try {
      const key = `${username}_${dataType}`;
      await this.store(key, {
        data: data,
        timestamp: new Date().toISOString(),
        username: username
      });
      console.log(`Stored cached data for user ${username}, type: ${dataType}`);
    } catch (error) {
      console.error(`Error storing cached data for ${username}:`, error);
    }
  }

  // Get user-specific cached data
  static async getUserCachedData(username, dataType) {
    try {
      const key = `${username}_${dataType}`;
      const cachedData = await this.get(key);

      if (cachedData && cachedData.data) {
        console.log(`Retrieved cached data for user ${username}, type: ${dataType}`);
        return {
          success: true,
          data: cachedData.data,
          timestamp: cachedData.timestamp
        };
      }

      return { success: false, message: 'No cached data found' };
    } catch (error) {
      console.error(`Error getting cached data for ${username}:`, error);
      return { success: false, message: 'Error retrieving cached data' };
    }
  }

  // Clear cached data for specific user and data type
  static async clearUserCachedData(username, dataType) {
    try {
      const key = `${username}_${dataType}`;
      await this.remove(key);
      console.log(`Cleared cached data for user ${username}, type: ${dataType}`);
    } catch (error) {
      console.error(`Error clearing cached data for ${username}:`, error);
    }
  }

  // Get all users except current user for switching
  static async getOtherUsers() {
    try {
      const currentUser = await this.getCurrentUserInfo();
      const allUsers = await this.getCredentials();

      if (!allUsers || !currentUser) {
        return [];
      }

      return allUsers.filter(user => user.username !== currentUser.username);
    } catch (error) {
      console.error('Error getting other users:', error);
      return [];
    }
  }
}
