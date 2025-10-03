/**
 * 3D Map Hook
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Map3DConfig } from '@/clientservershare/types/map.types';
import { DEFAULT_MAP_CONFIG, DEFAULT_3D_CONFIG } from '@/clientservershare/constants/map.constants';

export function use3DMap(containerId: string, config: Partial<Map3DConfig> = {}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  useEffect(() => {
    if (!window.google) {
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    
    const mapId = config.mapId || process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
    
    if (!mapId) {
      console.warn('3D Map ID is not configured. 3D features may not work.');
    }
    
    // 创建 3D 地图实例
    const mapInstance = new google.maps.Map(container, {
      center: config.center || DEFAULT_MAP_CONFIG.center,
      zoom: config.zoom || DEFAULT_3D_CONFIG.zoom,
      mapId: mapId,
      tilt: config.tilt || DEFAULT_3D_CONFIG.tilt,
      heading: config.heading || DEFAULT_3D_CONFIG.heading,
      disableDefaultUI: false,
      mapTypeId: 'satellite',
    });
    
    mapRef.current = mapInstance;
    setMap(mapInstance);
    
    google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
      setIsReady(true);
    });
    
    return () => {
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
    };
  }, [containerId, config]);
  
  return { map, isReady };
}

