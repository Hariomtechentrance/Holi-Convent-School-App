import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ContentService from '../../services/ContentService';
import ContentList from './ContentList';

const ContentDisplaySection = ({ userData, activeFilter = 'all', onScroll }) => {
  const [content, setContent] = useState({
    all: [],
    alerts: [],
    circulars: [],
    homework: [],
    moments: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Get current filtered content
  const getCurrentContent = () => {
    return content[activeFilter] || [];
  };

  // Process content from userData (which includes LIST from login)
  const processInitialContent = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      // Use the LIST data that came from the login response
      if (userData && userData.LIST && Array.isArray(userData.LIST)) {
        const processedContent = ContentService.processContentItems(userData.LIST);
        setContent(processedContent);
      } else {
        setError('No content data available');
      }
    } catch (error) {
      console.error('Error processing content:', error);
      setError('Failed to process content data');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  // Fetch fresh content from API (for refresh)
  const fetchContent = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await ContentService.fetchStudentContent(userData);

      if (response.success) {
        const processedContent = ContentService.processContentItems(response.data);
        setContent(processedContent);
      } else {
        setError(response.message);
        if (!isRefresh) {
          Alert.alert('Error', response.message);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      const errorMessage = 'Failed to load content. Please try again.';
      setError(errorMessage);
      if (!isRefresh) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchContent(true);
  };

  // Handle load more (for future pagination)
  const handleLoadMore = () => {
    // TODO: Implement pagination if needed
    console.log('Load more content...');
  };

  // Initial load
  useEffect(() => {
    if (userData && userData.LIST) {
      processInitialContent();
    }
  }, [userData, processInitialContent]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userData && !loading && !refreshing) {
        fetchContent(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userData, loading, refreshing, fetchContent]);

  return (
    <View style={styles.container}>
      {/* Content List */}
      <ContentList
        content={getCurrentContent()}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        activeFilter={activeFilter}
        onEndReached={handleLoadMore}
        onScroll={onScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default ContentDisplaySection;
