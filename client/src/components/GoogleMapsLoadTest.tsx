/**
 * Google Maps 加载测试组件
 * 用于测试新的脚本加载逻辑
 */

'use client';

import React from 'react';
import { useGoogleMaps } from '../features/map/hooks/useGoogleMaps';
import { Loading } from './ui/Loading';
import { Button } from './ui/Button';

export function GoogleMapsLoadTest() {
  const { isLoaded, loadError } = useGoogleMaps();

  if (loadError) {
    const isApiKeyChanged = loadError.message.includes('API Key 已更改');
    
    return (
      <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {isApiKeyChanged ? '🔄 API Key 已更改' : '❌ 加载失败'}
        </h3>
        <p className="text-red-700 mb-4">{loadError.message}</p>
        
        {isApiKeyChanged ? (
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🔄 刷新页面
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              onClick={() => window.location.href = '/settings'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ⚙️ 前往设置
            </Button>
            <Button 
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              🔄 重新加载
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-6 border border-blue-200 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Loading size="sm" />
          <span className="text-blue-800">正在加载 Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-green-200 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        ✅ Google Maps 加载成功
      </h3>
      <div className="text-sm text-green-700 space-y-1">
        <div>🌍 window.google 可用: {window.google ? '✅' : '❌'}</div>
        <div>🗺️ google.maps.Map 可用: {window.google?.maps?.Map ? '✅' : '❌'}</div>
        <div>📍 google.maps.version: {window.google?.maps?.version || 'N/A'}</div>
        <div>📦 可用库: {window.google?.maps ? Object.keys(window.google.maps).length : 0} 个</div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={() => {
            console.log('🔍 Google Maps 对象详情:', window.google);
            alert('请查看浏览器控制台以获取详细信息');
          }}
          variant="secondary"
          size="sm"
        >
          🔍 查看详细信息
        </Button>
      </div>
    </div>
  );
}
