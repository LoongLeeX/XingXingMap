/**
 * API Key 配置诊断组件
 * 专门诊断 "API Key is not configured" 问题
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Loading } from './ui/Loading';
import { 
  useCurrentApiKey, 
  useApiKeyConfigs, 
  useEnvironmentInfo, 
  useApiKeyStore,
  initializeApiKeyStore 
} from '../lib/stores/api-key-store';
import { env } from '../lib/env';

interface ConfigDiagnostic {
  step: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string[];
  solution?: string[];
}

export function ApiKeyConfigurationDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ConfigDiagnostic[]>([]);

  const currentApiKey = useCurrentApiKey();
  const configs = useApiKeyConfigs();
  const environment = useEnvironmentInfo();
  const store = useApiKeyStore();

  const runConfigDiagnostic = async () => {
    setIsRunning(true);
    const results: ConfigDiagnostic[] = [];

    // 步骤 1: 检查 API Key Store 初始化状态
    results.push({
      step: '检查 API Key Store 初始化',
      status: 'checking',
      message: '检查 Zustand Store 是否正确初始化...'
    });
    setDiagnostics([...results]);

    try {
      // 强制重新初始化 store
      initializeApiKeyStore();
      
      results[0].status = 'success';
      results[0].message = 'API Key Store 已初始化';
      results[0].details = [
        `Store 加载状态: ${store.isLoading ? '加载中' : '已加载'}`,
        `Store 错误: ${store.error || '无'}`,
        `当前配置: ${store.currentConfig ? '存在' : '不存在'}`,
        `环境配置: ${store.envConfig ? '存在' : '不存在'}`,
        `用户配置: ${store.userConfig ? '存在' : '不存在'}`
      ];
    } catch (error) {
      results[0].status = 'error';
      results[0].message = 'Store 初始化失败';
      results[0].details = [error instanceof Error ? error.message : '未知错误'];
    }
    setDiagnostics([...results]);

    // 步骤 2: 检查环境变量
    results.push({
      step: '检查环境变量配置',
      status: 'checking',
      message: '检查 process.env 和环境模块...'
    });
    setDiagnostics([...results]);

    const envApiKey = env.googleMapsApiKey();
    const processEnvKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    results[1].status = envApiKey ? 'success' : 'warning';
    results[1].message = envApiKey ? '环境变量已配置' : '环境变量未配置';
    results[1].details = [
      `env.googleMapsApiKey(): ${envApiKey ? `${envApiKey.substring(0, 10)}...` : '未配置'}`,
      `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${processEnvKey ? `${processEnvKey.substring(0, 10)}...` : '未配置'}`,
      `环境检测结果: ${environment.runtime} - ${environment.displayName}`
    ];

    if (!envApiKey) {
      results[1].solution = [
        '创建 .env.local 文件',
        '添加: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key',
        '重启开发服务器',
        '或者在设置页面添加自定义 API Key'
      ];
    }
    setDiagnostics([...results]);

    // 步骤 3: 检查 useCurrentApiKey Hook
    results.push({
      step: '检查 useCurrentApiKey Hook',
      status: 'checking',
      message: '检查 Hook 返回值...'
    });
    setDiagnostics([...results]);

    results[2].status = currentApiKey ? 'success' : 'error';
    results[2].message = currentApiKey ? 'Hook 返回有效 API Key' : 'Hook 返回 null/undefined';
    results[2].details = [
      `useCurrentApiKey() 返回: ${currentApiKey ? `${currentApiKey.substring(0, 10)}...` : 'null/undefined'}`,
      `返回值类型: ${typeof currentApiKey}`,
      `返回值长度: ${currentApiKey?.length || 0}`
    ];

    if (!currentApiKey) {
      results[2].solution = [
        '检查 API Key Store 是否正确订阅',
        '确认环境变量或用户配置存在',
        '尝试刷新页面重新初始化',
        '检查浏览器控制台的 Store 相关错误'
      ];
    }
    setDiagnostics([...results]);

    // 步骤 4: 检查 localStorage 用户配置
    results.push({
      step: '检查 localStorage 用户配置',
      status: 'checking',
      message: '检查浏览器存储的用户配置...'
    });
    setDiagnostics([...results]);

    try {
      const storedConfig = localStorage.getItem('google_maps_api_key_user_config');
      const parsedConfig = storedConfig ? JSON.parse(storedConfig) : null;

      results[3].status = 'success';
      results[3].message = '用户配置检查完成';
      results[3].details = [
        `localStorage 存储: ${storedConfig ? '存在' : '不存在'}`,
        `配置内容: ${parsedConfig ? `Key: ${parsedConfig.key?.substring(0, 10)}...` : '无'}`,
        `验证状态: ${parsedConfig?.validationStatus || '无'}`,
        `配置时间: ${parsedConfig?.configuredAt || '无'}`
      ];
    } catch (error) {
      results[3].status = 'warning';
      results[3].message = 'localStorage 检查失败';
      results[3].details = [error instanceof Error ? error.message : '未知错误'];
    }
    setDiagnostics([...results]);

    // 步骤 5: 检查 API Key Manager 实例
    results.push({
      step: '检查 API Key Manager 实例',
      status: 'checking',
      message: '检查管理器实例状态...'
    });
    setDiagnostics([...results]);

    try {
      // 动态导入 API Key Manager
      const { apiKeyManager } = await import('../lib/api-key-manager');
      const managerState = apiKeyManager.getState();
      const currentKey = apiKeyManager.getCurrentApiKey();

      results[4].status = 'success';
      results[4].message = 'API Key Manager 状态正常';
      results[4].details = [
        `Manager 当前 Key: ${currentKey ? `${currentKey.substring(0, 10)}...` : 'null'}`,
        `Manager 加载状态: ${managerState.isLoading ? '加载中' : '已加载'}`,
        `Manager 错误: ${managerState.error || '无'}`,
        `Manager 当前配置: ${managerState.currentConfig ? '存在' : '不存在'}`,
        `Manager 环境配置: ${managerState.envConfig ? '存在' : '不存在'}`,
        `Manager 用户配置: ${managerState.userConfig ? '存在' : '不存在'}`
      ];

      if (!currentKey) {
        results[4].solution = [
          '尝试调用 apiKeyManager.refresh() 刷新状态',
          '检查环境变量是否正确加载',
          '确认用户配置是否有效',
          '重新初始化 API Key Manager'
        ];
      }
    } catch (error) {
      results[4].status = 'error';
      results[4].message = 'API Key Manager 检查失败';
      results[4].details = [error instanceof Error ? error.message : '未知错误'];
    }
    setDiagnostics([...results]);

    setIsRunning(false);
  };

  const handleRefreshStore = async () => {
    try {
      const { apiKeyManager } = await import('../lib/api-key-manager');
      await apiKeyManager.refresh();
      alert('Store 已刷新，请重新检查');
    } catch (error) {
      alert('刷新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
        className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
      >
        🔧 配置诊断
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🔧 API Key 配置诊断器"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Card className="p-4 bg-orange-50 border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">配置问题诊断</h3>
            <p className="text-sm text-orange-700">
              专门诊断 "Google Maps API Key is not configured" 错误。
              这个错误通常是因为应用内部的 API Key 配置或加载逻辑有问题。
            </p>
          </Card>

          <div className="flex space-x-2">
            <Button
              onClick={runConfigDiagnostic}
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? <Loading size="sm" /> : '🔧'}
              {isRunning ? '诊断中...' : '开始配置诊断'}
            </Button>
            <Button
              onClick={handleRefreshStore}
              variant="secondary"
            >
              🔄 刷新 Store
            </Button>
          </div>

          {/* 当前状态快速查看 */}
          <Card className="p-3 bg-gray-50">
            <h4 className="font-semibold mb-2">当前状态快照</h4>
            <div className="text-sm space-y-1">
              <div>useCurrentApiKey(): {currentApiKey ? `${currentApiKey.substring(0, 10)}...` : '❌ null/undefined'}</div>
              <div>环境变量: {env.googleMapsApiKey() ? '✅ 已配置' : '❌ 未配置'}</div>
              <div>Store 加载: {store.isLoading ? '⏳ 加载中' : '✅ 已加载'}</div>
              <div>Store 错误: {store.error || '✅ 无错误'}</div>
              <div>当前环境: {environment.displayName}</div>
            </div>
          </Card>

          {diagnostics.length > 0 && (
            <div className="space-y-3">
              {diagnostics.map((diagnostic, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {diagnostic.status === 'success' ? '✅' :
                       diagnostic.status === 'error' ? '❌' :
                       diagnostic.status === 'warning' ? '⚠️' : '🔍'}
                    </span>
                    <h4 className="font-semibold">{diagnostic.step}</h4>
                  </div>
                  
                  <div className={`text-sm p-2 rounded mb-2 ${
                    diagnostic.status === 'success' ? 'bg-green-50 text-green-700' :
                    diagnostic.status === 'error' ? 'bg-red-50 text-red-700' :
                    diagnostic.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {diagnostic.message}
                  </div>
                  
                  {diagnostic.details && (
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="font-medium mb-1">详细信息:</div>
                      {diagnostic.details.map((detail, i) => (
                        <div key={i} className="ml-2">• {detail}</div>
                      ))}
                    </div>
                  )}
                  
                  {diagnostic.solution && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-blue-800 mb-1">解决方案:</div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {diagnostic.solution.map((solution, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* 快速修复建议 */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🚀 快速修复建议</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div><strong>1. 环境变量配置:</strong></div>
              <div className="ml-4 font-mono text-xs bg-white p-2 rounded">
                # 创建或编辑 .env.local 文件<br/>
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
              </div>
              
              <div><strong>2. 或者使用应用内配置:</strong></div>
              <div className="ml-4">在设置页面点击 "添加自定义 API Key"</div>
              
              <div><strong>3. 重启开发服务器:</strong></div>
              <div className="ml-4 font-mono text-xs bg-white p-2 rounded">
                npm run dev
              </div>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
}
