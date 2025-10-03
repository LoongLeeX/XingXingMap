/**
 * 2D 地图组件
 */

'use client';

import React, { useEffect } from 'react';
import { useMapInstance } from '../hooks/useMapInstance';
import { useMapStore } from '../hooks/useMapStore';
import { Loading } from '@/components/ui/Loading';

export interface Map2DProps {
  containerId?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export function Map2D({ containerId = 'map-2d', onMapClick }: Map2DProps) {
  const { center, zoom, mapType, setMap2D } = useMapStore();
  const { map, isReady } = useMapInstance(containerId, { center, zoom, mapType });
  
  // 保存地图实例到 store
  useEffect(() => {
    if (map) {
      setMap2D(map);
    }
    
    return () => {
      setMap2D(null);
    };
  }, [map, setMap2D]);
  
  // 监听地图点击事件
  useEffect(() => {
    if (!map || !onMapClick) return;
    
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    });
    
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onMapClick]);
  
  // 监听 mapType 变化
  useEffect(() => {
    if (map && isReady) {
      map.setMapTypeId(mapType);
    }
  }, [map, isReady, mapType]);
  
  return (
    <div className="relative w-full h-full">
      <div id={containerId} className="w-full h-full" />
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loading text="加载地图中..." />
        </div>
      )}
    </div>
  );
}

