/**
 * 3D 标记图层组件
 * 在 3D 地图上显示所有标记
 * 参考 test-3d.html 的实现方式
 */

'use client';

import React from 'react';
import { Marker } from '@/clientservershare/types/marker.types';
import { Marker3D } from './Marker3D';

export interface Markers3DLayerProps {
  map3d: any; // Map3DElement 实例
  markers: Marker[];
  onMarkerClick?: (marker: Marker) => void;
}

export function Markers3DLayer({ map3d, markers, onMarkerClick }: Markers3DLayerProps) {
  console.log('🗺️ [Markers3DLayer] 渲染 3D 标记图层');
  console.log('📊 [Markers3DLayer] 标记数量:', markers.length);
  console.log('📊 [Markers3DLayer] map3d 可用:', !!map3d);
  
  if (!map3d) {
    console.warn('⚠️ [Markers3DLayer] map3d 不可用，跳过标记渲染');
    return null;
  }

  if (markers.length === 0) {
    console.log('ℹ️ [Markers3DLayer] 没有标记需要渲染');
    return null;
  }

  console.log('✅ [Markers3DLayer] 开始渲染标记...');

  return (
    <>
      {markers.map((marker, index) => {
        console.log(`📍 [Markers3DLayer] 渲染标记 ${index + 1}/${markers.length}:`, {
          id: marker.id,
          title: marker.title,
          lat: marker.latitude,
          lng: marker.longitude,
        });

        return (
          <Marker3D
            key={marker.id}
            map3d={map3d}
            position={{
              lat: marker.latitude,
              lng: marker.longitude,
              altitude: 100, // 标记高度 100 米
            }}
            label={marker.title}
            altitudeMode="ABSOLUTE"
            extruded={true}
            onClick={() => {
              console.log('🖱️ [Markers3DLayer] 标记被点击:', marker.title);
              onMarkerClick?.(marker);
            }}
          />
        );
      })}
    </>
  );
}

