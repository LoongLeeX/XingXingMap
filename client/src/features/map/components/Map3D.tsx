/**
 * 3D 地图组件
 */

'use client';

import React, { useEffect } from 'react';
import { use3DMap } from '../hooks/use3DMap';
import { useMapStore } from '../hooks/useMapStore';
import { Loading } from '@/components/ui/Loading';

export interface Map3DProps {
  containerId?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export function Map3D({ containerId = 'map-3d', onMapClick }: Map3DProps) {
  console.log('🎨 [Map3D] 组件渲染 - containerId:', containerId);
  
  const { center, zoom, setMap3D } = useMapStore();
  const { map, isReady } = use3DMap(containerId, { center, zoom });
  
  useEffect(() => {
    console.log('🔄 [Map3D] use3DMap 状态变化 - map:', !!map, 'isReady:', isReady);
  }, [map, isReady]);
  
  // 保存地图实例到 store（只在地图创建时执行一次）
  useEffect(() => {
    if (map) {
      console.log('💾 [Map3D] 保存 3D 地图实例到 store');
      setMap3D(map);
    }
  }, [map, setMap3D]);
  
  // Map3DElement 的点击事件处理方式不同
  useEffect(() => {
    if (!map || !onMapClick) return;
    
    console.log('🖱️ [Map3D] 设置点击事件监听器');
    
    // Map3DElement 可能需要不同的事件监听方式
    const handleClick = (event: any) => {
      console.log('📍 [Map3D] 3D 地图被点击:', event);
      
      // 3D 地图的事件结构可能不同
      if (event.position) {
        onMapClick(event.position.lat, event.position.lng);
      }
    };
    
    // 尝试添加事件监听器
    try {
      if (map.addEventListener) {
        map.addEventListener('click', handleClick);
        return () => {
          map.removeEventListener('click', handleClick);
        };
      }
    } catch (error) {
      console.warn('⚠️ [Map3D] 无法添加点击事件监听器:', error);
    }
  }, [map, onMapClick]);
  
  return (
    <div className="relative w-full h-full bg-gray-200">
      <div 
        id={containerId} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <Loading text="加载 3D 地图中..." />
          <p className="mt-4 text-sm text-gray-600">
            💡 3D 地图需要 Map Tiles API
          </p>
          <p className="text-xs text-gray-500 mt-2">
            打开开发者工具查看详细日志
          </p>
        </div>
      )}
      
      {isReady && (
        <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded shadow-md text-xs text-gray-600">
          ✅ 3D 地图已加载
        </div>
      )}
    </div>
  );
}

