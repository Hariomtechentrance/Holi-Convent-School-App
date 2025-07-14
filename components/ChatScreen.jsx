import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { dateFormatChat } from '../helpers/DateHelper';
import { Colors, Spacing, FontSizes, BorderRadius } from '../styles/CommonStyles';
import { PAYMENT_GATEWAY_API } from '../helpers/constants';
import { ApiHelper } from '../helpers/ApiHelper';
import { MessageHelper } from '../helpers/MessageHelper';

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [headers, setHeaders] = useState(null);
  const [inputText, setInputText] = useState('');

  const { data, roles, studentInfo } = route.params;

  // Debug logging to check data structure
  console.log('ChatScreen data:', data);
  console.log('ChatScreen roles:', roles);

  const timeoutId = useRef(null);
  const listRef = useRef(null);
  const totalMessages = useRef(0);

  const _fetchAllMessages = async function _fetchAllMessages() {
    try {
      const { ORG_COMMUNICATION_MASTER_ID } = data;
      const { instDbValue } = studentInfo;

      const url = PAYMENT_GATEWAY_API + "/communication/detail?schoolDB=" + instDbValue + "&communicationID=" + ORG_COMMUNICATION_MASTER_ID;
      let messages = await ApiHelper.callGetAPI(url);

      if (messages.result) {
        setMessages(messages.result.detail || []);
        setHeaders(messages.result.header || null);
        console.log('Chat headers received:', messages.result.header);
        console.log('Chat messages received:', messages.result.detail);
      }

      timeoutId.current = setTimeout(() => {
        _fetchAllMessages();
      }, 5000);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Continue with auto-refresh even on error
      timeoutId.current = setTimeout(() => {
        _fetchAllMessages();
      }, 5000);
    }
  };

  const _sendMessage = async function (text) {
    try {
      const { ORG_COMMUNICATION_MASTER_ID } = data;
      const { instDbValue } = studentInfo;

      const d = {
        schoolDB: instDbValue,
        communicationID: parseInt(ORG_COMMUNICATION_MASTER_ID, 10),
        msg: text
      };

      const url = PAYMENT_GATEWAY_API + "/communication/sendMessage";

      let result = await ApiHelper.callPostAPI(url, d);

      if (result.status && result.status.success) {
        setMessages([...messages, ...result.result]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === "") {
      MessageHelper.showWarning(null, "Please write some message first");
      Alert.alert('Warning', 'Please write some message first');
      return;
    }

    _sendMessage(inputText.trim());
    setInputText('');
  };

  useEffect(() => {
    _fetchAllMessages();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (totalMessages.current < messages.length) {
        console.log("Scroll to end");
        listRef.current?.scrollToEnd({ animated: true });
      }
      totalMessages.current = messages.length;
    }, 200); // Give little breathing room 
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isTeacher = item.TEACHER_ID !== null;

    return (
      <View
        style={[
          styles.messageContainer,
          !isTeacher ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={[styles.senderName, !isTeacher ? styles.userText : styles.teacherText]}>
          {!isTeacher ? "You" : `${item.TECH_FIRST_NAME || ''} ${item.TECH_LAST_NAME || ''}`.trim() || 'Teacher'}
        </Text>
        <Text style={[styles.messageText, !isTeacher ? styles.userText : styles.teacherText]}>
          {item.MESSSGE || item.MESSAGE || item.CONTENT || 'No message content'}
        </Text>
        <Text style={[styles.timestampText, !isTeacher ? styles.userTimestamp : styles.teacherTimestamp]}>
          {dateFormatChat(item.CREATED_TIMESTAMP)}
        </Text>
      </View>
    );
  };

  const ListHeaderComponent = () => (
    <View style={styles.listItemWrapper}>
      <View style={styles.listItemHeader}>
        <Text style={styles.toText}>To,</Text>
        <Text style={styles.dateText}>{dateFormatChat(data.CREATED_TIMESTAMP)}</Text>
      </View>
      <Text style={styles.listItemSubject}>
        {data.ROLE_NAME || headers?.ROLE_NAME || 'Class Teacher'}
      </Text>
      <Text style={styles.listItemSubject}>Message Subject:</Text>
      <Text style={styles.messageText}>
        {data.MESSAGE_SUB || headers?.MESSAGE_SUB || data.SUBJECT || 'No Subject'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        ref={listRef}
        keyExtractor={(item, index) => item.ORG_COMMUNICATION_DETAIL_ID?.toString() || index.toString()}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.inputContainer}>
        {headers && headers.IS_ACTIVE === "1" && (
          <>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textLight}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </>
        )}

        {headers && headers.IS_ACTIVE === "0" && (
          <View style={styles.closedContainer}>
            <Text style={styles.closedText}>This conversation is closed by the teacher.</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: Spacing.md,
  },
  messageContainer: {
    width: '100%',
    marginVertical: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: 0,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2f8dd7',
    marginLeft: '20%',
    alignItems: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: '20%',
    alignItems: 'flex-start',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    fontSize: FontSizes.sm,
  },
  messageText: {
    fontSize: FontSizes.md,
    lineHeight: 20,
  },
  timestampText: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.xs,
  },
  userText: {
    color: Colors.white,
    textAlign: 'right',
  },
  teacherText: {
    color: Colors.text,
    textAlign: 'left',
  },
  userTimestamp: {
    color: Colors.lightGray,
    textAlign: 'right',
  },
  teacherTimestamp: {
    color: Colors.gray,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    marginRight: Spacing.sm,
    maxHeight: 100,
    color: Colors.text,
  },
  sendButton: {
    backgroundColor: '#2f8dd7',
    borderRadius: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  closedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  closedText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSizes.md,
    fontStyle: 'italic',
  },
  listItemWrapper: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 0,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  toText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  dateText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  listItemSubject: {
    fontWeight: 'bold',
    fontSize: FontSizes.md,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
});

export default ChatScreen;
