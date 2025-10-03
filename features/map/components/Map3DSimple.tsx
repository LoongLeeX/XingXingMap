/**
 * 3D 地图组件（简化版）- 使用官方 Web Component
 * 参考：https://developers.google.com/maps/documentation/javascript/3d-maps/get-started
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useMapStore } from '../hooks/useMapStore';
import { Loading } from '@/components/ui/Loading';

// 声明 gmp-map-3d Web Component 类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map-3d': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        mode?: string;
        center?: string;
        range?: string;
        tilt?: string;
        heading?: string;
      }, HTMLElement>;
    }
  }
}

export interface Map3DSimpleProps {
  containerId?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export function Map3DSimple({ containerId = 'map-3d-simple', onMapClick }: Map3DSimpleProps) {
  console.log('🎨 [Map3DSimple] 组件渲染');
  
  const { center, setMap3D } = useMapStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const mapElementRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // 等待 Web Component 注册
    const checkElement = () => {
      const element = document.getElementById(containerId);
      if (element) {
        console.log('✅ [Map3DSimple] gmp-map-3d 元素已找到');
        mapElementRef.current = element;
        setIsLoading(false);
        
        // 存储到 store（虽然不是标准的 Map 实例）
        setMap3D(element as any);
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  }, [containerId, setMap3D]);
  
  return (
    <div className="relative w-full h-full">
      {/* 使用官方 Web Component - 直接在 HTML 中定义 */}
      <gmp-map-3d 
        id={containerId}
        style={{ width: '100%', height: '100%', display: 'block' }}
        mode="hybrid"
        center={`${center.lat}, ${center.lng}`}
        range="2000"
        tilt="67.5"
        heading="0"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <Loading text="加载 3D 地图中..." />
          <p className="mt-4 text-xs text-gray-600 max-w-sm text-center">
            💡 使用官方 Web Component (gmp-map-3d)
          </p>
        </div>
      )}
      
      {!isLoading && (
        <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded shadow-md text-xs">
          <p className="text-green-600 font-semibold">✅ 3D 地图已加载</p>
          <p className="text-gray-500 text-[10px] mt-1">官方 Web Component</p>
        </div>
      )}
    </div>
  );
}

