import React, { useEffect, useRef, useState } from 'react';
import { 
  FlatList, 
  Pressable, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Alert 
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { PAYMENT_GATEWAY_API } from "../helpers/constants";
import { ApiHelper } from "../helpers/ApiHelper";
import { dateFormatChat } from '../helpers/DateHelper';
import { Colors, Spacing, FontSizes, BorderRadius } from '../styles/CommonStyles';

export default function ChatList({ route, navigation }) {
  const { studentInfo } = route.params;
  const routeName = route.name;

  const [roles, setRoles] = useState(null);
  const [openedList, setOpenedList] = useState([]);
  const [closedList, setClosedList] = useState([]);

  const timeoutId = useRef(null);

  const _handleItemPress = (item) => {
    navigation.navigate('ChatScreen', {
      data: item,
      roles,
      studentInfo
    });
  };

  const _handleCreateChat = () => {
    navigation.navigate('ChatCreate', {
      studentInfo,
      roles
    });
  };

  const _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => _handleItemPress(item)}>
        <View style={styles.listItemWrapper}>
          <View style={styles.listItemHeader}>
            <Text style={styles.toText}>To,</Text>
            <Text style={styles.dateText}>{dateFormatChat(item.CREATED_TIMESTAMP)}</Text>
          </View>
          <Text style={styles.listItemSubject}>{item.ROLE_NAME || 'Class Teacher'}</Text>
          <Text style={styles.messageText}>{item.MESSAGE_SUB || item.SUBJECT || 'No Subject'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const _fetchTeacherRoles = async () => {
    try {
      const {
        instDbValue,
        pId,
        section,
        className,
        divisionName
      } = studentInfo;
      
      const url = PAYMENT_GATEWAY_API + "/communication/parent/roles?schoolDB=" + instDbValue + "&parentid=" + pId + "&divName=" + divisionName + "&className=" + className + "&sectionName=" + section;
      console.log('Fetching roles:', url);
      
      let role = await ApiHelper.callGetAPI(url);

      if (role.result && role.result.length > 0) {
        setRoles(role.result);
      }
    } catch (error) {
      console.error('Error fetching teacher roles:', error);
      Alert.alert('Error', 'Failed to fetch teacher roles. Please try again.');
    }
  };

  const _fetchChatList = async function _fetchChatList(status) {
    try {
      const {
        instDbValue,
        pId,
      } = studentInfo;
      
      const url = PAYMENT_GATEWAY_API + "/communication/parent/communicationList?schoolDB=" + instDbValue + "&parentid=" + pId + "&status=" + status;
      let chatList = await ApiHelper.callGetAPI(url);

      if (chatList.result && chatList.result.length > 0) {
        console.log('Chat list received for status', status, ':', chatList.result);
        if (status === 'open') {
          setOpenedList(chatList.result);
        } else {
          setClosedList(chatList.result);
        }
      }

      timeoutId.current = setTimeout(() => {
        _fetchChatList(status);
      }, 5000);
    } catch (error) {
      console.error('Error fetching chat list:', error);
      // Continue with auto-refresh even on error
      timeoutId.current = setTimeout(() => {
        _fetchChatList(status);
      }, 5000);
    }
  };

  useEffect(() => {
    _fetchTeacherRoles();
    console.log('Route name:', routeName);
    
    if (routeName === 'CloseChatHistory') {
      _fetchChatList('close');
    } else {
      _fetchChatList('open');
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={routeName !== 'CloseChatHistory' ? openedList.reverse() : closedList}
          renderItem={_renderItem}
          keyExtractor={(item, index) => item.ORG_COMMUNICATION_MASTER_ID?.toString() || index.toString()}
          ListHeaderComponent={
            routeName !== 'CloseChatHistory' ? 
              <ListHeader navigation={navigation} studentInfo={studentInfo} /> : 
              <View></View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {routeName !== 'CloseChatHistory' && (
        <TouchableOpacity style={styles.buttonWrapper} onPress={_handleCreateChat}>
          <View style={styles.floatButtonWrapper}>
            <Icon name="plus" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}

const ListHeader = ({ navigation, studentInfo }) => {
  const _handleOnPress = () => {
    navigation.navigate('CloseChatHistory', {
      studentInfo
    });
  };

  return (
    <Pressable onPress={_handleOnPress}>
      <View style={styles.closedChatWrapper}>
        <Icon style={styles.closedChatIcon} name="archive" size={20} color="#2E8DD6" />
        <Text style={styles.closedChatText}>Closed Chats</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  closedChatWrapper: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    borderRadius: 0,
  },
  closedChatIcon: { 
    marginRight: Spacing.sm 
  },
  closedChatText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  listItemWrapper: {
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
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
    // marginBottom: Spacing.sm
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
    fontWeight: "bold",
    fontSize: FontSizes.sm,
    color: Colors.gray,
    // marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
  },
  floatButtonWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2f8dd7',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  buttonWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 30
  },
});
