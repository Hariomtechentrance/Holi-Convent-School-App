import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, Spacing, BorderRadius, CommonStyles } from '../styles/CommonStyles';

const HomeScreen = ({ navigation, route }) => {
  const { userData } = route.params || {};

  const handleProfilePress = () => {
    navigation.navigate('Profile', { userData });
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  // Navigation items data - using exact icons and colors from the image
  const navigationItems = [
    { id: 'alert', title: 'ALERT', icon: '🔔', color: '#FF5252', bgColor: '#FFEBEE' },
    { id: 'circular', title: 'CIRCULAR', icon: '📄', color: '#FFC107', bgColor: '#FFF8E1' },
    { id: 'homework', title: 'HOMEWORK', icon: '📝', color: '#FF9800', bgColor: '#FFF3E0' },
    { id: 'moments', title: 'MOMENTS', icon: '📷', color: '#E91E63', bgColor: '#FCE4EC' },
    { id: 'profile', title: 'Profile', icon: '👤', color: '#2196F3', bgColor: '#E3F2FD' },
    { id: 'fees', title: 'Pay Fees', icon: '₹', color: '#4CAF50', bgColor: '#E8F5E8' },
    { id: 'attendance', title: 'Attendance', icon: '📅', color: '#9C27B0', bgColor: '#F3E5F5' },
    { id: 'website', title: 'Website', icon: '🌐', color: '#00BCD4', bgColor: '#E0F2F1' },
    { id: 'contact', title: 'Contact Us', icon: '📞', color: '#607D8B', bgColor: '#ECEFF1' },
    { id: 'performance', title: 'Performance', icon: '📊', color: '#FF9800', bgColor: '#FFF3E0' },
  ];

  // Get moments data from API response
  const momentsData = userData?.LIST?.filter(item => item.type === 'circular' || item.type === 'alert') || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      {/* Header Section */}
      <View style={styles.header}>
        {/* Top Row with School Logo and Profile */}
        <View style={styles.topRow}>
          <View style={styles.schoolInfo}>
            {userData?.schoolLogo ? (
              <Image
                source={{ uri: userData.schoolLogo }}
                style={styles.schoolLogo}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>HCCS</Text>
              </View>
            )}
            <View style={styles.schoolDetails}>
              <Text style={styles.schoolName} numberOfLines={2}>
                {userData?.schoolName || 'HOLY CROSS CONVENT SCHOOL'}
              </Text>
              <Text style={styles.schoolSubtext}>[ ICSE SECTION ]</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <View style={styles.profileAvatar}>
              {userData?.profilePhoto ? (
                <Image
                  source={{ uri: userData.profilePhoto }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.profileInitial}>
                  {userData?.studentName?.charAt(0) || 'D'}
                </Text>
              )}
            </View>
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Student Info Banner */}
        <View style={styles.studentBanner}>
          <Text style={styles.studentNameBanner}>
            {userData?.studentName?.toUpperCase() || 'DHWANI'}
          </Text>
          <Text style={styles.classInfoBanner}>
            {userData?.className || 'VII'} {userData?.divisionName || 'B'}
          </Text>
        </View>
      </View>

      {/* Navigation Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.navigationGrid}>
          {navigationItems.slice(0, 8).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => {
                if (item.id === 'profile') {
                  handleProfilePress();
                } else {
                  // Handle other navigation items
                  console.log(`Navigate to ${item.title}`);
                }
              }}
            >
              <View style={[styles.navIcon, { backgroundColor: item.bgColor }]}>
                <Text style={[styles.navIconText, { color: item.color }]}>{item.icon}</Text>
              </View>
              <Text style={styles.navTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Up Arrow */}
        <View style={styles.upArrowContainer}>
          <View style={styles.upArrow}>
            <Text style={styles.upArrowText}>▲</Text>
          </View>
        </View>

        {/* Bottom Row Navigation */}
        <View style={styles.bottomNavigation}>
          {navigationItems.slice(8).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.bottomNavItem}
              onPress={() => {
                console.log(`Navigate to ${item.title}`);
              }}
            >
              <View style={[styles.bottomNavIcon, { backgroundColor: item.bgColor }]}>
                <Text style={[styles.navIconText, { color: item.color }]}>{item.icon}</Text>
              </View>
              <Text style={styles.bottomNavTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Moments Section - Using Real API Data */}
        <View style={styles.momentsSection}>
          {momentsData.slice(0, 2).map((moment, index) => (
            <View key={moment.circularTransId || moment.alertTransId || index} style={styles.momentItem}>
              <View style={styles.momentHeader}>
                <Text style={styles.momentLabel}>
                  {moment.type === 'circular' ? 'MOMENT' : 'MOMENT'}
                </Text>
                <Text style={styles.momentDate}>
                  {moment.sentDate || moment.startDate}
                </Text>
                <TouchableOpacity style={styles.momentMenu}>
                  <Text style={styles.momentMenuText}>📋</Text>
                </TouchableOpacity>
              </View>

              {moment.subject && (
                <Text style={styles.momentTitle}>{moment.subject}</Text>
              )}

              {moment.description && (
                <Text style={styles.momentText}>{moment.description}</Text>
              )}

              {moment.alertMessage && (
                <Text style={styles.momentText}>{moment.alertMessage}</Text>
              )}

              {moment.attachments && moment.attachments.length > 0 && (
                <>
                  <Text style={styles.attachmentText}>ATTACHMENT [{moment.attachments.length}]</Text>
                  {moment.attachments[0].filePath && (
                    <Image
                      source={{ uri: moment.attachments[0].filePath }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  )}
                </>
              )}
            </View>
          ))}

          {/* If no moments from API, show placeholder */}
          {momentsData.length === 0 && (
            <View style={styles.momentItem}>
              <View style={styles.momentHeader}>
                <Text style={styles.momentLabel}>MOMENT</Text>
                <Text style={styles.momentDate}>No moments available</Text>
              </View>
              <Text style={styles.momentText}>No moments to display</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schoolLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  schoolSubtext: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  menuDots: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  studentBanner: {
    backgroundColor: '#FFB74D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentNameBanner: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  classInfoBanner: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  navItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 25,
  },
  navIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  upArrowContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  upArrow: {
    width: 30,
    height: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  upArrowText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  bottomNavItem: {
    alignItems: 'center',
  },
  bottomNavIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bottomNavTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 12,
  },
  momentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  momentItem: {
    backgroundColor: Colors.white,
    borderRadius: 0,
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  momentLabel: {
    backgroundColor: '#4CAF50',
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  momentDate: {
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  momentMenu: {
    padding: 4,
  },
  momentMenuText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  momentText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F5F5',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  attachmentImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  attachmentPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E91E63',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentEmoji: {
    fontSize: 40,
  },
});

export default HomeScreen;
