/**
 * 地图容器组件 - 根据视图模式渲染不同的地图
 */

'use client';

import React from 'react';
import { useMapStore } from '../hooks/useMapStore';
import { Map2D } from './Map2D';
import { Map3D } from './Map3D';
import { Map3DWebComponent } from './Map3DWebComponent';
import { Map3DWithMarkers } from './Map3DWithMarkers';
import { SplitView } from './SplitView';
import { MapControls } from './MapControls';
import { Marker } from '@/clientservershare/types/marker.types';

export interface MapContainerProps {
  onMapClick?: (lat: number, lng: number) => void;
  markers?: Marker[];
  searchMarkerPosition?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: Marker) => void;
}

export function MapContainer({ 
  onMapClick, 
  markers = [], 
  searchMarkerPosition,
  onMarkerClick 
}: MapContainerProps) {
  const { viewMode } = useMapStore();
  
  console.log('🗺️ [MapContainer] 组件渲染', { 
    viewMode, 
    markersCount: markers.length 
  });
  
  return (
    <div className="relative w-full h-full">
      <MapControls />
      
      {viewMode === '2d' && (
        <Map2D 
          onMapClick={onMapClick}
          markers={markers}
          searchMarkerPosition={searchMarkerPosition}
          onMarkerClick={onMarkerClick}
        />
      )}
      {viewMode === '3d' && (
        <Map3DWithMarkers 
          onMapClick={onMapClick}
          markers={markers}
          searchMarkerPosition={searchMarkerPosition}
          onMarkerClick={onMarkerClick}
        />
      )}
      {viewMode === 'split' && (
        <SplitView 
          onMapClick={onMapClick}
          markers={markers}
          searchMarkerPosition={searchMarkerPosition}
          onMarkerClick={onMarkerClick}
        />
      )}
    </div>
  );
}

