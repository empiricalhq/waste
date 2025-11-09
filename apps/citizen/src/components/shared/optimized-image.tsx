import type React from 'react';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { useConnectionType } from '@/lib/hooks/use-connection-type';

interface OptimizedImageProps extends ExpoImageProps {
  priority?: 'high' | 'normal' | 'low';
  maxSizeOnCellular?: 'thumbnail' | 'medium' | 'full';
}

/**
 * OptimizedImage component that adapts image quality based on connection type
 * - On WiFi: Loads full quality images
 * - On Cellular: Requests smaller images to save data
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  priority = 'normal',
  maxSizeOnCellular = 'medium',
  ...props
}) => {
  const { isWifi } = useConnectionType();

  const getOptimizedSource = () => {
    // If source is not a URI, return as-is
    if (typeof source !== 'object' || !('uri' in source) || !source.uri) {
      return source;
    }

    const uri = source.uri;

    // On WiFi, use full quality
    if (isWifi || maxSizeOnCellular === 'full') {
      return source;
    }

    // On cellular, request smaller images
    // This assumes the API supports size parameters
    // Adjust the parameter format based on your API
    const sizeParam = maxSizeOnCellular === 'thumbnail' ? 'w=200' : 'w=500';
    
    // Check if URI already has query parameters
    const separator = uri.includes('?') ? '&' : '?';
    
    return {
      ...source,
      uri: `${uri}${separator}${sizeParam}`,
    };
  };

  return (
    <ExpoImage
      {...props}
      source={getOptimizedSource()}
      cachePolicy="memory-disk"
      priority={priority === 'high' ? 'high' : 'normal'}
    />
  );
};
