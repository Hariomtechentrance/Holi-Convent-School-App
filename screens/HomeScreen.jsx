import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, UIManager, Platform, Alert, ActivityIndicator, ToastAndroid, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContentDisplaySection from '../components/ContentDisplay/ContentDisplaySection';

import MenuDots from '../components/MenuDots';
import AuthService from '../services/AuthService';
import { StorageHelper } from '../helpers/StorageHelper';
import { ACTION_LOGOUT, ACTION_ADD_CHILD } from '../helpers/constants';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const topMenu = [
  {
    label: 'ALERT',
    image: require('../assets/icc_alert.png')
  },
  {
    label: 'CIRCULAR',
    image: require('../assets/icc_acedemics.png')
  },
  {
    label: 'HOMEWORK',
    image: require('../assets/icc_assignment.png')
  },
  {
    label: 'MOMENTS',
    image: require('../assets/icc_photos.png')
  },
];

const bottomMenu = [
  {
    label: 'Profile',
    image: require('../assets/ic_profile.png'),
    action: 'profile'
  },
  {
    label: 'Pay Fees',
    image: require('../assets/icc_fees.png'),
    action: 'payFees'
  },
  {
    label: 'Attendance',
    image: require('../assets/icc_attendance.png')
  },
  {
    label: 'Website',
    image: require('../assets/icc_website.png')
  },
  {
    label: 'Contact Us',
    image: require('../assets/icc_contact.png')
  },
  {
    label: 'Performance',
    image: require('../assets/ic_progress_report.png')
  },
];

