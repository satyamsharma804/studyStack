const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  // Prepend API_BASE_URL if imagePath is a relative path (e.g. starts with /uploads/)
  return `${API_BASE_URL}${imagePath}`;
};

export default API_BASE_URL;
