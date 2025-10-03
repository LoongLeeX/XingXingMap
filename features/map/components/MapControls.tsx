/**
 * 地图控件组件
 */

'use client';

import React from 'react';
import { MapTypeToggle } from './MapTypeToggle';
import { ViewModeToggle } from './ViewModeToggle';

export function MapControls() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3">
      <ViewModeToggle />
      <MapTypeToggle />
    </div>
  );
}

