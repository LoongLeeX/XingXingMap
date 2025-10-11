/**
 * API Key Store 调试组件
 * 用于实时监控 Store 状态
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useCurrentApiKey, useApiKeyStore } from '../lib/stores/api-key-store';
import { env } from '../lib/env';

export function ApiKeyStoreDebugger() {
  const [debugData, setDebugData] = useState<any>(null);
  const currentApiKey = useCurrentApiKey();
  const store = useApiKeyStore();

  useEffect(() => {
    const updateDebugData = async () => {
      try {
        // 获取 API Key Manager 状态
        const { apiKeyManager } = await import('../lib/api-key-manager');
        const managerState = apiKeyManager.getState();
        const managerCurrentKey = apiKeyManager.getCurrentApiKey();

        setDebugData({
          timestamp: new Date().toLocaleTimeString(),
          useCurrentApiKey: currentApiKey,
          envGoogleMapsApiKey: env.googleMapsApiKey(),
          storeState: {
            isLoading: store.isLoading,
            error: store.error,
            currentConfig: store.currentConfig,
            envConfig: store.envConfig,
            userConfig: store.userConfig,
          },
          managerState: {
            currentKey: managerCurrentKey,
            ...managerState,
          },
        });
      } catch (error) {
        console.error('调试数据更新失败:', error);
      }
    };

    updateDebugData();
    const interval = setInterval(updateDebugData, 1000); // 每秒更新

    return () => clearInterval(interval);
  }, [currentApiKey, store]);

  if (!debugData) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="font-bold mb-2">🐛 API Key Store 调试器 ({debugData.timestamp})</div>
      
      <div className="space-y-1">
        <div>
          <strong>useCurrentApiKey():</strong> 
          <span className={currentApiKey ? 'text-green-400' : 'text-red-400'}>
            {currentApiKey ? ` ${currentApiKey.substring(0, 10)}...` : ' null'}
          </span>
        </div>
        
        <div>
          <strong>env.googleMapsApiKey():</strong> 
          <span className={debugData.envGoogleMapsApiKey ? 'text-green-400' : 'text-red-400'}>
            {debugData.envGoogleMapsApiKey ? ` ${debugData.envGoogleMapsApiKey.substring(0, 10)}...` : ' null'}
          </span>
        </div>
        
        <div>
          <strong>Store 加载:</strong> 
          <span className={!store.isLoading ? 'text-green-400' : 'text-yellow-400'}>
            {store.isLoading ? ' 加载中' : ' 已加载'}
          </span>
        </div>
        
        <div>
          <strong>Store 错误:</strong> 
          <span className={!store.error ? 'text-green-400' : 'text-red-400'}>
            {store.error || ' 无'}
          </span>
        </div>
        
        <div>
          <strong>当前配置:</strong> 
          <span className={store.currentConfig ? 'text-green-400' : 'text-red-400'}>
            {store.currentConfig ? ` ${store.currentConfig.source}` : ' null'}
          </span>
        </div>
        
        <div>
          <strong>环境配置:</strong> 
          <span className={store.envConfig ? 'text-green-400' : 'text-red-400'}>
            {store.envConfig ? ` 存在` : ' null'}
          </span>
        </div>
        
        <div>
          <strong>用户配置:</strong> 
          <span className={store.userConfig ? 'text-green-400' : 'text-red-400'}>
            {store.userConfig ? ` 存在` : ' null'}
          </span>
        </div>
        
        <div>
          <strong>Manager 当前 Key:</strong> 
          <span className={debugData.managerState.currentKey ? 'text-green-400' : 'text-red-400'}>
            {debugData.managerState.currentKey ? ` ${debugData.managerState.currentKey.substring(0, 10)}...` : ' null'}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-xs opacity-75">
        刷新页面或等待 Store 初始化完成
      </div>
    </div>
  );
}
