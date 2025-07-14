import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ContentService from '../../services/ContentService';
import ContentList from './ContentList';
import { StorageHelper } from '../../helpers/StorageHelper';

const ContentDisplaySection = ({ userData, activeFilter = 'all', onScroll, onUserChanged }) => {
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

  const offset = useRef("0");
  const filter = useRef("All");
  const isDataAvl = useRef(true);
  const LIMIT = "10";

  // Get current filtered content
  const getCurrentContent = () => {
    return content[activeFilter] || [];
  };

  const fetchContentForUser = useCallback(async (storedUserInfo) => {
    try {
      if (!storedUserInfo || !storedUserInfo.originalUserName || !storedUserInfo.originalPassword) {
        throw new Error('User credentials not available');
      }

      const response = await ContentService.fetchStudentContentWithPagination(
        storedUserInfo.originalUserName,
        storedUserInfo.originalPassword,
        offset.current,
        LIMIT,
        filter.current
      );

      if (response.success && response.data && response.data.LIST) {
        const newItems = ContentService.processContentItems(response.data.LIST);

        console.log('=== DATA MERGE DEBUG ===');
        console.log('New items received:', response.data.LIST.length);
        console.log('Offset:', offset.current);
        console.log('Is first request:', offset.current === "0");

        // Merge data with deduplication to prevent duplicate keys
        if (offset.current !== "0") {
          // Not the first request - append new data with deduplication
          console.log('Appending new data to existing content');
          setContent(prevContent => {
            // Helper function to deduplicate items
            const deduplicateItems = (existingItems, newItems) => {
              const existingIds = new Set();

              // Create unique identifiers for existing items
              existingItems.forEach(item => {
                const uniqueId = `${item.type}-${item.albumId || item.alertTransId || item.circularTransId || item.classWorkTransId || item.messageID || item.id}-${item.sentDate || item.startDate || ''}`;
                existingIds.add(uniqueId);
              });

              // Filter out duplicates from new items
              const filteredNewItems = newItems.filter(item => {
                const uniqueId = `${item.type}-${item.albumId || item.alertTransId || item.circularTransId || item.classWorkTransId || item.messageID || item.id}-${item.sentDate || item.startDate || ''}`;
                return !existingIds.has(uniqueId);
              });

              return [...existingItems, ...filteredNewItems];
            };

            const updatedContent = {
              all: deduplicateItems(prevContent.all, newItems.all),
              alerts: deduplicateItems(prevContent.alerts, newItems.alerts),
              circulars: deduplicateItems(prevContent.circulars, newItems.circulars),
              homework: deduplicateItems(prevContent.homework, newItems.homework),
              moments: deduplicateItems(prevContent.moments, newItems.moments)
            };

            console.log('Updated content lengths (after deduplication):', {
              all: updatedContent.all.length,
              alerts: updatedContent.alerts.length,
              circulars: updatedContent.circulars.length,
              homework: updatedContent.homework.length,
              moments: updatedContent.moments.length
            });
            return updatedContent;
          });
        } else {
          // First request - replace data
          console.log('Replacing content with new data');
          setContent(newItems);
          console.log('New content lengths:', {
            all: newItems.all.length,
            alerts: newItems.alerts.length,
            circulars: newItems.circulars.length,
            homework: newItems.homework.length,
            moments: newItems.moments.length
          });
        }

        // Update data availability based on returned items count
        // If returned items < limit, it means we've reached the end
        const hasMoreData = response.data.LIST.length >= parseInt(LIMIT);
        isDataAvl.current = hasMoreData;
        console.log('Returned items:', response.data.LIST.length, 'Limit:', LIMIT);
        console.log('Has more data available:', hasMoreData);

        return {
          success: true,
          payload: response.data.LIST,
          hasMore: hasMoreData
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch content'
        };
      }
    } catch (error) {
      console.error('Error fetching content for user:', error);
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.'
      };
    }
  }, []);

  // Main fetch function
  const fetchContent = useCallback(async () => {
    // Check if more data is available
    if (!isDataAvl.current) {
      console.log('No more data available, skipping fetch');
      return;
    }

    console.log('=== FETCH CONTENT DEBUG ===');
    console.log('Fetching with offset:', offset.current);
    console.log('Fetching with filter:', filter.current);

    setLoading(true);
    setError(null);

    try {
      const result = await fetchContentForUser(userData);

      if (result && result.success) {
        // Data has been updated in fetchContentForUser
        console.log('Content fetched successfully');
        console.log('Has more data:', result.hasMore);
      } else {
        setError(result?.message || 'Failed to load content');
        Alert.alert('Error', result?.message || 'Failed to load content');
      }
    } catch (error) {
      console.error('Error in fetchContent:', error);
      const errorMessage = 'Failed to load content. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userData, fetchContentForUser]);

  // Handle refresh
  const handleRefresh = async () => {
    // Don't allow refresh if already refreshing
    if (refreshing) return;

    setRefreshing(true);

    // Reset pagination state
    offset.current = "0";
    filter.current = "All";
    isDataAvl.current = true;

    await fetchContent();
    setRefreshing(false);
  };

  // Handle end reached for pagination with correct offset logic
  const handleLoadMore = () => {
    console.log('=== PAGINATION DEBUG ===');
    console.log('End reached - checking for more data');
    console.log('Current offset (page):', offset.current);
    console.log('Current filter:', filter.current);
    console.log('Data available:', isDataAvl.current);

    // Check if more data is available
    if (!isDataAvl.current) {
      console.log('No more data available, skipping fetch');
      return;
    }

    // Increment offset by 1 (next page) and fetch more data
    const newOffset = (parseInt(offset.current, 10) + 1).toString();
    console.log('Fetching more data with new offset (page):', newOffset);
    offset.current = newOffset;
    fetchContent();
  };

  // Handle filter change
  const handleFilterChange = useCallback((newFilter) => {
    offset.current = "0";
    filter.current = newFilter;
    isDataAvl.current = true;
    fetchContent();
  }, [fetchContent]);

  // Handle user change - reset content and fetch new data
  const handleUserChange = useCallback(async (newUserData) => {
    console.log('=== USER CHANGE DEBUG ===');
    console.log('Switching content to new user:', newUserData.studentName);

    // Reset all state
    setContent({
      all: [],
      alerts: [],
      circulars: [],
      homework: [],
      moments: []
    });
    setError(null);
    setLoading(true);

    // Reset pagination state
    offset.current = "0";
    filter.current = "All";
    isDataAvl.current = true;

    // Check for cached data first
    const username = newUserData.username || newUserData.originalUserName;
    if (username) {
      try {
        const cachedResult = await StorageHelper.getUserCachedData(username, 'contentData');
        if (cachedResult.success && cachedResult.data) {
          console.log('User change: Found cached data, using it');
          setContent(cachedResult.data);
          setLoading(false);
          console.log('User change: Cached data loaded successfully');
          return;
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    }

    // Process initial data if available
    if (newUserData && newUserData.LIST && Array.isArray(newUserData.LIST)) {
      try {
        const processedContent = ContentService.processContentItems(newUserData.LIST);
        setContent(processedContent);
        setLoading(false);

        // Cache the processed content for future switches
        if (username) {
          await StorageHelper.storeUserCachedData(username, 'contentData', processedContent);
        }

        console.log('User change: Initial data processed and cached successfully');
      } catch (error) {
        console.error('Error processing initial content for new user:', error);
        setError('Failed to process initial content');
        setLoading(false);
      }
    } else {
      // No initial data, fetch from API
      console.log('User change: No initial data, fetching from API');
      // fetchContent will be called with the new userData through useEffect
    }

    console.log('=== END USER CHANGE DEBUG ===');
  }, []);

  // Expose handleUserChange to parent component
  useEffect(() => {
    if (onUserChanged) {
      onUserChanged(handleUserChange);
    }
  }, [handleUserChange, onUserChanged]);

  // Initial load - check if we have stored data first
  useEffect(() => {
    if (userData && userData.LIST && Array.isArray(userData.LIST)) {
      // Process initial data from login response
      try {
        setLoading(true);
        const processedContent = ContentService.processContentItems(userData.LIST);
        setContent(processedContent);
        setLoading(false);

        // Reset pagination state for fresh start
        offset.current = "0";
        filter.current = "All";
        isDataAvl.current = true;
      } catch (error) {
        console.error('Error processing initial content:', error);
        setError('Failed to process initial content');
        setLoading(false);

        // If initial processing fails, try fetching fresh data
        fetchContent();
      }
    } else {
      // No initial data, fetch from API
      fetchContent();
    }
  }, [userData]);

  // Handle active filter changes
  useEffect(() => {
    // Map activeFilter to API filter format
    const filterMap = {
      'all': 'All',
      'alerts': 'alert',
      'circulars': 'circular',
      'homework': 'classwork',
      'moments': 'photos'
    };

    const newFilter = filterMap[activeFilter] || 'All';
    if (filter.current !== newFilter) {
      handleFilterChange(newFilter);
    }
  }, [activeFilter, handleFilterChange]);

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
        onEndReachedThreshold={0.1}
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
