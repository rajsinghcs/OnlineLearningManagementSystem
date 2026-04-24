export const formatPrice = (price) =>
  price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const getLevelColor = (level) =>
  ({
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
  }[level] || 'bg-gray-100 text-gray-800');

export const getStatusColor = (status) =>
  ({
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUCCESS: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
  }[status] || 'bg-gray-100 text-gray-800');

export const truncate = (str, n) =>
  str?.length > n ? str.substring(0, n) + '...' : str;
