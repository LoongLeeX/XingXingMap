/**
 * 3D 地图诊断面板
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { useApiKeyConfigs, useEnvironmentInfo, useApiKeyActions } from '../lib/stores/api-key-store';
import { env } from '../lib/env';

export function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // API Key 状态
  const apiKeyConfigs = useApiKeyConfigs();
  const environment = useEnvironmentInfo();
  const apiKeyActions = useApiKeyActions();
  
  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      googleMaps: {
        loaded: !!window.google,
        version: window.google?.maps?.version || 'N/A',
        importLibrary: typeof window.google?.maps?.importLibrary,
      },
      env: {
        apiKeyConfigured: !!env.googleMapsApiKey(),
        apiKeyValue: env.googleMapsApiKey()?.substring(0, 20) + '...' || '',
        mapIdConfigured: !!env.googleMapsMapId(),
        mapIdValue: env.googleMapsMapId() || '',
      },
      apiKeyManager: {
        environment: environment.displayName,
        runtime: environment.runtime,
        currentConfig: apiKeyConfigs.current ? {
          source: apiKeyActions.getSourceDisplayText(apiKeyConfigs.current),
          key: apiKeyActions.getDisplayKey(apiKeyConfigs.current.key),
          status: apiKeyActions.getValidationStatusInfo(apiKeyConfigs.current),
          configuredAt: apiKeyConfigs.current.configuredAt?.toLocaleString(),
        } : null,
        envConfig: apiKeyConfigs.env ? {
          key: apiKeyActions.getDisplayKey(apiKeyConfigs.env.key),
          status: apiKeyActions.getValidationStatusInfo(apiKeyConfigs.env),
        } : null,
        userConfig: apiKeyConfigs.user ? {
          key: apiKeyActions.getDisplayKey(apiKeyConfigs.user.key),
          status: apiKeyActions.getValidationStatusInfo(apiKeyConfigs.user),
          configuredAt: apiKeyConfigs.user.configuredAt?.toLocaleString(),
        } : null,
      },
      dom: {
        map2DContainer: !!document.getElementById('map-2d'),
        map3DContainer: !!document.getElementById('map-3d'),
        map3DElement: document.querySelector('gmp-map-3d'),
      },
    };
    
    // 测试 maps3d 库加载
    if (window.google?.maps?.importLibrary) {
      try {
        console.log('🧪 [Diagnostic] 尝试加载 maps3d 库...');
        const maps3dLib = await window.google.maps.importLibrary("maps3d") as any;
        results.maps3d = {
          loaded: true,
          Map3DElement: !!maps3dLib.Map3DElement,
          library: Object.keys(maps3dLib),
        };
        console.log('✅ [Diagnostic] maps3d 库加载成功:', maps3dLib);
      } catch (error) {
        results.maps3d = {
          loaded: false,
          error: error instanceof Error ? error.message : String(error),
        };
        console.error('❌ [Diagnostic] maps3d 库加载失败:', error);
      }
    } else {
      results.maps3d = {
        loaded: false,
        error: 'importLibrary not available',
      };
    }
    
    setDiagnostics(results);
    console.log('📊 [Diagnostic] 完整诊断结果:', results);
  };
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
        >
          🔧 诊断工具
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">🔧 3D 地图诊断</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <Button onClick={runDiagnostics} className="w-full mb-4">
        运行诊断
      </Button>
      
      {diagnostics && (
        <div className="space-y-3 text-sm">
          <Section title="API Key 管理器">
            <Item 
              label="运行环境" 
              value={diagnostics.apiKeyManager.environment} 
            />
            {diagnostics.apiKeyManager.currentConfig ? (
              <div className="space-y-2">
                <Item 
                  label="当前配置" 
                  value={`${diagnostics.apiKeyManager.currentConfig.status.icon} ${diagnostics.apiKeyManager.currentConfig.source}`}
                />
                <div className="text-[10px] text-gray-600 font-mono ml-2">
                  Key: {diagnostics.apiKeyManager.currentConfig.key}
                </div>
                {diagnostics.apiKeyManager.currentConfig.configuredAt && (
                  <div className="text-[10px] text-gray-500 ml-2">
                    配置: {diagnostics.apiKeyManager.currentConfig.configuredAt}
                  </div>
                )}
                {diagnostics.apiKeyManager.userConfig && (
                  <div className="text-[10px] text-blue-600 ml-2">
                    👤 用户自定义配置生效
                  </div>
                )}
              </div>
            ) : (
              <Item label="当前配置" value="❌ 未配置" />
            )}
          </Section>
          
          <Section title="环境变量 (传统)">
            <Item 
              label="API Key" 
              value={diagnostics.env.apiKeyConfigured} 
            />
            {diagnostics.env.apiKeyConfigured && (
              <div className="text-[10px] text-gray-400 font-mono truncate ml-2">
                {diagnostics.env.apiKeyValue}
              </div>
            )}
            <Item 
              label="Map ID" 
              value={diagnostics.env.mapIdConfigured} 
            />
            {diagnostics.env.mapIdConfigured && (
              <div className="text-[10px] text-green-600 font-mono ml-2">
                ✨ {diagnostics.env.mapIdValue}
              </div>
            )}
          </Section>
          
          <Section title="Google Maps SDK">
            <Item 
              label="已加载" 
              value={diagnostics.googleMaps.loaded} 
            />
            <Item 
              label="版本" 
              value={diagnostics.googleMaps.version} 
            />
            <Item 
              label="importLibrary" 
              value={diagnostics.googleMaps.importLibrary === 'function'} 
            />
          </Section>
          
          <Section title="maps3d 库">
            <Item 
              label="已加载" 
              value={diagnostics.maps3d?.loaded} 
            />
            {diagnostics.maps3d?.Map3DElement !== undefined && (
              <Item 
                label="Map3DElement" 
                value={diagnostics.maps3d.Map3DElement} 
              />
            )}
            {diagnostics.maps3d?.error && (
              <div className="text-red-600 text-xs mt-1 p-2 bg-red-50 rounded">
                ❌ {diagnostics.maps3d.error}
              </div>
            )}
            {diagnostics.maps3d?.library && (
              <div className="text-xs text-gray-600 mt-1">
                导出: {diagnostics.maps3d.library.join(', ')}
              </div>
            )}
          </Section>
          
          <Section title="DOM 元素">
            <Item 
              label="2D 容器" 
              value={diagnostics.dom.map2DContainer} 
            />
            <Item 
              label="3D 容器" 
              value={diagnostics.dom.map3DContainer} 
            />
            <Item 
              label="3D 元素" 
              value={!!diagnostics.dom.map3DElement} 
            />
          </Section>
          
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              查看浏览器控制台获取详细日志
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b pb-2">
      <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: any }) {
  const isBoolean = typeof value === 'boolean';
  const displayValue = isBoolean 
    ? (value ? '✅ 是' : '❌ 否')
    : value;
    
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <span className={isBoolean ? (value ? 'text-green-600' : 'text-red-600') : 'text-gray-900'}>
        {displayValue}
      </span>
    </div>
  );
}

