import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const defaultFallbackImage = 'https://placehold.co/600x400?text=Image+Not+Found';

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = defaultFallbackImage,
  className,
  sizes = '100vw',
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(!priority);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
      />
    </div>
  );
} 