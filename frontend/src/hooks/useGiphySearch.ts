import { useState, useCallback } from 'react';
import axios from 'axios';

// Giphy API key
const GIPHY_API_KEY = '6xclx0tTeFps1xMLhOmw0Jzpvos1ixnM'; // Replace with your Giphy API key

export const useGiphySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce time (in milliseconds)
  const debounceTimeout = 500;

  const searchGifs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGifResults([]); // Clear previous results if query is empty
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/search`,
        {
          params: {
            api_key: GIPHY_API_KEY,
            q: query,
            limit: 12,  // Limit results
          },
        }
      );
      console.log("Giphy search response:", response.data);
      setGifResults(response.data.data); // Save the GIF results
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a debounced version of searchGifs to limit the API calls
  const debouncedSearch = useCallback(
    debounce((query: any) => searchGifs(query), debounceTimeout),
    []
  );

  // Trigger the debounced search when the searchQuery changes
  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query); // Trigger debounced search
  };

  return {
    searchQuery,
    setSearchQuery: onSearchChange,
    gifResults,
    isLoading,
    searchGifs,
  };
};

// Utility function for debouncing
function debounce(func: Function, delay: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}