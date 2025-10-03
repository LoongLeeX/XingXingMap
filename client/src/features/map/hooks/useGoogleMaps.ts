/**
 * Google Maps 加载 Hook
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_LIBRARIES } from '@/clientservershare/constants/map.constants';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setLoadError(new Error('Google Maps API Key is not configured'));
      return;
    }
    
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES as any,
    });
    
    loader
      .load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        setLoadError(error);
      });
  }, []);
  
  return { isLoaded, loadError };
}

