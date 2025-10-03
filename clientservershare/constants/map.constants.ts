/**
 * Map 相关常量
 */

import { MapConfig } from '../types/map.types';

// 默认地图配置
export const DEFAULT_MAP_CONFIG: MapConfig = {
  center: {
    lat: 39.9042, // 北京天安门
    lng: 116.4074,
  },
  zoom: 12,
  mapType: 'roadmap',
};

// 默认 3D 地图配置
export const DEFAULT_3D_CONFIG = {
  tilt: 47.5,
  heading: 0,
  zoom: 18,
};

// 地图类型选项
export const MAP_TYPES = [
  { value: 'roadmap', label: '地图' },
  { value: 'satellite', label: '卫星' },
  { value: 'hybrid', label: '混合' },
  { value: 'terrain', label: '地形' },
] as const;

// 视图模式选项
export const VIEW_MODES = [
  { value: '2d', label: '2D 视图' },
  { value: '3d', label: '3D 视图' },
  { value: 'split', label: '分屏对比' },
] as const;

// 地图控件默认配置
export const DEFAULT_MAP_CONTROLS = {
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  // 禁用旋转控件 - 保持 2D 俯视模式
  rotateControl: false,
  fullscreenControl: true,
};

// Google Maps 加载配置
export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry', 'drawing'] as const;

