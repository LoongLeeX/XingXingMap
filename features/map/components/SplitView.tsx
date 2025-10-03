/**
 * 分屏对比视图组件
 */

'use client';

import React from 'react';
import { Map2D } from './Map2D';
import { Map3DWebComponent } from './Map3DWebComponent';
import { Marker } from '@/clientservershare/types/marker.types';

export interface SplitViewProps {
  onMapClick?: (lat: number, lng: number) => void;
  markers?: Marker[];
  searchMarkerPosition?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: Marker) => void;
}

export function SplitView({ 
  onMapClick, 
  markers = [], 
  searchMarkerPosition,
  onMarkerClick 
}: SplitViewProps) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-1">
      {/* 左侧 2D 地图 */}
      <div className="flex-1 relative">
        <div className="absolute top-2 left-2 z-10 bg-white px-3 py-1 rounded-md shadow-md">
          <span className="text-sm font-medium text-gray-700">2D 卫星视图</span>
        </div>
        <Map2D 
          containerId="split-map-2d" 
          onMapClick={onMapClick}
          markers={markers}
          searchMarkerPosition={searchMarkerPosition}
          onMarkerClick={onMarkerClick}
        />
      </div>
      
      {/* 右侧 3D 地图 */}
      <div className="flex-1 relative">
        <div className="absolute top-2 left-2 z-10 bg-white px-3 py-1 rounded-md shadow-md">
          <span className="text-sm font-medium text-gray-700">3D 真实感视图</span>
        </div>
        <div className="absolute top-12 left-2 z-10 bg-yellow-50 px-2 py-1 rounded text-xs text-yellow-800">
          💡 3D 地图暂不支持标记显示
        </div>
        <Map3DWebComponent onMapClick={onMapClick} />
      </div>
    </div>
  );
}

