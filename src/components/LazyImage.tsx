import React, { useState } from 'react';
import { Image, Skeleton, Box, ImageProps, Text } from '@chakra-ui/react';

interface LazyImageProps extends ImageProps {
  src: string;
  alt: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Box position="relative" width={props.width || props.boxSize || "100%"} height={props.height || props.boxSize || "100%"}>
      {isLoading && (
        <Skeleton
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
        />
      )}
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          opacity={isLoading ? 0 : 1}
          transition="opacity 0.3s"
          {...props}
        />
      ) : (
        <Box
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.100"
          color="gray.400"
          borderRadius="md"
        >
          <Text fontSize="xs" textAlign="center">Offline / Missing</Text>
        </Box>
      )}
    </Box>
  );
};
