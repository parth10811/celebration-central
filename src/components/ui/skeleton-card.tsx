import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  imageHeight?: string;
  className?: string;
}

export function SkeletonCard({ imageHeight = 'h-48', className }: SkeletonCardProps) {
  return (
    <Card className={className}>
      <Skeleton className={`w-full ${imageHeight}`} />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center mt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24 ml-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
} 