const HomeScreen = ({ route, navigation }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(route?.params?.userData || {});
  const [showSwitchUserDialog, setShowSwitchUserDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const rotateAnim = useState(new Animated.Value(expanded ? 1 : 0))[0];
  const slideAnim = useState(new Animated.Value(expanded ? 1 : 0))[0];
  const menuAnim = useState(new Animated.Value(1))[0]; // 1 = visible, 0 = hidden
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('down');
  const animationTimeout = useRef(null);
  const backPressTimeout = useRef(null);
  const contentDisplayRef = useRef(null);

  // Get user data from navigation params or current state
  const userData = currentUserData;

  // Extract student information from API response (updates when currentUserData changes)
  const studentName = userData.studentName || 'Student Name';
  const className = userData.className || 'Class';
  const divisionName = userData.divisionName || '';
  const gender = userData.gender || 'MALE';
  const profilePhoto = userData.profilePhoto || '';
  const schoolName = userData.schoolName || 'HOLY CROSS CONVENT SCHOOL';

  // Check if this is a newly added child
  const isNewChild = userData.isNewChild || false;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
      if (backPressTimeout.current) {
        clearTimeout(backPressTimeout.current);
      }
    };
  }, []);

  // Handle new child scenario
  useEffect(() => {
    if (isNewChild) {
      console.log('New child detected, current user should be:', userData.username || userData.originalUserName);
      // The user data is already correct from the login response
      // This ensures the profile press will show other children correctly
    }
  }, [isNewChild, userData]);

  // Determine student image source
  const getStudentImage = () => {
    if (profilePhoto && profilePhoto.trim() !== '') {
      return { uri: profilePhoto };
    }
    // Use gender-based placeholder
    return gender.toUpperCase() === 'FEMALE'
      ? require('../assets/female-placeholder.png')
      : require('../assets/male-placeholder.png');
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);

    // Animate arrow rotation
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate bottom grid slide
    Animated.timing(slideAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    // Only trigger animation if scroll difference is significant (> 5px)
    if (Math.abs(scrollDiff) > 10) {
      const isScrollingUp = scrollDiff < 0;
      const newDirection = isScrollingUp ? 'up' : 'down';

      // Only animate if direction changed or if we're at the top
      if (scrollDirection.current !== newDirection || currentScrollY <= 0) {
        scrollDirection.current = newDirection;

        const shouldShowMenu = isScrollingUp || currentScrollY <= 0;

        // Clear any existing timeout
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current);
        }

        // Add slight delay to prevent too frequent animations
        animationTimeout.current = setTimeout(() => {
          // Animate menu visibility
          Animated.timing(menuAnim, {
            toValue: shouldShowMenu ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }, 50);
      }
    }

    lastScrollY.current = currentScrollY;
  };

  const handleMenuPress = (item) => {
    if (item.action === 'profile') {
      navigation.navigate('Profile', { userData });
      return;
    }

    if (item.action === 'chat') {
      navigation.navigate('ChatList', { studentInfo: userData });
      return;
    }

    if (item.action === 'payFees') {
      handlePayFeesPress();
      return;
    }

    // Handle top menu filter actions
    const filterMap = {
      'ALERT': 'alerts',
      'CIRCULAR': 'circulars',
      'HOMEWORK': 'homework',
      'MOMENTS': 'moments'
    };

    if (filterMap[item.label]) {
      // If the same filter is clicked again, show all content
      if (activeFilter === filterMap[item.label]) {
        setActiveFilter('all');
      } else {
        setActiveFilter(filterMap[item.label]);
      }
    }

    // Add other navigation actions here as needed
  };

  // Handle profile picture press for child switching
  const handleProfilePicturePress = async () => {
    try {
      // Get all stored users
      const result = await AuthService.getStoredUsers();
      console.log('=== PROFILE PICTURE SWITCH DEBUG ===');
      console.log('Total stored users:', result.data?.length || 0);
      console.log('Stored users:', result.data?.map(u => ({ username: u.username, fullName: u.fullName })) || []);

      if (!result.success || result.data.length <= 1) {
        // No other children available
        console.log('No other children available');
        Alert.alert(
          'Switch User',
          'You dont have other child profile!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current user from multiple sources for reliability
      const currentUserFromRoute = userData?.username || userData?.originalUserName;
      const currentUserFromStorage = await StorageHelper.getCurrentUserInfo();

      console.log('Current user from route:', currentUserFromRoute);
      console.log('Current user from storage:', currentUserFromStorage?.username);

      // Use the most reliable current user identifier
      const currentUserIdentifier = currentUserFromRoute || currentUserFromStorage?.username;
      console.log('Using current user identifier:', currentUserIdentifier);

      // Filter out the current user to show only other children
      const otherUsers = result.data.filter(user => {
        const isCurrentUser = user.username === currentUserIdentifier;
        console.log(`User ${user.username} (${user.fullName}) is current user: ${isCurrentUser}`);
        return !isCurrentUser;
      });

      console.log('Other users available for switching:', otherUsers.map(u => ({ username: u.username, fullName: u.fullName })));
      console.log('=== END DEBUG ===');

      if (otherUsers.length === 0) {
        Alert.alert(
          'Switch User',
          'You dont have other child profile!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show custom dialog with available users for immediate switching
      setAvailableUsers(otherUsers);
      setShowSwitchUserDialog(true);
    } catch (error) {
      console.error('Error in handleProfilePicturePress:', error);
      Alert.alert('Error', 'Failed to load user profiles');
    }
  };



  // Handle immediate student change following PinnacleSchool pattern
  const handleStudentChanged = async (student) => {
    try {
      console.log('=== IMMEDIATE USER SWITCH DEBUG ===');
      console.log('Switching to student:', student.fullName);

      // Validate student data
      if (!student || !student.username || !student.fullName) {
        console.error('Invalid student data provided:', student);
        Alert.alert('Error', 'Invalid student data. Please try again.');
        return;
      }

      // Check if already switching
      if (loading) {
        console.log('Already switching users, ignoring request');
        return;
      }

      setLoading(true);

      // Switch user and get their data immediately
      const switchResult = await AuthService.switchUserWithData(student);

      if (switchResult.success) {
        console.log('User switched successfully, updating UI');

        // Validate the returned data
        if (!switchResult.data || !switchResult.data.studentName) {
          console.error('Invalid data returned from user switch:', switchResult.data);
          Alert.alert('Error', 'Invalid user data received. Please try again.');
          return;
        }

        // Update current user data state
        setCurrentUserData(switchResult.data);

        // Trigger content refresh for new user
        if (contentDisplayRef.current) {
          try {
            await contentDisplayRef.current(switchResult.data);
            console.log('Content refreshed for new user');
          } catch (contentError) {
            console.error('Error refreshing content:', contentError);
            // Don't show error to user as the switch was successful
          }
        } else {
          console.warn('Content display ref not available, content may not refresh');
        }

        console.log('UI updated for new user:', switchResult.data.studentName);

        // Show success message
        ToastAndroid.show(`Switched to ${switchResult.data.studentName}`, ToastAndroid.SHORT);

      } else {
        console.error('Failed to switch user:', switchResult.message);
        Alert.alert(
          'Switch Failed',
          switchResult.message || 'Failed to switch user. Please try again.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error in handleStudentChanged:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while switching users. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      console.log('=== END IMMEDIATE USER SWITCH DEBUG ===');
    }
  };





  const handleChatPress = () => {
    navigation.navigate('ChatList', { studentInfo: userData });
  };



  // Handle menu actions (logout, add child)
  const handleActionTriggered = (action) => {
    console.log('Action triggered:', action);
    if (action === ACTION_LOGOUT) {
      // Logout handled by MenuDots component
    } else if (action === ACTION_ADD_CHILD) {
      // Add child handled by MenuDots component
    }
  };

  const handlePayFeesPress = async () => {
    try {
      // Check if payment terms have been accepted
      const termsKey = `${userData.username}_payFeesTermsAccepted`;
      const storedTerms = await AsyncStorage.getItem(termsKey);

      if (storedTerms) {
        const termsData = JSON.parse(storedTerms);
        if (termsData.payFeesTermsAccepted === true) {
          // Terms already accepted, navigate directly to fees
          navigation.navigate('Fees', { studentInfo: userData });
          return;
        }
      }

      // Show terms and conditions dialog
      Alert.alert(
        'Payment Terms & Conditions',
        'By proceeding with online payment, you agree to the terms and conditions of the payment gateway. The school is not responsible for any transaction failures or delays. Please ensure you have a stable internet connection before proceeding.',
        [
          {
            text: 'Decline',
            style: 'cancel',
            onPress: async () => {
              await AsyncStorage.setItem(termsKey, JSON.stringify({
                payFeesTermsAccepted: false
              }));
            }
          },
          {
            text: 'Accept & Continue',
            onPress: async () => {
              await AsyncStorage.setItem(termsKey, JSON.stringify({
                payFeesTermsAccepted: true
              }));
              navigation.navigate('Fees', { studentInfo: userData });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling payment terms:', error);
      Alert.alert('Error', 'Failed to process payment terms. Please try again.');
    }
  };

  // Handle user selection from custom dialog
  const handleUserSelection = (user) => {
    setShowSwitchUserDialog(false);
    handleStudentChanged(user);
  };

  // Handle dialog cancel
  const handleDialogCancel = () => {
    setShowSwitchUserDialog(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/icse-logo.png')} style={styles.logo} />
        <View style={styles.schoolNameContainer}>
          <Text style={styles.schoolName}>{schoolName.toUpperCase()}</Text>
        </View>
      </View>

      {/* Student Info */}
      <View style={styles.studentInfo}>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{studentName.toUpperCase()}</Text>
          <Text style={styles.studentClass}>{className} {divisionName}</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePicturePress}>
          <Image source={getStudentImage()} style={styles.studentImage} />
        </TouchableOpacity>
        <MenuDots navigation={navigation} onActionTriggered={handleActionTriggered} />
      </View>



      {/* Navigation Menu Container */}
      <Animated.View
        style={[
          styles.navigationContainer,
          {
            maxHeight: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300], // Adjust based on your menu height
            }),
            opacity: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: [{
              translateY: menuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              })
            }]
          }
        ]}
      >
        {/* Top Menu */}
        <View style={styles.topGrid}>
          {topMenu.map((item, index) => (
            <TouchableOpacity key={index} style={styles.topIconButton} onPress={() => handleMenuPress(item)}>
              <Image source={item.image} style={styles.iconImage} />
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleExpanded}>
          <View style={styles.toggleContainer}>
            <View style={styles.horizontalLine} />
            <Animated.Image
              source={require('../assets/arrow_up.png')}
              style={[
                styles.arrowImage,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg']
                    })
                  }]
                }
              ]}
            />
            <View style={styles.horizontalLine} />
          </View>
        </TouchableOpacity>

        {/* Bottom Menu */}
        <Animated.View
          style={[
            styles.bottomGridContainer,
            {
              maxHeight: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.bottomGrid}>
            {bottomMenu.map((item, index) => (
              <TouchableOpacity key={index} style={styles.bottomIconButton} onPress={() => handleMenuPress(item)}>
                <Image source={item.image} style={styles.iconImage} />
                <Text style={styles.iconLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Dynamic Content Display Section */}
      <View style={styles.contentSection}>
        <ContentDisplaySection
          userData={userData}
          activeFilter={activeFilter}
          onScroll={handleScroll}
          onUserChanged={(handleUserChangeRef) => {
            contentDisplayRef.current = handleUserChangeRef;
          }}
        />
      </View>

      {/* Floating Chat Button */}
      <TouchableOpacity style={styles.floatingChatButton} onPress={handleChatPress}>
        <Image source={require('../assets/chat.png')} style={styles.chatIcon} />
      </TouchableOpacity>

      {/* Loading Overlay for User Switching */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2f8dd7" />
          <Text style={styles.loadingText}>Switching user...</Text>
        </View>
      )}

      {/* Custom Switch User Dialog */}
      <Modal
        visible={showSwitchUserDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDialogCancel}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Select Student Profile</Text>

            <View style={styles.userListContainer}>
              {availableUsers.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.userButton}
                  onPress={() => handleUserSelection(user)}
                >
                  <Text style={styles.userButtonText}>{user.fullName}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleDialogCancel}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentSection: {
    flex: 1,
    marginTop: 8,
  },
  navigationContainer: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 16,
    marginBottom: 0,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 4,
  },
  schoolNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
  schoolSection: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  studentInfo: {
    backgroundColor: '#E8C547',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    alignItems: 'center',
    height: 45,
    overflow: 'visible',
    zIndex: 1,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    color: '#1a237e',
    fontWeight: 'bold',
  },
  studentClass: {
    fontSize: 13,
    color: '#1a237e',
    fontWeight: '600',
  },
  studentImage: {
    width: 60,
    height: 60,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  bottomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  bottomGridContainer: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  topGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    alignItems: 'center',
    marginBottom: 25,
    width: '45%',
  },
  bottomIconButton: {
    alignItems: 'center',
    marginBottom: 25,
    width: '22%',
  },
  topIconButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  iconLabel: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'normal',
    color: '#000000',
  },
  toggleButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  arrowImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  toggleButtonContainer: {
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  chatIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Custom Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    minWidth: 280,
    maxWidth: 350,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000ff',
  },
  userListContainer: {
    marginBottom: 10,
  },
  userButton: {
    paddingVertical: 10,
    width: '100%',
  },
  userButtonText: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'left',
    // fontWeight: '400',
  },
  cancelButton: {
    // backgroundColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    width: '100%',
    alignSelf: 'flex-end',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    fontWeight: '500',
  },
});