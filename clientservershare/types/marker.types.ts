/**
 * Marker 类型定义
 * 前后端共享的类型定义
 */

export interface MarkerPosition {
  lat: number;
  lng: number;
}

export interface Marker {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMarkerDTO {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  images?: string[];
}

export interface UpdateMarkerDTO {
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface MarkerWithPosition extends Omit<Marker, 'latitude' | 'longitude'> {
  position: MarkerPosition;
}

