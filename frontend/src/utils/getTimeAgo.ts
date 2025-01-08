export const getTimeAgo = (timestamp: string) => {
  const now = new Date() as any;
  const createdAt = new Date(timestamp) as any;
  const diffInSeconds = Math.floor((now - createdAt) / 1000); // Difference in seconds
  const diffInMinutes = Math.floor(diffInSeconds / 60); // Convert to minutes
  const diffInHours = Math.floor(diffInMinutes / 60); // Convert to hours
  const diffInDays = Math.floor(diffInHours / 24); // Convert to days

  if (diffInDays >= 1) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`; // Show days ago
  } else if (diffInHours >= 1) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`; // Show hours ago
  } else if (diffInMinutes >= 1) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`; // Show minutes ago
  } else {
    return `${diffInSeconds} second${diffInSeconds > 1 ? "s" : ""} ago`; // Show seconds ago
  }
};