/**
 * Marker 卡片组件
 */

'use client';

import React from 'react';
import { Marker } from '@/clientservershare/types/marker.types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDateTime, truncateText } from '@/clientservershare/utils/shared.utils';

export interface MarkerCardProps {
  marker: Marker;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MarkerCard({ marker, onClick, onEdit, onDelete }: MarkerCardProps) {
  return (
    <Card padding="sm" className="hover:shadow-lg transition-shadow">
      <div className="flex gap-3">
        {/* 缩略图 */}
        <div className="flex-shrink-0">
          {marker.images && marker.images.length > 0 ? (
            <img
              src={marker.images[0]}
              alt={marker.title}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* 内容 */}
        <CardContent className="flex-1 p-0">
          <h4 
            className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
            onClick={onClick}
          >
            {marker.title}
          </h4>
          
          {marker.description && (
            <p className="text-sm text-gray-600 mt-1">
              {truncateText(marker.description, 100)}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>📍 {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}</span>
            <span>•</span>
            <span>{formatDateTime(marker.createdAt)}</span>
          </div>
        </CardContent>
        
        {/* 操作按钮 */}
        <div className="flex flex-col gap-1">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              编辑
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              删除
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

