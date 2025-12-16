export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';
  
  // If it already has the full URL, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base URL
  return `http://127.0.0.1:8000/${imagePath}`;
};
