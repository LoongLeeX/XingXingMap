/**
 * Map 实例管理 Hook
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { MapConfig } from '@/clientservershare/types/map.types';
import { DEFAULT_MAP_CONFIG, DEFAULT_MAP_CONTROLS } from '@/clientservershare/constants/map.constants';

export function useMapInstance(containerId: string, config: Partial<MapConfig> = {}) {
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
    
    // 合并配置
    const finalConfig = {
      ...DEFAULT_MAP_CONFIG,
      ...config,
    };
    
    // 创建地图实例
    const mapInstance = new google.maps.Map(container, {
      center: finalConfig.center,
      zoom: finalConfig.zoom,
      mapTypeId: finalConfig.mapType,
      ...DEFAULT_MAP_CONTROLS,
    });
    
    mapRef.current = mapInstance;
    setMap(mapInstance);
    
    // 等待地图完全加载
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

