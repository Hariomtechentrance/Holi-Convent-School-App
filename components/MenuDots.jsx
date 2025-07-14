// Menu Dots Component for Holy Cross Convent School App
// Shows dialogue with LOGOUT and ADD CHILD options following Pinnacle School app patterns

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthService from '../services/AuthService';
import { ACTION_LOGOUT, ACTION_ADD_CHILD } from '../helpers/constants';

const MenuDots = ({ navigation, onActionTriggered }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuPress = () => {
    Alert.alert(
      'Menu Options',
      'What would you like to do?',
      [
        {
          text: 'LOGOUT',
          onPress: () => handleLogout(),
          style: 'destructive'
        },
        {
          text: 'ADD CHILD',
          onPress: () => handleAddChild()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    try {
      const result = await AuthService.logout();
      if (result.success) {
        if (onActionTriggered) {
          onActionTriggered(ACTION_LOGOUT);
        }
        // Navigate back to login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login', params: { loginAction: ACTION_LOGOUT } }],
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleAddChild = async () => {
    try {
      // Check if maximum number of children reached (3 as per Pinnacle app)
      const storedUsers = await AuthService.getStoredUsers();
      if (storedUsers.success && storedUsers.data.length >= 3) {
        Alert.alert(
          'Maximum Users Reached',
          'You can add max of 3 students. Please logout one of student to add new one',
          [{ text: 'OK' }]
        );
        return;
      }

      if (onActionTriggered) {
        onActionTriggered(ACTION_ADD_CHILD);
      }
      
      // Navigate to login screen for adding child
      navigation.navigate('Login', { 
        loginAction: ACTION_ADD_CHILD, 
        canReturnHome: true 
      });
    } catch (error) {
      console.error('Add child error:', error);
      Alert.alert('Error', 'Failed to add child');
    }
  };

  return (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={handleMenuPress}
      activeOpacity={0.7}
    >
      <Icon name="more-vert" size={24} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});

export default MenuDots;
