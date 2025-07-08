import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ContentItem from './ContentItem';

const ContentList = ({
  content,
  loading,
  refreshing,
  onRefresh,
  activeFilter,
  onEndReached,
  onEndReachedThreshold = 0.1,
  onScroll
}) => {
  const renderItem = ({ item, index }) => (
    <ContentItem item={item} index={index} />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      );
    }

    const getEmptyMessage = () => {
      switch (activeFilter) {
        case 'alerts':
          return {
            icon: 'alert-circle-outline',
            title: 'No Alerts',
            message: 'No alerts available at the moment.'
          };
        case 'circulars':
          return {
            icon: 'file-document-outline',
            title: 'No Circulars',
            message: 'No circulars available at the moment.'
          };
        case 'homework':
          return {
            icon: 'book-open-page-variant-outline',
            title: 'No Homework',
            message: 'No homework assignments available at the moment.'
          };
        case 'moments':
          return {
            icon: 'image-multiple-outline',
            title: 'No Moments',
            message: 'No moments available at the moment.'
          };
        default:
          return {
            icon: 'inbox-outline',
            title: 'No Content',
            message: 'No content available at the moment.'
          };
      }
    };

    const emptyState = getEmptyMessage();

    return (
      <View style={styles.centerContainer}>
        <Icon name={emptyState.icon} size={64} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>{emptyState.title}</Text>
        <Text style={styles.emptyMessage}>{emptyState.message}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || content.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2196F3" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const keyExtractor = (item, index) => {
    // Create unique key based on item type and ID
    const id = item.albumId ||
               item.alertTransId ||
               item.circularTransId ||
               item.classWorkTransId ||
               item.messageID ||
               index;
    return `${item.type}-${id}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={content}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          content.length === 0 && styles.emptyListContainer
        ]}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
});

export default ContentList;
