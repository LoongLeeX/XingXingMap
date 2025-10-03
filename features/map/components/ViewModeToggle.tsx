/**
 * 视图模式切换组件
 */

'use client';

import React from 'react';
import { useMapStore } from '../hooks/useMapStore';
import { VIEW_MODES } from '@/clientservershare/constants/map.constants';
import { cn } from '@/lib/utils';

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useMapStore();
  
  return (
    <div className="flex gap-2 bg-white rounded-lg shadow-md p-2">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setViewMode(mode.value)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === mode.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

