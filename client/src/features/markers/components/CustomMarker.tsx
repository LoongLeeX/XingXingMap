/**
 * 自定义标记组件
 * 在地图上显示标记
 */

'use client';

import { useEffect, useRef } from 'react';

export interface CustomMarkerProps {
  map: google.maps.Map | null;
  position: { lat: number; lng: number };
  title?: string;
  icon?: string; // emoji 或 URL
  onClick?: () => void;
  draggable?: boolean;
}

export function CustomMarker({
  map,
  position,
  title = '',
  icon = '📌',
  onClick,
  draggable = false,
}: CustomMarkerProps) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  useEffect(() => {
    if (!map) return;
    
    console.log('📍 [CustomMarker] 创建标记:', position, title);
    
    // 创建自定义标记图标（使用 emoji）
    const markerIcon = {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <text x="20" y="30" font-size="30" text-anchor="middle">${icon}</text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 40),
    };
    
    // 创建标记
    const marker = new google.maps.Marker({
      position,
      map,
      title,
      icon: markerIcon,
      draggable,
      animation: google.maps.Animation.DROP,
    });
    
    markerRef.current = marker;
    
    // 添加点击事件
    if (onClick) {
      const listener = marker.addListener('click', onClick);
      return () => {
        google.maps.event.removeListener(listener);
        marker.setMap(null);
      };
    }
    
    // 清理函数
    return () => {
      console.log('🧹 [CustomMarker] 移除标记');
      marker.setMap(null);
    };
  }, [map, position.lat, position.lng, title, icon, onClick, draggable]);
  
  return null; // 这个组件不渲染 React 元素
}

