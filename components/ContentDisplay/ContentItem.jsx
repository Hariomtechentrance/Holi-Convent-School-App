import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import ContentUtils from '../../utils/ContentUtils';
import ContentService from '../../services/ContentService';
import AttachmentViewer from './AttachmentViewer';

const ContentItem = ({ item, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const title = ContentUtils.getContentTitle(item);
  const description = ContentUtils.getContentDescription(item);
  const sender = ContentUtils.getContentSender(item);
  const attachments = ContentUtils.getContentAttachments(item);
  const hasAttachments = ContentUtils.hasAttachments(item);
  const isNew = ContentUtils.isNewContent(item);
  const typeBadge = ContentUtils.getContentTypeBadge(item);
  const typeColor = ContentService.getContentTypeColor(item.type);

  const truncatedDescription = ContentUtils.truncateText(description, 150);
  const shouldShowReadMore = description.length > 150;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleAttachments = () => {
    setShowAttachments(!showAttachments);
  };

  const handleCopySender = () => {
    if (sender) {
      Clipboard.setString(sender);

      // Show toast based on platform
      if (Platform.OS === 'android') {
        ToastAndroid.show('Text Copied!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Text Copied!');
      }
    }
  };

  const getFormattedDateTime = () => {
    // Get the original date string from item
    const originalDate = item.sentDate || item.createdDate || item.date || '';
    return ContentUtils.formatDateTimeForCopy(originalDate);
  };

  return (
    <View style={[styles.container, index === 0 && styles.firstItem]}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.sender} numberOfLines={1}>
                  {sender}
                </Text>
                {isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                  <Text style={styles.typeBadgeText}>{typeBadge}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={handleCopySender} style={styles.copyButton}>
              <Icon name="content-copy" size={22} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.dateTime}>{getFormattedDateTime()}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {title && (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          )}

          {description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                {isExpanded ? description : truncatedDescription}
              </Text>

              {shouldShowReadMore && (
                <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Attachments */}
          {hasAttachments && (
            <View style={styles.attachmentsSection}>
              {!showAttachments ? (
                <TouchableOpacity onPress={toggleAttachments} style={styles.seeAttachmentsButton}>
                  <Icon name="attachment" size={16} color="#4CAF50" />
                  <Text style={styles.seeAttachmentsText}>
                    See Attachments ({attachments.length})
                  </Text>
                  <Icon name="chevron-right" size={16} color="#4CAF50" />
                </TouchableOpacity>
              ) : (
                <View>
                  <TouchableOpacity onPress={toggleAttachments} style={styles.hideAttachmentsButton}>
                    <Text style={styles.hideAttachmentsText}>
                      Hide Attachments
                    </Text>
                    <Icon name="chevron-up" size={16} color="#757575" />
                  </TouchableOpacity>
                  <AttachmentViewer
                    attachments={attachments}
                    maxVisible={10}
                  />
                </View>
              )}
            </View>
          )}
        </View>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 3,
  },
  firstItem: {
    paddingTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  rightHeader: {
    alignItems: 'flex-end',
  },
  copyButton: {
    padding: 8,
    marginBottom: 4,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateTime: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'right',
  },

  content: {
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Attachments styles
  attachmentsSection: {
    marginTop: 0,
  },
  seeAttachmentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  seeAttachmentsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 6,
    flex: 1,
  },
  hideAttachmentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  hideAttachmentsText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 6,
    flex: 1,
  },

});

export default ContentItem;
