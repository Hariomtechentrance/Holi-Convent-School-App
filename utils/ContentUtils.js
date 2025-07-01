// Content Utilities for Holy Cross Convent School App
// Helper functions for content processing and display

export const ContentUtils = {
  // Get file type icon based on file extension
  getFileTypeIcon: (fileName, fileType) => {
    if (!fileName && !fileType) return 'file-document-outline';

    const extension = fileType || fileName.split('.').pop().toLowerCase();

    const iconMap = {
      'pdf': 'file-pdf-box',
      'doc': 'file-word-box',
      'docx': 'file-word-box',
      'xls': 'file-excel-box',
      'xlsx': 'file-excel-box',
      'ppt': 'file-powerpoint-box',
      'pptx': 'file-powerpoint-box',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'gif': 'file-image',
      'mp4': 'file-video',
      'avi': 'file-video',
      'mov': 'file-video',
      'mp3': 'file-music',
      'wav': 'file-music',
      'zip': 'zip-box',
      'rar': 'zip-box',
      'txt': 'file-document-outline'
    };

    return iconMap[extension] || 'file-document-outline';
  },

  // Get file type color
  getFileTypeColor: (fileName, fileType) => {
    if (!fileName && !fileType) return '#757575';

    const extension = fileType || fileName.split('.').pop().toLowerCase();

    const colorMap = {
      'pdf': '#F44336',
      'doc': '#2196F3',
      'docx': '#2196F3',
      'xls': '#4CAF50',
      'xlsx': '#4CAF50',
      'ppt': '#FF9800',
      'pptx': '#FF9800',
      'jpg': '#9C27B0',
      'jpeg': '#9C27B0',
      'png': '#9C27B0',
      'gif': '#9C27B0',
      'mp4': '#E91E63',
      'avi': '#E91E63',
      'mov': '#E91E63',
      'mp3': '#FF5722',
      'wav': '#FF5722',
      'zip': '#795548',
      'rar': '#795548',
      'txt': '#607D8B'
    };

    return colorMap[extension] || '#757575';
  },

  // Format file size
  formatFileSize: (sizeString) => {
    if (!sizeString) return '';

    // Handle formats like "3.68 MB", "0.17 MB", etc.
    const cleanSize = sizeString.replace(/[^\d.]/g, '');
    const size = parseFloat(cleanSize);

    if (isNaN(size)) return sizeString;

    if (sizeString.includes('GB')) {
      return `${size} GB`;
    } else if (sizeString.includes('MB')) {
      return `${size} MB`;
    } else if (sizeString.includes('KB')) {
      return `${size} KB`;
    } else {
      return `${size} B`;
    }
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Get content item title
  getContentTitle: (item) => {
    switch (item.type) {
      case 'alert':
        return item.alertMessage || 'Alert';
      case 'circular':
        return item.subject || 'Circular';
      case 'classwork':
        return item.subject || item.description || 'Homework';
      case 'photos':
        return item.albumTitle || item.albumDesc || 'Moments';
      default:
        return 'Content';
    }
  },

  // Get content item description
  getContentDescription: (item) => {
    switch (item.type) {
      case 'alert':
        return item.alertMessage || '';
      case 'circular':
        return item.description || '';
      case 'classwork':
        return item.description || '';
      case 'photos':
        return item.albumDesc || '';
      default:
        return '';
    }
  },

  // Get content item sender
  getContentSender: (item) => {
    return item.senderName || item.sentBy || 'School';
  },

  // Get attachments for content item
  getContentAttachments: (item) => {
    let attachments = [];

    if (item.attachments && Array.isArray(item.attachments)) {
      attachments = [...attachments, ...item.attachments];
    }

    if (item.submitedFile && Array.isArray(item.submitedFile)) {
      attachments = [...attachments, ...item.submitedFile];
    }

    if (item.photos && Array.isArray(item.photos)) {
      attachments = [...attachments, ...item.photos.map(photo => ({
        fileName: photo.imageName,
        filePath: photo.imageLoc,
        fileType: photo.fileType,
        fileSize: photo.fileSize
      }))];
    }

    // Filter out empty attachments
    return attachments.filter(att => att.fileName || att.filePath);
  },

  // Check if content item has attachments
  hasAttachments: (item) => {
    const attachments = ContentUtils.getContentAttachments(item);
    return attachments.length > 0;
  },

  // Get content type badge text
  getContentTypeBadge: (item) => {
    switch (item.type) {
      case 'alert':
        return 'ALERT';
      case 'circular':
        return 'CIRCULAR';
      case 'classwork':
        return item.classWorkType || 'HOMEWORK';
      case 'photos':
        return 'MOMENTS';
      default:
        return 'CONTENT';
    }
  },

  // Check if content is new (within last 24 hours)
  isNewContent: (item) => {
    if (!item.processedDate) return false;

    const now = new Date();
    const contentDate = new Date(item.processedDate);
    const diffHours = (now - contentDate) / (1000 * 60 * 60);

    return diffHours <= 24;
  },

  // Get content priority (for sorting within same date)
  getContentPriority: (item) => {
    const priorityMap = {
      'alert': 1,
      'circular': 2,
      'classwork': 3,
      'photos': 4
    };

    return priorityMap[item.type] || 5;
  },

  // Validate URL
  isValidUrl: (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Get full attachment URL
  getFullAttachmentUrl: (attachment) => {
    if (!attachment) return '';

    const url = attachment.filePath || attachment.imageLoc || '';

    // If URL is already complete, return as is
    if (ContentUtils.isValidUrl(url)) {
      return url;
    }

    // If URL is relative, prepend base URL
    if (url.startsWith('attachment/')) {
      return `http://pinnacleattachments.in/${url}`;
    }

    return url;
  },

  // Format date and time for copy functionality (format: 25 Mar 10:49 pm)
  formatDateTimeForCopy: (dateString) => {
    if (!dateString) return '';

    try {
      // Parse the date string (handle formats like "22-03-2025 18:50:10")
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];

        // Parse date part (DD-MM-YYYY)
        const [day, month, year] = datePart.split('-');
        const date = new Date(`${year}-${month}-${day} ${timePart}`);

        // Format date
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dayNum = parseInt(day, 10);
        const monthName = months[parseInt(month, 10) - 1];

        // Format time to 12-hour format
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12

        const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        return `${dayNum} ${monthName} ${formattedTime}`;
      }

      return dateString;
    } catch (error) {
      console.warn('Error formatting date for copy:', dateString, error);
      return dateString;
    }
  }
};

export default ContentUtils;
