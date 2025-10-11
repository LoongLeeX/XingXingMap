/**
 * 3D Map Hook - 使用新的 Map3DElement API
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Map3DConfig } from '@/shared/types/map.types';
import { DEFAULT_MAP_CONFIG, DEFAULT_3D_CONFIG } from '@/shared/constants/map.constants';
import { useCurrentApiKey } from '@/client/src/lib/stores/api-key-store';
import { env } from '@/client/src/lib/env';

export function use3DMap(containerId: string, config: Partial<Map3DConfig> = {}) {
  const [map, setMap] = useState<any | null>(null); // Map3DElement 类型
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef<any | null>(null);
  const configRef = useRef(config);
  const currentApiKey = useCurrentApiKey();
  
  // 只在第一次挂载时创建地图
  useEffect(() => {
    console.log(`🗺️ [use3DMap] 开始初始化 3D 地图 - containerId: ${containerId}`);
    
    if (!window.google) {
      console.warn('⚠️ [use3DMap] window.google 不可用，等待 SDK 加载');
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`❌ [use3DMap] 找不到容器元素: #${containerId}`);
      return;
    }
    
    // 如果地图实例已存在，恢复状态但不重新创建
    if (mapRef.current) {
      console.log('ℹ️ [use3DMap] 3D 地图实例已存在，恢复状态');
      setMap(mapRef.current);
      setIsReady(true);
      return;
    }
    
    // 简化的 3D 地图初始化
    async function init3DMap() {
      try {
        const apiKey = currentApiKey;
        const mapId = env.googleMapsMapId();
        
        if (!apiKey) {
          console.error('❌ [use3DMap] Google Maps API Key 未配置');
          setIsReady(false);
          return;
        }
        
        if (!mapId) {
          console.error('❌ [use3DMap] Google Maps Map ID 未配置（3D 地图必需）');
          setIsReady(false);
          return;
        }
        
        console.log('📦 [use3DMap] 使用 Map ID:', mapId.substring(0, 10) + '...');
        console.log('📦 [use3DMap] 初始化 3D 地图 (Photorealistic)...');
        
        // 检查是否已经加载了 importLibrary
        if (!window.google?.maps?.importLibrary) {
          console.error('❌ [use3DMap] google.maps.importLibrary 不可用');
          console.error('💡 提示：3D 地图需要使用 v=alpha 或 v=beta 版本的 Maps JavaScript API');
          setIsReady(false);
          return;
        }
        
        // 准备中心点配置
        const center = {
          lat: configRef.current.center?.lat || DEFAULT_MAP_CONFIG.center.lat,
          lng: configRef.current.center?.lng || DEFAULT_MAP_CONFIG.center.lng,
          altitude: 500, // 3D 地图需要高度
        };
        
        console.log('📍 [use3DMap] 中心位置:', center);
        
        // 方法1：尝试使用 Web Component 方式（最可靠）
        console.log('🔧 [use3DMap] 使用 Web Component 方式创建 3D 地图');
        
        // 直接创建 gmp-map-3d 元素
        const map3DElement = document.createElement('gmp-map-3d') as any;
        
        // 设置必需属性
        map3DElement.setAttribute('center', `${center.lat},${center.lng},${center.altitude}`);
        map3DElement.setAttribute('tilt', String(configRef.current.tilt || DEFAULT_3D_CONFIG.tilt));
        map3DElement.setAttribute('heading', String(configRef.current.heading || DEFAULT_3D_CONFIG.heading));
        map3DElement.setAttribute('range', '1000');
        map3DElement.setAttribute('map-id', mapId); // 关键：设置 map-id
        
        // 设置样式
        map3DElement.style.width = '100%';
        map3DElement.style.height = '100%';
        map3DElement.style.display = 'block';
        
        // 添加到容器
        if (container) {
          container.innerHTML = '';
          container.appendChild(map3DElement);
          console.log('✅ [use3DMap] 已添加 gmp-map-3d 元素到容器');
        }
        
        // 监听加载事件
        map3DElement.addEventListener('gmp-load', () => {
          console.log('🎉 [use3DMap] 3D 地图加载成功');
          setIsReady(true);
        });
        
        map3DElement.addEventListener('gmp-error', (event: any) => {
          console.error('❌ [use3DMap] 3D 地图加载失败:', event.detail);
          console.error('💡 可能原因:');
          console.error('   1. Map Tiles API 未启用');
          console.error('   2. API Key 没有 Map Tiles API 权限');
          console.error('   3. Map ID 配置不正确');
          console.error('   4. 需要使用 v=alpha 或 v=beta 版本');
          setIsReady(false);
        });
        
        mapRef.current = map3DElement;
        setMap(map3DElement);
        
        console.log('✅ [use3DMap] 3D 地图元素创建完成，等待加载...');
      } catch (error) {
        console.error('❌ [use3DMap] 创建 3D 地图失败:', error);
        console.error('💡 错误详情:', {
          message: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined
        });
        console.error('💡 提示: 3D 地图需要 Map Tiles API，请确保已在 Google Cloud Console 中启用');
        console.error('💡 检查清单:');
        console.error('   1. Map Tiles API 是否已启用？');
        console.error('   2. API Key 是否有正确的权限？');
        console.error('   3. 当前位置是否支持 3D？（试试旧金山: 37.7704, -122.3985）');
      }
    }
    
    init3DMap();
    
    // 不要在 cleanup 中清理地图！让地图实例持久化
  }, [containerId, currentApiKey]); // 依赖 containerId 和 currentApiKey
  
  return { map, isReady };
}

