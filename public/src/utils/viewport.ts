import { useState, useEffect } from 'react';

/**
 * Returns the current window width and height
 */
const getWindowDimensions = (): { width: number; height: number } => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
};

/**
 * A hook that returns the current window width and height. And updates it if they change.
 */
export const useWindowDimensions = (): { width: number; height: number } => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    /**
     * Updates the window dimentions when resizing.
     */
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};
