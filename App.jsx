import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import FlashMessage from 'react-native-flash-message';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';

// Import chat components
import ChatList from './components/ChatList';
import ChatScreen from './components/ChatScreen';
import ChatCreate from './components/ChatCreate';

// Import payment components
import FeesHomeActivity from './components/fees/FeesHomeActivity';
import ReceiptsActivity from './components/fees/ReceiptsActivity';
import PaymentWebView from './components/PaymentWebView';
import FeesDetailedList from './components/FeesDetailedList';

// Import styles
import { Colors } from './styles/CommonStyles';

const Stack = createStackNavigator();

function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="ChatList"
            component={ChatList}
            options={{
              title: 'Chat History',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="CloseChatHistory"
            component={ChatList}
            options={{
              title: 'Closed Chats History',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              title: 'Chat',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="ChatCreate"
            component={ChatCreate}
            options={{
              title: 'Start New Chat',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="Fees"
            component={FeesHomeActivity}
            options={{
              title: 'Fees',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="ViewReceipts"
            component={ReceiptsActivity}
            options={{
              title: 'Payment Receipts',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="WebView"
            component={PaymentWebView}
            options={{
              title: 'Payment',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="FeesDetailedList"
            component={FeesDetailedList}
            options={{
              title: 'Fee Details',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              headerTintColor: Colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </SafeAreaProvider>
    </PaperProvider>
  );
}

export default App;