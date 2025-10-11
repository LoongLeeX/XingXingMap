/**
 * 地图类型切换组件
 */

'use client';

import React from 'react';
import { useMapStore } from '../hooks/useMapStore';
import { MAP_TYPES } from '@/shared/constants/map.constants';
import { cn } from '@/lib/utils';

export function MapTypeToggle() {
  const { mapType, setMapType } = useMapStore();
  
  return (
    <div className="flex gap-2 bg-white rounded-lg shadow-md p-2">
      {MAP_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => setMapType(type.value)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            mapType === type.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

