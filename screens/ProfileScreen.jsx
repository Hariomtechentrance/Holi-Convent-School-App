import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, Spacing, BorderRadius, CommonStyles } from '../styles/CommonStyles';

const ProfileScreen = ({ navigation, route }) => {
  const { userData } = route.params || {};

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login')
        }
      ]
    );
  };

  const ProfileItem = ({ label, value, icon }) => (
    <View style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {userData?.studentName?.toUpperCase() || 'STUDENT'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo and Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.photoContainer}>
            {userData?.profilePhoto ? (
              <Image
                source={{ uri: userData.profilePhoto }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {userData?.studentName?.charAt(0) || 'S'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Student Information Card */}
        <View style={styles.infoCard}>
          <ProfileItem
            label="School Name"
            value={userData?.schoolName}
          />
          <ProfileItem
            label="Parent Name"
            value={userData?.parentName}
          />
          <ProfileItem
            label="Class Name"
            value={userData?.className}
          />
          <ProfileItem
            label="Division Name"
            value={userData?.divisionName}
          />
          <ProfileItem
            label="Roll No."
            value={userData?.rollNo}
          />
          <ProfileItem
            label="Gender"
            value={userData?.gender}
          />
          <ProfileItem
            label="Admission No."
            value={userData?.admissionNo}
          />
          <ProfileItem
            label="Last Login"
            value={userData?.lastLogin}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: 'center',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#999',
  },
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginRight: 20,
  },
  profileValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '400',
    flex: 2,
    textAlign: 'left',
  },
});

export default ProfileScreen;
