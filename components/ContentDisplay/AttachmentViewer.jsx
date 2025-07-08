import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ContentUtils from '../../utils/ContentUtils';

const AttachmentViewer = ({ attachments, maxVisible = 3 }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleAttachmentPress = async (attachment) => {
    const url = ContentUtils.getFullAttachmentUrl(attachment);

    if (!url) {
      Alert.alert('Error', 'File not available');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const renderAttachment = (attachment, index) => {
    const fileName = attachment.fileName || 'Unknown File';
    const fileSize = ContentUtils.formatFileSize(attachment.fileSize);
    const fileType = attachment.fileType || '';
    const iconName = ContentUtils.getFileTypeIcon(fileName, fileType);
    const iconColor = ContentUtils.getFileTypeColor(fileName, fileType);

    // Check if it's an image
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType.toLowerCase());
    const imageUrl = ContentUtils.getFullAttachmentUrl(attachment);

    return (
      <TouchableOpacity
        key={index}
        style={styles.attachmentItem}
        onPress={() => handleAttachmentPress(attachment)}
      >
        <View style={styles.attachmentContent}>
          {isImage && imageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Icon name="eye" size={16} color="#FFFFFF" />
              </View>
            </View>
          ) : (
            <View style={[styles.fileIconContainer, { backgroundColor: iconColor + '20' }]}>
              <Icon name={iconName} size={24} color={iconColor} />
            </View>
          )}

          <View style={styles.attachmentInfo}>
            <Text style={styles.fileName} numberOfLines={2}>
              {fileName}
            </Text>
            {fileSize && (
              <Text style={styles.fileSize}>
                {fileSize}
              </Text>
            )}
          </View>

          <View style={styles.downloadIcon}>
            <Icon name="download" size={16} color="#757575" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const visibleAttachments = attachments.slice(0, maxVisible);
  const remainingCount = attachments.length - maxVisible;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="attachment" size={16} color="#757575" />
        <Text style={styles.headerText}>
          Attachments
        </Text>
      </View>

      <View style={styles.attachmentsList}>
        {visibleAttachments.map((attachment, index) =>
          renderAttachment(attachment, index)
        )}

        {remainingCount > 0 && (
          <View style={styles.moreAttachments}>
            <Text style={styles.moreText}>
              +{remainingCount} more file{remainingCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginLeft: 4,
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 18,
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  downloadIcon: {
    padding: 4,
  },
  moreAttachments: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
});

export default AttachmentViewer;
