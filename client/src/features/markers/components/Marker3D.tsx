/**
 * 3D 标记组件
 * 使用 Google Maps Marker3DElement API
 * 参考 test-3d.html 的实现方式
 */

'use client';

import { useEffect, useRef } from 'react';

export interface Marker3DProps {
  map3d: any; // Map3DElement 实例
  position: { lat: number; lng: number; altitude?: number };
  label?: string;
  altitudeMode?: 'ABSOLUTE' | 'CLAMP_TO_GROUND' | 'RELATIVE_TO_GROUND';
  extruded?: boolean;
  onClick?: () => void;
}

export function Marker3D({
  map3d,
  position,
  label = '',
  altitudeMode = 'ABSOLUTE',
  extruded = true,
  onClick,
}: Marker3DProps) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    console.log('🔄 [Marker3D] useEffect 触发', {
      hasMap3d: !!map3d,
      map3dType: map3d ? typeof map3d : 'undefined',
      label: label || '(无标签)',
      position: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
    });

    if (!map3d) {
      console.warn('⚠️ [Marker3D] map3d 不可用，跳过标记创建');
      console.log('📊 [Marker3D] map3d 详情:', map3d);
      return;
    }

    if (!window.google?.maps?.importLibrary) {
      console.warn('⚠️ [Marker3D] Google Maps API 不可用');
      return;
    }

    let marker: any = null;
    let mounted = true;

    async function createMarker() {
      try {
        console.log('📍 [Marker3D] 开始创建标记...', { 
          lat: position.lat.toFixed(6), 
          lng: position.lng.toFixed(6), 
          altitude: position.altitude ?? 100, 
          label: label || '(无标签)',
          altitudeMode,
          extruded
        });

        // 导入 maps3d 库（获取 Marker3DElement）
        console.log('📦 [Marker3D] 导入 maps3d 库...');
        const maps3dLib = await window.google.maps.importLibrary("maps3d") as any;
        console.log('✅ [Marker3D] maps3d 库已导入');
        
        if (!mounted) {
          console.log('⚠️ [Marker3D] 组件已卸载，取消创建');
          return;
        }
        
        if (!maps3dLib?.Marker3DElement) {
          console.error('❌ [Marker3D] Marker3DElement 不可用');
          console.log('📋 [Marker3D] maps3dLib 包含:', Object.keys(maps3dLib || {}));
          return;
        }
        
        const { Marker3DElement } = maps3dLib;
        console.log('✅ [Marker3D] Marker3DElement 类已获取');

        // 创建 3D 标记实例 - 使用与 test-3d.html 相同的方式
        console.log('🏗️ [Marker3D] 创建 Marker3DElement 实例...');
        marker = new Marker3DElement({
          position: {
            lat: position.lat,
            lng: position.lng,
            altitude: position.altitude ?? 100, // 默认高度 100 米
          },
          altitudeMode: altitudeMode,  // "ABSOLUTE" 或 "CLAMP_TO_GROUND"
          extruded: extruded,          // 是否显示从地面到标记的拉伸线
          label: label || undefined,   // 标签文本
        });

        console.log('✅ [Marker3D] Marker3DElement 实例创建成功');

        // 添加点击事件
        if (onClick) {
          marker.addEventListener('gmp-click', (e: any) => {
            console.log('🖱️ [Marker3D] 标记被点击:', label);
            onClick();
          });
        }

        if (!mounted) {
          console.log('⚠️ [Marker3D] 组件已卸载，不添加到地图');
          return;
        }

        // 将标记添加到 3D 地图（使用 append 方法，与 test-3d.html 一致）
        try {
          console.log('➕ [Marker3D] 将标记添加到地图...', { 
            map3dType: typeof map3d,
            hasAppend: typeof map3d.append === 'function'
          });
          map3d.append(marker);
          markerRef.current = marker;
          console.log('✅ [Marker3D] 标记已成功添加到 3D 地图:', label);
        } catch (appendError) {
          console.error('❌ [Marker3D] 添加标记到地图失败:', appendError);
          console.error('map3d 对象:', map3d);
        }
      } catch (error) {
        console.error('❌ [Marker3D] 创建标记失败:', error);
        console.error('错误详情:', error);
      }
    }

    createMarker();

    // 清理函数
    return () => {
      mounted = false;
      if (marker && markerRef.current) {
        try {
          // 从地图移除标记
          marker.remove();
          markerRef.current = null;
          console.log('🧹 [Marker3D] 标记已移除:', label);
        } catch (error) {
          console.warn('⚠️ [Marker3D] 移除标记时出错:', error);
        }
      }
    };
  }, [map3d, position.lat, position.lng, position.altitude, label, altitudeMode, extruded, onClick]);

  return null; // 这个组件不渲染 React 元素，标记由 Web Component 管理
}

