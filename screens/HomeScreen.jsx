import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, UIManager, Platform } from 'react-native';
import ContentDisplaySection from '../components/ContentDisplay/ContentDisplaySection';

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
    image: require('../assets/icc_fees.png')
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
  const rotateAnim = useState(new Animated.Value(expanded ? 1 : 0))[0];
  const slideAnim = useState(new Animated.Value(expanded ? 1 : 0))[0];
  const menuAnim = useState(new Animated.Value(1))[0]; // 1 = visible, 0 = hidden
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('down');
  const animationTimeout = useRef(null);

  // Get user data from navigation params
  const userData = route?.params?.userData || {};

  // Extract student information from API response
  const studentName = userData.studentName || 'Student Name';
  const className = userData.className || 'Class';
  const divisionName = userData.divisionName || '';
  const gender = userData.gender || 'MALE';
  const profilePhoto = userData.profilePhoto || '';
  const schoolName = userData.schoolName || 'HOLY CROSS CONVENT SCHOOL';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

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

  const handleProfilePress = () => {
    navigation.navigate('Profile', { userData });
  };

  const handleChatPress = () => {
    navigation.navigate('ChatList', { studentInfo: userData });
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
        <TouchableOpacity onPress={handleProfilePress}>
          <Image source={getStudentImage()} style={styles.studentImage} />
        </TouchableOpacity>
                <TouchableOpacity style={styles.menuDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </TouchableOpacity>
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
        />
      </View>

      {/* Floating Chat Button */}
      <TouchableOpacity style={styles.floatingChatButton} onPress={handleChatPress}>
        <Image source={require('../assets/chat.png')} style={styles.chatIcon} />
      </TouchableOpacity>
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
  menuDots: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginVertical: 2,
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
});