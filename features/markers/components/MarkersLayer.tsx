/**
 * 标记图层组件
 * 在地图上显示所有保存的标记
 */

'use client';

import React from 'react';
import { Marker } from '@/clientservershare/types/marker.types';
import { CustomMarker } from './CustomMarker';

export interface MarkersLayerProps {
  map: google.maps.Map | null;
  markers: Marker[];
  onMarkerClick?: (marker: Marker) => void;
}

export function MarkersLayer({ map, markers, onMarkerClick }: MarkersLayerProps) {
  console.log('🗺️ [MarkersLayer] 渲染标记图层, 标记数量:', markers.length);
  
  return (
    <>
      {markers.map((marker) => (
        <CustomMarker
          key={marker.id}
          map={map}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          title={marker.title}
          icon="📍" // 保存的标记使用 📍
          onClick={() => onMarkerClick?.(marker)}
        />
      ))}
    </>
  );
}

