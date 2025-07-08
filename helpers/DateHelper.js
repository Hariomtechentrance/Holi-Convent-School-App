// Date Helper for Holy Cross Convent School App
// Provides date formatting functions for chat and other features

export const dateFormatChat = (date) => {
  const d = new Date(date);
  const options = {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const formattedDate = d.toLocaleString('en-GB', options)
    .replace(/,/, '') // Remove comma after year
    .replace(/(\d{2}) (\d{2}) (\w{3}) (\d{2}), (\d{2}:\d{2}) (\w{2})/, '$1 $3 $2, $4 $5');

  return formattedDate;
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default {
  dateFormatChat,
  formatDate,
  formatTime
};
