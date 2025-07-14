import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  Alert, 
  BackHandler 
} from 'react-native';
import WebView from 'react-native-webview';
import { Colors, Spacing, FontSizes } from '../styles/CommonStyles';

const PaymentWebView = ({ route, navigation }) => {
  const routeParam = route.params;
  const url = routeParam.url;
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        title: `${routeParam.title || 'Payment'}`,
      });
    }
  }, [navigation]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Cancel Payment",
        "Are you sure you want to cancel the payment?",
        [
          {
            text: "No",
            onPress: () => null,
            style: "cancel"
          },
          { 
            text: "Yes", 
            onPress: () => {
              navigation.navigate('Fees', {
                studentInfo: routeParam.studentInfo,
                paymentCancelled: true
              });
            }
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const getQueryParam = (url, param) => {
    const queryString = url.split('?')[1];
    if (!queryString) return null;
  
    const params = queryString.split('&');
    for (let i = 0; i < params.length; i++) {
      const pair = params[i].split('=');
      if (decodeURIComponent(pair[0]) === param) {
        return decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
    }
    return null;
  };

  const handleWebViewNavigationStateChange = (event) => {
    console.log(event);

    if (event.url) {
      let eventURL = `${event.url}`;

      if (eventURL.startsWith(routeParam.closeURL)) {
        console.log(`${event.url} -> Now close URL ${routeParam.closeURL}  Trans ID ${routeParam.transID}`);

        const parsedUrl = new URL(event.url);
        let msg = getQueryParam(eventURL, 'msg');

        if (msg) {
          // Alert.alert("Fees", msg);
        }

        let screen = 'Fees';

        setTimeout(() => {
          navigation.navigate(screen, {
            studentInfo: routeParam.studentInfo,
            transID: routeParam.transID,
            forceRefresh: true,
            transURL: eventURL,
          });
        }, 2000);
      }
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    Alert.alert(
      'Connection Error',
      'Failed to load payment page. Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: () => {
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }
        },
        {
          text: 'Cancel',
          onPress: () => {
            navigation.navigate('Fees', {
              studentInfo: routeParam.studentInfo,
              paymentError: true
            });
          }
        }
      ]
    );
  };

  const handleWebViewLoad = () => {
    setIsLoading(false);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2f8dd7" />
      <Text style={styles.loadingText}>Loading payment gateway...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load payment page</Text>
      <Text style={styles.errorSubText}>Please check your internet connection</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={renderLoading}
        scalesPageToFit
        onNavigationStateChange={handleWebViewNavigationStateChange}
        style={styles.webView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
    marginTop: 55
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentWebView;
