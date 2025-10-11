/**
 * Markers Hook
 */

'use client';

import { useState, useEffect } from 'react';
import { Marker } from '@/shared/types/marker.types';
import { getMarkersAction } from '@/server/src/features/markers/actions/marker-actions';

export function useMarkers() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMarkers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [useMarkers] 开始获取标记...');
      const result = await getMarkersAction();
      console.log('📊 [useMarkers] 获取结果:', result);
      
      if (result.success && result.data) {
        // Repository 已经处理了 images 字段的转换，直接使用
        // 不需要再次 JSON.parse
        setMarkers(result.data as any);
        console.log('✅ [useMarkers] 标记已加载，数量:', result.data.length);
      } else {
        setError(result.error || 'Failed to load markers');
        console.error('❌ [useMarkers] 加载失败:', result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ [useMarkers] 异常:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMarkers();
  }, []);
  
  return {
    markers,
    isLoading,
    error,
    refetch: fetchMarkers,
  };
}

