/**
 * Markers Hook
 */

'use client';

import { useState, useEffect } from 'react';
import { Marker } from '@/clientservershare/types/marker.types';
import { getMarkersAction } from '@/server/src/features/markers/actions/marker-actions';

export function useMarkers() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMarkers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getMarkersAction();
      
      if (result.success && result.data) {
        // 转换图片字段
        const markersWithImages = result.data.map(marker => ({
          ...marker,
          images: marker.images ? JSON.parse(marker.images as any) : [],
        }));
        setMarkers(markersWithImages as any);
      } else {
        setError(result.error || 'Failed to load markers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMarkers();
  }, []);
  
  return {
    markers,
    isLoading,
    error,
    refetch: fetchMarkers,
  };
}

