/**
 * Map 状态管理 Hook (Zustand)
 */

'use client';

import { create } from 'zustand';
import { MapType, ViewMode } from '@/clientservershare/types/map.types';
import { DEFAULT_MAP_CONFIG } from '@/clientservershare/constants/map.constants';

interface MapState {
  // 地图状态
  center: { lat: number; lng: number };
  zoom: number;
  mapType: MapType;
  viewMode: ViewMode;
  
  // 地图实例
  map2D: google.maps.Map | null;
  map3D: google.maps.Map | null;
  
  // Actions
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setMapType: (mapType: MapType) => void;
  setViewMode: (mode: ViewMode) => void;
  setMap2D: (map: google.maps.Map | null) => void;
  setMap3D: (map: google.maps.Map | null) => void;
  
  // 复合 Actions
  updateMapView: (center: { lat: number; lng: number }, zoom: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  // 初始状态
  center: DEFAULT_MAP_CONFIG.center,
  zoom: DEFAULT_MAP_CONFIG.zoom,
  mapType: DEFAULT_MAP_CONFIG.mapType,
  viewMode: '2d',
  
  map2D: null,
  map3D: null,
  
  // Actions
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setMapType: (mapType) => set({ mapType }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setMap2D: (map) => set({ map2D: map }),
  setMap3D: (map) => set({ map3D: map }),
  
  updateMapView: (center, zoom) => {
    set({ center, zoom });
    
    // 同步更新所有地图实例
    const { map2D, map3D } = get();
    
    if (map2D) {
      map2D.setCenter(center);
      map2D.setZoom(zoom);
    }
    
    if (map3D) {
      map3D.setCenter(center);
      map3D.setZoom(zoom);
    }
  },
}));

