/**
 * Map 类型定义
 */

export type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export type ViewMode = '2d' | '3d' | 'split';

export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  mapType: MapType;
}

export interface Map3DConfig extends MapConfig {
  tilt?: number;
  heading?: number;
  mapId: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapControls {
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  scaleControl?: boolean;
  streetViewControl?: boolean;
  rotateControl?: boolean;
  fullscreenControl?: boolean;
}

