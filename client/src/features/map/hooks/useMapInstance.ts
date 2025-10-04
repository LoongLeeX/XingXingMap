/**
 * Map 实例管理 Hook
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { MapConfig } from '@/shared/types/map.types';
import { DEFAULT_MAP_CONFIG, DEFAULT_MAP_CONTROLS } from '@/shared/constants/map.constants';

export function useMapInstance(containerId: string, config: Partial<MapConfig> = {}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const configRef = useRef(config);
  
  // 只在第一次挂载时创建地图
  useEffect(() => {
    console.log(`🗺️ [useMapInstance] 开始初始化地图 - containerId: ${containerId}`);
    console.log('🌍 [useMapInstance] window.google 可用:', !!window.google);
    console.log('📌 [useMapInstance] mapRef.current 存在:', !!mapRef.current);
    
    if (!window.google) {
      console.warn('⚠️ [useMapInstance] window.google 不可用，等待 SDK 加载');
      return;
    }
    
    const container = document.getElementById(containerId);
    console.log('📦 [useMapInstance] 容器元素:', container ? '✅ 找到' : '❌ 未找到');
    
    if (!container) {
      console.error(`❌ [useMapInstance] 找不到容器元素: #${containerId}`);
      return;
    }
    
    // 如果地图实例已存在，恢复状态但不重新创建
    if (mapRef.current) {
      console.log('ℹ️ [useMapInstance] 地图实例已存在，恢复状态');
      setMap(mapRef.current);
      setIsReady(true);
      return;
    }
    
    // 合并配置
    const finalConfig = {
      ...DEFAULT_MAP_CONFIG,
      ...configRef.current,
    };
    
    console.log('⚙️ [useMapInstance] 地图配置:', finalConfig);
    
    try {
      // 创建地图实例（只创建一次）
      console.log('🏗️ [useMapInstance] 正在创建地图实例...');
      const mapInstance = new google.maps.Map(container, {
        center: finalConfig.center,
        zoom: finalConfig.zoom,
        mapTypeId: finalConfig.mapType,
        ...DEFAULT_MAP_CONTROLS,
        // 强制 2D 俯视视角 - 禁用倾斜和旋转
        tilt: 0,  // 禁用倾斜（保持俯视）
        heading: 0, // 禁用旋转（正北方向）
        // 禁用 45° 影像功能
        rotateControl: false,
      });
      
      console.log('✅ [useMapInstance] 地图实例创建成功 - 强制 2D 模式');
      
      mapRef.current = mapInstance;
      setMap(mapInstance);
      
      // 等待地图完全加载
      google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        console.log('🎉 [useMapInstance] 地图加载完成 (idle event)');
        setIsReady(true);
      });
    } catch (error) {
      console.error('❌ [useMapInstance] 创建地图失败:', error);
    }
    
    // 不要在 cleanup 中清理地图！让地图实例持久化
    // return () => {
    //   console.log('🧹 [useMapInstance] 清理地图实例');
    // };
  }, [containerId]); // 只依赖 containerId
  
  useEffect(() => {
    console.log(`📊 [useMapInstance] 状态更新 - map:`, !!map, 'isReady:', isReady);
  }, [map, isReady]);
  
  return { map, isReady };
}

