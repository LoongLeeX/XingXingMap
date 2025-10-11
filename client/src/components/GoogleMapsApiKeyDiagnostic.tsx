/**
 * Google Maps API Key 专项诊断组件
 * 帮助诊断和解决 Google Maps JavaScript SDK API Key 问题
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loading } from './ui/Loading';
import { useCurrentApiKey, useApiKeyActions } from '../lib/stores/api-key-store';

interface DiagnosticResult {
  timestamp: string;
  apiKey: {
    present: boolean;
    format: 'valid' | 'invalid' | 'unknown';
    preview: string;
  };
  geocodingApi: {
    status: 'success' | 'error' | 'untested';
    response?: any;
    error?: string;
  };
  mapsJsApi: {
    status: 'success' | 'error' | 'untested';
    scriptLoaded: boolean;
    googleObject: boolean;
    error?: string;
  };
  recommendations: string[];
}

export function GoogleMapsApiKeyDiagnostic() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  
  const currentApiKey = useCurrentApiKey();
  const actions = useApiKeyActions();

  const runDiagnostic = async () => {
    if (!currentApiKey) {
      alert('请先配置 API Key');
      return;
    }

    setIsRunning(true);
    
    const diagnosticResult: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      apiKey: {
        present: !!currentApiKey,
        format: 'unknown',
        preview: currentApiKey ? `${currentApiKey.substring(0, 8)}...${currentApiKey.substring(-4)}` : 'N/A'
      },
      geocodingApi: { status: 'untested' },
      mapsJsApi: { 
        status: 'untested',
        scriptLoaded: false,
        googleObject: false
      },
      recommendations: []
    };

    try {
      // 1. 检查 API Key 格式
      if (currentApiKey) {
        const formatValid = /^AIza[0-9A-Za-z_-]{35}$/.test(currentApiKey);
        diagnosticResult.apiKey.format = formatValid ? 'valid' : 'invalid';
        
        if (!formatValid) {
          diagnosticResult.recommendations.push('API Key 格式不正确，应以 "AIza" 开头，总长度 39 字符');
        }
      }

      // 2. 测试 Geocoding API
      console.log('🔍 [Diagnostic] 测试 Geocoding API...');
      try {
        const geocodingResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=San+Francisco&key=${currentApiKey}`
        );
        
        if (geocodingResponse.ok) {
          const geocodingData = await geocodingResponse.json();
          diagnosticResult.geocodingApi = {
            status: 'success',
            response: geocodingData
          };
          
          // 分析 Geocoding 响应
          switch (geocodingData.status) {
            case 'OK':
              console.log('✅ [Diagnostic] Geocoding API 工作正常');
              break;
            case 'ZERO_RESULTS':
              console.log('✅ [Diagnostic] Geocoding API 可访问（无结果正常）');
              break;
            case 'REQUEST_DENIED':
              diagnosticResult.recommendations.push('Geocoding API 访问被拒绝 - 检查 API Key 权限和域名限制');
              break;
            case 'OVER_QUERY_LIMIT':
              diagnosticResult.recommendations.push('Geocoding API 配额超限 - 检查 Google Cloud Console 配额设置');
              break;
            case 'INVALID_REQUEST':
              diagnosticResult.recommendations.push('Geocoding API 请求无效 - 可能是参数问题');
              break;
            default:
              diagnosticResult.recommendations.push(`Geocoding API 返回未知状态: ${geocodingData.status}`);
          }
        } else {
          diagnosticResult.geocodingApi = {
            status: 'error',
            error: `HTTP ${geocodingResponse.status}: ${geocodingResponse.statusText}`
          };
          diagnosticResult.recommendations.push('Geocoding API HTTP 请求失败');
        }
      } catch (geocodingError) {
        diagnosticResult.geocodingApi = {
          status: 'error',
          error: geocodingError instanceof Error ? geocodingError.message : '未知错误'
        };
        diagnosticResult.recommendations.push('Geocoding API 网络请求失败');
      }

      // 3. 检查 Maps JavaScript API
      console.log('🔍 [Diagnostic] 检查 Maps JavaScript API...');
      
      // 检查脚本是否加载
      const mapsScript = document.querySelector('script[src*="maps.googleapis.com"]');
      diagnosticResult.mapsJsApi.scriptLoaded = !!mapsScript;
      
      if (!mapsScript) {
        diagnosticResult.recommendations.push('Maps JavaScript API 脚本未加载');
      }
      
      // 检查 google 对象
      diagnosticResult.mapsJsApi.googleObject = !!(window as any).google?.maps;
      
      if (!(window as any).google?.maps) {
        diagnosticResult.recommendations.push('Google Maps JavaScript API 对象不可用');
        diagnosticResult.mapsJsApi.status = 'error';
        diagnosticResult.mapsJsApi.error = 'Google Maps 对象未初始化';
      } else {
        diagnosticResult.mapsJsApi.status = 'success';
        console.log('✅ [Diagnostic] Maps JavaScript API 对象可用');
      }

      // 4. 生成通用建议
      if (diagnosticResult.recommendations.length === 0) {
        diagnosticResult.recommendations.push('所有检查都通过了！如果仍有问题，请检查浏览器控制台的错误信息。');
      }

      // 添加常见解决方案
      diagnosticResult.recommendations.push(
        '常见解决方案:',
        '1. 确保在 Google Cloud Console 中启用了 Maps JavaScript API',
        '2. 检查 API Key 的应用限制（HTTP referrer）',
        '3. 确认 API Key 有足够的配额',
        '4. 检查计费账户是否已设置'
      );

    } catch (error) {
      console.error('❌ [Diagnostic] 诊断过程出错:', error);
      diagnosticResult.recommendations.push(`诊断过程出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    setResult(diagnosticResult);
    setIsRunning(false);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 left-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
        >
          🔧 API Key 诊断
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-xl p-4 max-w-2xl max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">🔧 Google Maps API Key 诊断</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning || !currentApiKey}
            className="flex-1"
          >
            {isRunning ? <Loading size="sm" /> : '🔍'} 
            {isRunning ? '诊断中...' : '开始诊断'}
          </Button>
          
          <Button 
            onClick={() => actions.validateCurrentKey()} 
            variant="secondary"
            disabled={!currentApiKey}
          >
            验证 Key
          </Button>
        </div>

        {!currentApiKey && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <p className="text-orange-700 text-sm">
              ⚠️ 未检测到 API Key，请先在设置页面配置
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-3 text-sm">
            <div className="border-b pb-2">
              <h4 className="font-semibold text-gray-700 mb-2">诊断结果</h4>
              <p className="text-xs text-gray-500">
                诊断时间: {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            {/* API Key 状态 */}
            <div>
              <h5 className="font-medium text-gray-600 mb-1">API Key 状态</h5>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div>存在: {result.apiKey.present ? '✅ 是' : '❌ 否'}</div>
                <div>格式: {result.apiKey.format === 'valid' ? '✅ 有效' : result.apiKey.format === 'invalid' ? '❌ 无效' : '❓ 未知'}</div>
                <div>预览: {result.apiKey.preview}</div>
              </div>
            </div>

            {/* Geocoding API 状态 */}
            <div>
              <h5 className="font-medium text-gray-600 mb-1">Geocoding API</h5>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div>状态: {
                  result.geocodingApi.status === 'success' ? '✅ 成功' :
                  result.geocodingApi.status === 'error' ? '❌ 失败' : '❓ 未测试'
                }</div>
                {result.geocodingApi.response && (
                  <div>响应: {result.geocodingApi.response.status}</div>
                )}
                {result.geocodingApi.error && (
                  <div className="text-red-600">错误: {result.geocodingApi.error}</div>
                )}
              </div>
            </div>

            {/* Maps JavaScript API 状态 */}
            <div>
              <h5 className="font-medium text-gray-600 mb-1">Maps JavaScript API</h5>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div>脚本加载: {result.mapsJsApi.scriptLoaded ? '✅ 是' : '❌ 否'}</div>
                <div>Google 对象: {result.mapsJsApi.googleObject ? '✅ 可用' : '❌ 不可用'}</div>
                <div>状态: {
                  result.mapsJsApi.status === 'success' ? '✅ 正常' :
                  result.mapsJsApi.status === 'error' ? '❌ 错误' : '❓ 未测试'
                }</div>
                {result.mapsJsApi.error && (
                  <div className="text-red-600">错误: {result.mapsJsApi.error}</div>
                )}
              </div>
            </div>

            {/* 建议 */}
            <div>
              <h5 className="font-medium text-gray-600 mb-1">建议和解决方案</h5>
              <div className="bg-blue-50 p-2 rounded text-xs">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className={rec.startsWith('常见解决方案') || rec.match(/^\d+\./) ? 'font-medium mt-2' : 'ml-2'}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
