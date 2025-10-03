/**
 * Marker 列表组件
 */

'use client';

import React from 'react';
import { Marker } from '@/clientservershare/types/marker.types';
import { MarkerCard } from './MarkerCard';
import { Loading } from '@/components/ui/Loading';

export interface MarkerListProps {
  markers: Marker[];
  isLoading?: boolean;
  onMarkerClick?: (marker: Marker) => void;
  onMarkerEdit?: (marker: Marker) => void;
  onMarkerDelete?: (id: string) => void;
}

export function MarkerList({
  markers,
  isLoading,
  onMarkerClick,
  onMarkerEdit,
  onMarkerDelete,
}: MarkerListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading text="加载标记中..." />
      </div>
    );
  }
  
  if (markers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无标记</p>
        <p className="text-sm mt-2">点击地图添加新标记</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {markers.map((marker) => (
        <MarkerCard
          key={marker.id}
          marker={marker}
          onClick={() => onMarkerClick?.(marker)}
          onEdit={() => onMarkerEdit?.(marker)}
          onDelete={() => onMarkerDelete?.(marker.id)}
        />
      ))}
    </div>
  );
}

