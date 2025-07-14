import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AuthService from '../services/AuthService';
import { Colors, FontSizes, Spacing } from '../styles/CommonStyles';
import { ACTION_ADD_CHILD, ACTION_LOGOUT } from '../helpers/constants';

const LoginScreen = ({ navigation, route }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Get route parameters for add child functionality
  const routeParam = route?.params;
  const isAddChild = routeParam?.loginAction === ACTION_ADD_CHILD;

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.trim().length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-login functionality
  useEffect(() => {
    if (routeParam && routeParam.loginAction) {
      console.log("Login Action is:", routeParam.loginAction);

      if (routeParam.loginAction === ACTION_ADD_CHILD) {
        setUsername("");
        setPassword("");
        // Don't auto-login for add child
      } else if (routeParam.loginAction === ACTION_LOGOUT) {
        setUsername("");
        setPassword("");
        // Don't auto-login after logout - user must manually login
        console.log("User logged out - manual login required");
      } else if (routeParam.loginAction === 'USER_SWITCH' && routeParam.switchToUser) {
        // Handle user switch - auto login with the switched user
        handleUserSwitch(routeParam.switchToUser);
      }
    } else {
      // Auto-login with last logged-in user if available
      autoLogin();
    }
  }, []);

  const autoLogin = async () => {
    console.log("autoLogin started");
    setLoading(true);

    try {
      const result = await AuthService.autoLogin();
      if (result.success) {
        console.log("Auto login successful for:", result.data.studentName);
        navigation.replace('Home', {
          userData: {
            ...result.data,
            isAutoLogin: true
          }
        });
      } else {
        console.log("No valid stored credentials for auto-login");
        // Show login form for manual login
      }
    } catch (error) {
      console.error("Auto login error:", error);
      // Show login form for manual login
    } finally {
      setLoading(false);
    }
  };

  const handleUserSwitch = async (switchToUser) => {
    console.log("Handling user switch to:", switchToUser.fullName);
    setLoading(true);

    try {
      // Get the full user credentials from storage
      const userCredentials = await AuthService.getStoredUsers();
      if (userCredentials.success) {
        const fullUserData = userCredentials.data.find(user => user.username === switchToUser.username);
        if (fullUserData && fullUserData.password) {
          // Validate login with the switched user's credentials
          const result = await AuthService.validateLogin(fullUserData.username, fullUserData.password);
          if (result.success) {
            console.log("User switch login successful");
            navigation.replace('Home', {
              userData: {
                ...result.data,
                isSwitchedUser: true
              }
            });
          } else {
            Alert.alert('Error', 'Failed to switch user. Please try again.');
          }
        } else {
          Alert.alert('Error', 'User credentials not found. Please login again.');
        }
      }
    } catch (error) {
      console.error("User switch error:", error);
      Alert.alert('Error', 'Failed to switch user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await AuthService.validateLogin(username, password, isAddChild);

      if (response.success) {
        if (isAddChild) {
          // For add child, navigate to home with the new child's data
          Alert.alert(
            'Success',
            'Child added successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Always navigate to Home with the new child's data
                  // This ensures the HomeScreen has the correct current user info
                  navigation.replace('Home', {
                    userData: {
                      ...response.data,
                      isNewChild: true // Flag to indicate this is a newly added child
                    }
                  });
                }
              }
            ]
          );
        } else {
          // Regular login - navigate to Home screen
          navigation.replace('Home', { userData: response.data });
        }
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      {/* Full Screen Loading Overlay */}
      {loading && (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.loadingText}>
            {isAddChild ? 'Adding Child...' : 'Logging in...'}
          </Text>
        </View>
      )}

      <ImageBackground
        source={require('../assets/back_image.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
          {/* Back Button for Add Child */}
          {isAddChild && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (routeParam?.canReturnHome) {
                  navigation.goBack();
                } else {
                  autoLogin();
                }
              }}
            >
              <Icon name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Header Text */}
            <Text style={styles.headerText}>
              {isAddChild
                ? 'Add Child Account\n\nEnter the UserID and Password\nfor the additional child'
                : 'Dear Parent, please enter the\nUserID and Password received\nfrom the School via Whatsapp'
              }
            </Text>

            {/* Login Form */}
            <View style={styles.formContainer}>
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.username && styles.inputError,
                    focusedInput === 'username' && styles.inputFocus
                  ]}
                  placeholder="Enter User ID (eg cv786756)"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: null }));
                    }
                  }}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.passwordContainer,
                  errors.password && styles.inputError,
                  focusedInput === 'password' && styles.inputFocus
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: null }));
                      }
                    }}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.6}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                  >
                    <Icon
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={24}
                      color={focusedInput === 'password' ? Colors.primary : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forget User ID & Password ?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backgroundImage: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  headerText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 16,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 0,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'transparent',
    fontWeight: '400',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 0,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'transparent',
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderBottomColor: Colors.error,
    borderBottomWidth: 2,
  },
  inputFocus: {
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotPasswordText: {
    color: '#F59E0B', // Yellow color as shown in image
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loginButton: {
    backgroundColor: '#4CAF50', // Green color as shown in image
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 0, // No border radius as shown in image
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    minHeight: 56,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default LoginScreen;
