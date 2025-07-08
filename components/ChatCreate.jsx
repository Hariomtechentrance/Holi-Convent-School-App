import React, { useEffect, useState } from 'react';
import { 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View, 
  Text,
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Colors, Spacing, FontSizes, BorderRadius } from '../styles/CommonStyles';
import { ApiHelper } from "../helpers/ApiHelper";
import { PAYMENT_GATEWAY_API } from "../helpers/constants";
import { MessageHelper } from "../helpers/MessageHelper";

export default function ChatCreate({ route, navigation }) {
  const { studentInfo, roles } = route.params;

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState('');
  const [teacherName, setTeacherName] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const _handleSubjectChange = (text) => {
    setSubject(text);
  };

  const _handleMessageChange = (text) => {
    setMessage(text);
  };

  const _handleRoleSelection = (itemValue) => {
    setSelectedRoleIndex(itemValue);
    
    if (itemValue && itemValue !== '' && roles && roles[itemValue]) {
      const role = roles[itemValue];
      setTeacherName(`${role.TECH_FIRST_NAME || ''} ${role.TECH_LAST_NAME || ''}`.trim());
      setSelectedRole(role);
    } else {
      setTeacherName(null);
      setSelectedRole(null);
    }
  };

  const _handlePressSubmit = async () => {
    // Validation
    if (!selectedRole) {
      Alert.alert("Validation Error", "Please select a role.");
      return;
    }

    if (!subject || subject.trim() === '') {
      Alert.alert("Validation Error", "Please write a subject.");
      return;
    }

    if (!message || message.trim() === '') {
      Alert.alert("Validation Error", "Please write a message.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        schoolDB: studentInfo.instDbValue,
        parentid: parseInt(studentInfo.pId, 10),
        division: studentInfo.divisionName,
        class: studentInfo.className,
        sectionName: studentInfo.section,
        messageDetail: message.trim(),
        messageSubject: subject.trim()
      };

      if (selectedRole.ROLE_CODE === "T") {
        data.teacherRoleID = parseInt(selectedRole.ORG_TEACHER_ROLE_ID, 10);
        data.subID = selectedRole.SUB_ID;
      } else {
        data.teacherRoleID = parseInt(selectedRole.ORG_TEACHER_ROLE_ID, 10);
        data.subID = "NA";
      }

      console.log('Creating chat with data:', data);

      const result = await ApiHelper.callPostAPI(PAYMENT_GATEWAY_API + '/communication/parent/startCommunication', data);

      if (result.status && result.status.success === true) {
        Alert.alert(
          "Success", 
          "Chat created successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to create chat. Please try again.");
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert("Error", "Failed to create chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageWrapper}>
        <Text style={styles.topText}>Initiate Chat With</Text>
        
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedRoleIndex}
            onValueChange={_handleRoleSelection}
            style={styles.picker}
            dropdownIconColor="#2f8dd7"
          >
            <Picker.Item label="Select Role" value="" />
            {roles && roles.map((role, index) => (
              <Picker.Item 
                key={index} 
                label={role.ROLE_NAME} 
                value={index.toString()} 
              />
            ))}
          </Picker>
        </View>

        {teacherName && (
          <>
            <Text style={styles.centerText}>Message to Teacher</Text>
            <Text style={styles.teacherName}>{teacherName.toUpperCase()}</Text>
          </>
        )}

        <TextInput
          placeholder="Message Subject"
          style={styles.subject}
          value={subject}
          onChangeText={_handleSubjectChange}
          placeholderTextColor={Colors.textLight}
          maxLength={100}
        />

        <View style={styles.messageDetailsWrapper}>
          <TextInput
            placeholder="Message Details"
            multiline={true}
            value={message}
            onChangeText={_handleMessageChange}
            style={styles.messageInput}
            placeholderTextColor={Colors.textLight}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <Pressable 
          onPress={_handlePressSubmit} 
          style={[styles.buttonContainer, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <View style={styles.buttonContent}>
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>SUBMIT</Text>
            )}
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pageWrapper: {
    padding: Spacing.lg,
  },
  topText: {
    color: Colors.gray,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  picker: {
    height: 50,
    color: Colors.text,
  },
  centerText: {
    color: Colors.gray,
    marginTop: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  teacherName: {
    color: '#2f8dd7',
    marginBottom: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  subject: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.lg,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageDetailsWrapper: {
    marginBottom: Spacing.lg,
  },
  messageInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 120,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#2f8dd7',
    borderRadius: 0,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
