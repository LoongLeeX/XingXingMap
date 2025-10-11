/**
 * API Key 调试组件
 * 用于快速检查 API Key 加载状态
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useCurrentApiKey, useApiKeyStore } from '../lib/stores/api-key-store';
import { env } from '../lib/env';

export function ApiKeyDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [managerInfo, setManagerInfo] = useState<any>(null);
  const currentApiKey = useCurrentApiKey();
  const store = useApiKeyStore();

  const collectDebugInfo = async () => {
    try {
      // 收集基础信息
      const basicInfo = {
        useCurrentApiKey: currentApiKey,
        envGoogleMapsApiKey: env.googleMapsApiKey(),
        processEnv: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        storeState: {
          isLoading: store.isLoading,
          error: store.error,
          currentConfig: store.currentConfig,
          envConfig: store.envConfig,
          userConfig: store.userConfig,
          environment: store.environment,
        },
        localStorage: {
          hasUserConfig: !!localStorage.getItem('google_maps_api_key_user_config'),
          userConfigContent: localStorage.getItem('google_maps_api_key_user_config'),
        },
        windowGoogle: {
          exists: !!(window as any).google,
          maps: !!(window as any).google?.maps,
          mapsMap: !!(window as any).google?.maps?.Map,
        },
      };

      setDebugInfo(basicInfo);

      // 收集 API Key Manager 信息
      const { apiKeyManager } = await import('../lib/api-key-manager');
      const managerState = apiKeyManager.getState();
      const managerCurrentKey = apiKeyManager.getCurrentApiKey();

      setManagerInfo({
        getCurrentApiKey: managerCurrentKey,
        state: managerState,
      });

    } catch (error) {
      console.error('收集调试信息失败:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : '未知错误' });
    }
  };

  const forceRefresh = async () => {
    try {
      const { apiKeyManager } = await import('../lib/api-key-manager');
      await apiKeyManager.refresh();
      await store.actions.refresh();
      await collectDebugInfo();
      alert('已刷新，请检查调试信息');
    } catch (error) {
      alert('刷新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const forceReload = () => {
    window.location.reload();
  };

  useEffect(() => {
    collectDebugInfo();
  }, [currentApiKey, store.isLoading]);

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-yellow-800">🐛 API Key 调试器</h3>
        <div className="space-x-2">
          <Button onClick={collectDebugInfo} size="sm" variant="secondary">
            🔄 刷新信息
          </Button>
          <Button onClick={forceRefresh} size="sm" variant="secondary">
            🔄 强制刷新
          </Button>
          <Button onClick={forceReload} size="sm" variant="outline">
            🔄 重新加载页面
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* 快速状态 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>useCurrentApiKey():</strong>
            <div className={`p-2 rounded ${currentApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {currentApiKey ? `${currentApiKey.substring(0, 10)}...` : '❌ null/undefined'}
            </div>
          </div>
          <div>
            <strong>env.googleMapsApiKey():</strong>
            <div className={`p-2 rounded ${env.googleMapsApiKey() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {env.googleMapsApiKey() ? `${env.googleMapsApiKey()!.substring(0, 10)}...` : '❌ 未配置'}
            </div>
          </div>
        </div>

        {/* 详细调试信息 */}
        {debugInfo && (
          <details className="bg-white p-3 rounded border">
            <summary className="cursor-pointer font-medium">📊 详细调试信息</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}

        {/* API Key Manager 信息 */}
        {managerInfo && (
          <details className="bg-white p-3 rounded border">
            <summary className="cursor-pointer font-medium">🔧 API Key Manager 状态</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
              {JSON.stringify(managerInfo, null, 2)}
            </pre>
          </details>
        )}

        {/* 快速修复建议 */}
        <div className="bg-blue-50 p-3 rounded border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">🚀 快速修复步骤</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. 检查 .env.local 文件是否存在且包含 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
            <li>2. 重启开发服务器 (npm run dev)</li>
            <li>3. 清除浏览器缓存和 localStorage</li>
            <li>4. 检查浏览器控制台是否有错误信息</li>
            <li>5. 尝试在设置页面手动添加 API Key</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
