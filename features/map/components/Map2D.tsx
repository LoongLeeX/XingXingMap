/**
 * 2D 地图组件
 */

'use client';

import React, { useEffect } from 'react';
import { useMapInstance } from '../hooks/useMapInstance';
import { useMapStore } from '../hooks/useMapStore';
import { Loading } from '@/components/ui/Loading';
import { MarkersLayer } from '@/features/markers/components/MarkersLayer';
import { CustomMarker } from '@/features/markers/components/CustomMarker';
import { Marker } from '@/clientservershare/types/marker.types';

export interface Map2DProps {
  containerId?: string;
  onMapClick?: (lat: number, lng: number) => void;
  markers?: Marker[];
  searchMarkerPosition?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: Marker) => void;
}

export function Map2D({ 
  containerId = 'map-2d', 
  onMapClick,
  markers = [],
  searchMarkerPosition,
  onMarkerClick
}: Map2DProps) {
  console.log('🎨 [Map2D] 组件渲染 - containerId:', containerId);
  
  const { center, zoom, mapType, setMap2D } = useMapStore();
  console.log('📍 [Map2D] Store 状态 - center:', center, 'zoom:', zoom, 'mapType:', mapType);
  
  const { map, isReady } = useMapInstance(containerId, { center, zoom, mapType });
  
  useEffect(() => {
    console.log('🔄 [Map2D] useMapInstance 状态变化 - map:', !!map, 'isReady:', isReady);
  }, [map, isReady]);
  
  // 保存地图实例到 store（只在地图创建时执行一次）
  useEffect(() => {
    if (map) {
      console.log('💾 [Map2D] 保存地图实例到 store');
      setMap2D(map);
    }
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
  
  // 监听 mapType 变化，并确保保持 2D 模式
  useEffect(() => {
    if (map && isReady) {
      map.setMapTypeId(mapType);
      
      // 强制保持 2D 俯视视角
      map.setTilt(0);  // 禁用倾斜
      map.setHeading(0); // 禁用旋转
      
      console.log('🗺️ [Map2D] 地图类型已切换:', mapType, '- 保持 2D 模式');
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
      
      {/* 渲染保存的标记 */}
      {map && markers.length > 0 && (
        <MarkersLayer 
          map={map} 
          markers={markers} 
          onMarkerClick={onMarkerClick}
        />
      )}
      
      {/* 渲染搜索标记 */}
      {map && searchMarkerPosition && (
        <CustomMarker
          map={map}
          position={searchMarkerPosition}
          title="搜索位置"
          icon="📌"
        />
      )}
    </div>
  );
}

