import { Image, type ImageProps } from 'expo-image';
import type React from 'react';

/**
 * Optimized Image component using Expo Image
 * Features:
 * - Automatic caching
 * - Better performance than React Native Image
 * - Smooth transitions
 * - Memory efficient
 */
export const OptimizedImage: React.FC<ImageProps> = (props) => {
  return (
    <Image
      {...props}
      // Enable caching for better performance
      cachePolicy="memory-disk"
      // Smooth transition when image loads
      transition={200}
      // Placeholder while loading
      placeholder={props.placeholder}
      // Content fit
      contentFit={props.contentFit || 'cover'}
    />
  );
};
