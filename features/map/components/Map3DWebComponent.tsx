/**
 * 3D 地图组件 - 使用官方 Web Component
 * 参考 test-3d.html 的简单实现
 */

'use client';

import React, { useEffect } from 'react';
import { useMapStore } from '../hooks/useMapStore';

// 声明 Web Component 类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map-3d': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          mode?: 'hybrid' | 'unlit';
          center?: string;
          range?: string;
          tilt?: string;
          heading?: string;
        },
        HTMLElement
      >;
    }
  }
}

export interface Map3DWebComponentProps {
  onMapClick?: (lat: number, lng: number) => void;
}

export function Map3DWebComponent({ onMapClick }: Map3DWebComponentProps) {
  const { center } = useMapStore();
  
  useEffect(() => {
    console.log('🎨 [Map3DWebComponent] 组件渲染，使用 Web Component');
  }, []);

  // 格式化中心点为字符串格式：'lat, lng'
  const centerString = `${center.lat}, ${center.lng}`;

  return (
    <div className="relative w-full h-full">
      {/* 直接使用 Web Component，就像 test-3d.html 一样 */}
      <gmp-map-3d
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        mode="hybrid"
        center={centerString}
        range="2000"
        tilt="67.5"
        heading="0"
      />
      
      {/* 提示信息 */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg text-xs z-10">
        <p className="text-green-600 font-semibold">✅ 3D Web Component</p>
        <p className="text-gray-500 text-[10px] mt-1">官方实现</p>
      </div>
      
      {/* 如果需要点击功能的提示 */}
      {onMapClick && (
        <div className="absolute top-16 right-4 bg-blue-50 px-3 py-2 rounded-lg shadow text-xs max-w-xs z-10">
          <p className="text-blue-800">
            💡 Web Component 的点击事件需要特殊处理
          </p>
        </div>
      )}
    </div>
  );
}

