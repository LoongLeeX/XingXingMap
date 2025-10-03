/**
 * 3D 地图组件
 */

'use client';

import React, { useEffect } from 'react';
import { use3DMap } from '../hooks/use3DMap';
import { useMapStore } from '../hooks/useMapStore';
import { Loading } from '@/components/ui/Loading';

export interface Map3DProps {
  containerId?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export function Map3D({ containerId = 'map-3d', onMapClick }: Map3DProps) {
  const { center, zoom, setMap3D } = useMapStore();
  const { map, isReady } = use3DMap(containerId, { center, zoom });
  
  // 保存地图实例到 store
  useEffect(() => {
    if (map) {
      setMap3D(map);
    }
    
    return () => {
      setMap3D(null);
    };
  }, [map, setMap3D]);
  
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
  
  return (
    <div className="relative w-full h-full">
      <div id={containerId} className="w-full h-full" />
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loading text="加载 3D 地图中..." />
        </div>
      )}
    </div>
  );
}

