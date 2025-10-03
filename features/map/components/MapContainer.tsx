/**
 * 地图容器组件 - 根据视图模式渲染不同的地图
 */

'use client';

import React from 'react';
import { useMapStore } from '../hooks/useMapStore';
import { Map2D } from './Map2D';
import { Map3D } from './Map3D';
import { Map3DWebComponent } from './Map3DWebComponent';
import { SplitView } from './SplitView';
import { MapControls } from './MapControls';

export interface MapContainerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapContainer({ onMapClick }: MapContainerProps) {
  const { viewMode } = useMapStore();
  
  return (
    <div className="relative w-full h-full">
      <MapControls />
      
      {viewMode === '2d' && <Map2D onMapClick={onMapClick} />}
      {viewMode === '3d' && <Map3DWebComponent onMapClick={onMapClick} />}
      {viewMode === 'split' && <SplitView onMapClick={onMapClick} />}
    </div>
  );
}

