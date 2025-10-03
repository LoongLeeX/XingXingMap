/**
 * Google Maps 加载 Hook
 * 使用 @googlemaps/js-api-loader 加载传统 2D 地图 API
 * 3D 地图会在需要时单独加载
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_LIBRARIES } from '@/clientservershare/constants/map.constants';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  useEffect(() => {
    console.log('🔍 [useGoogleMaps] 开始加载 Google Maps (2D)');
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('🔑 [useGoogleMaps] API Key 状态:', apiKey ? '✅ 已配置' : '❌ 未配置');
    
    if (!apiKey) {
      console.error('❌ [useGoogleMaps] Google Maps API Key 未配置');
      setLoadError(new Error('Google Maps API Key is not configured'));
      return;
    }
    
    // 检查是否已经加载
    if (window.google?.maps?.Map) {
      console.log('✅ [useGoogleMaps] Google Maps 已加载');
      setIsLoaded(true);
      return;
    }
    
    console.log('📦 [useGoogleMaps] 使用 @googlemaps/js-api-loader 加载 2D 地图...');
    
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES as any,
    });
    
    loader
      .load()
      .then(() => {
        console.log('✅ [useGoogleMaps] Google Maps SDK (2D) 加载成功');
        console.log('🌍 [useGoogleMaps] window.google 可用:', !!window.google);
        console.log('🔍 [useGoogleMaps] Google Maps 版本:', google.maps.version);
        console.log('📦 [useGoogleMaps] google.maps.Map 可用:', !!google.maps.Map);
        
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('❌ [useGoogleMaps] 加载失败:', error);
        setLoadError(error);
      });
  }, []);
  
  useEffect(() => {
    console.log('📊 [useGoogleMaps] 状态更新 - isLoaded:', isLoaded, 'loadError:', loadError);
  }, [isLoaded, loadError]);
  
  return { isLoaded, loadError };
}

