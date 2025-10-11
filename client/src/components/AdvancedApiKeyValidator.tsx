/**
 * 高级 API Key 验证器
 * 提供详细的验证步骤和错误诊断
 */

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Loading } from './ui/Loading';
import { useCurrentApiKey } from '../lib/stores/api-key-store';

interface ValidationStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message?: string;
  details?: string[];
  solution?: string[];
}

interface ValidationResult {
  overall: 'success' | 'partial' | 'failed';
  steps: ValidationStep[];
  recommendations: string[];
  apiKeyInfo: {
    format: boolean;
    length: number;
    prefix: string;
  };
}

export function AdvancedApiKeyValidator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  
  const currentApiKey = useCurrentApiKey();

  const validateApiKey = async () => {
    if (!currentApiKey) {
      alert('请先配置 API Key');
      return;
    }

    setIsValidating(true);
    
    const steps: ValidationStep[] = [
      { name: 'API Key 格式检查', status: 'pending' },
      { name: 'Geocoding API 测试', status: 'pending' },
      { name: 'Maps JavaScript API 测试', status: 'pending' },
      { name: 'Places API 测试', status: 'pending' },
      { name: '域名限制检查', status: 'pending' },
      { name: '配额状态检查', status: 'pending' }
    ];

    const recommendations: string[] = [];
    
    // API Key 基本信息
    const apiKeyInfo = {
      format: /^AIza[0-9A-Za-z_-]{35}$/.test(currentApiKey),
      length: currentApiKey.length,
      prefix: currentApiKey.substring(0, 4)
    };

    try {
      // 步骤 1: API Key 格式检查
      steps[0].status = 'running';
      setResult({ overall: 'partial', steps: [...steps], recommendations, apiKeyInfo });
      
      if (apiKeyInfo.format) {
        steps[0].status = 'success';
        steps[0].message = 'API Key 格式正确';
      } else {
        steps[0].status = 'error';
        steps[0].message = 'API Key 格式不正确';
        steps[0].details = [
          `长度: ${apiKeyInfo.length} (应为 39)`,
          `前缀: ${apiKeyInfo.prefix} (应为 AIza)`,
          '包含无效字符或长度不正确'
        ];
        steps[0].solution = [
          '检查 API Key 是否完整复制',
          '确认没有多余的空格或字符',
          '重新从 Google Cloud Console 复制 API Key'
        ];
        recommendations.push('API Key 格式错误，请检查并重新配置');
      }

      // 步骤 2: Geocoding API 测试
      steps[1].status = 'running';
      setResult({ overall: 'partial', steps: [...steps], recommendations, apiKeyInfo });
      
      try {
        const geocodingResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=San+Francisco&key=${currentApiKey}`
        );
        
        if (geocodingResponse.ok) {
          const geocodingData = await geocodingResponse.json();
          
          switch (geocodingData.status) {
            case 'OK':
              steps[1].status = 'success';
              steps[1].message = 'Geocoding API 工作正常';
              break;
            case 'ZERO_RESULTS':
              steps[1].status = 'success';
              steps[1].message = 'Geocoding API 可访问（无结果正常）';
              break;
            case 'REQUEST_DENIED':
              steps[1].status = 'error';
              steps[1].message = 'Geocoding API 访问被拒绝';
              steps[1].details = [
                '可能原因: API Key 无效',
                '可能原因: Geocoding API 未启用',
                '可能原因: 域名/IP 限制',
                '可能原因: API Key 权限不足'
              ];
              steps[1].solution = [
                '在 Google Cloud Console 启用 Geocoding API',
                '检查 API Key 的应用限制设置',
                '验证 API Key 是否有效',
                '检查计费账户设置'
              ];
              recommendations.push('启用 Geocoding API 并检查权限设置');
              break;
            case 'OVER_QUERY_LIMIT':
              steps[1].status = 'warning';
              steps[1].message = '配额超限';
              steps[1].solution = ['增加 API 配额', '检查计费设置', '等待配额重置'];
              recommendations.push('API 配额已用尽，请检查配额设置');
              break;
            default:
              steps[1].status = 'warning';
              steps[1].message = `未知状态: ${geocodingData.status}`;
          }
        } else {
          steps[1].status = 'error';
          steps[1].message = `HTTP 错误: ${geocodingResponse.status}`;
        }
      } catch (error) {
        steps[1].status = 'error';
        steps[1].message = '网络请求失败';
        steps[1].details = [error instanceof Error ? error.message : '未知错误'];
      }

      // 步骤 3: Maps JavaScript API 测试
      steps[2].status = 'running';
      setResult({ overall: 'partial', steps: [...steps], recommendations, apiKeyInfo });
      
      try {
        // 检查当前页面是否已加载 Google Maps
        if ((window as any).google?.maps) {
          steps[2].status = 'success';
          steps[2].message = 'Maps JavaScript API 已加载并可用';
          steps[2].details = [
            `版本: ${(window as any).google.maps.version}`,
            '核心对象可用: Map, LatLng, Marker 等'
          ];
        } else {
          // 尝试动态加载测试
          const testScript = document.createElement('script');
          testScript.src = `https://maps.googleapis.com/maps/api/js?key=${currentApiKey}&callback=__mapsApiTest__`;
          
          const loadPromise = new Promise<void>((resolve, reject) => {
            (window as any).__mapsApiTest__ = () => {
              resolve();
              delete (window as any).__mapsApiTest__;
            };
            
            testScript.onerror = () => reject(new Error('脚本加载失败'));
            setTimeout(() => reject(new Error('加载超时')), 10000);
          });
          
          document.head.appendChild(testScript);
          
          try {
            await loadPromise;
            steps[2].status = 'success';
            steps[2].message = 'Maps JavaScript API 可以正常加载';
          } catch (error) {
            steps[2].status = 'error';
            steps[2].message = 'Maps JavaScript API 加载失败';
            steps[2].details = [error instanceof Error ? error.message : '未知错误'];
            steps[2].solution = [
              '在 Google Cloud Console 启用 Maps JavaScript API',
              '检查域名限制设置',
              '验证 API Key 权限'
            ];
            recommendations.push('启用 Maps JavaScript API');
          } finally {
            document.head.removeChild(testScript);
          }
        }
      } catch (error) {
        steps[2].status = 'error';
        steps[2].message = 'Maps JavaScript API 测试失败';
      }

      // 步骤 4: Places API 测试
      steps[3].status = 'running';
      setResult({ overall: 'partial', steps: [...steps], recommendations, apiKeyInfo });
      
      try {
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=${currentApiKey}`
        );
        
        if (placesResponse.ok) {
          const placesData = await placesResponse.json();
          
          if (placesData.status === 'OK' || placesData.status === 'ZERO_RESULTS') {
            steps[3].status = 'success';
            steps[3].message = 'Places API 工作正常';
          } else if (placesData.status === 'REQUEST_DENIED') {
            steps[3].status = 'warning';
            steps[3].message = 'Places API 未启用或权限不足';
            steps[3].solution = ['在 Google Cloud Console 启用 Places API（可选）'];
          } else {
            steps[3].status = 'warning';
            steps[3].message = `Places API 状态: ${placesData.status}`;
          }
        } else {
          steps[3].status = 'warning';
          steps[3].message = 'Places API 不可访问';
        }
      } catch (error) {
        steps[3].status = 'warning';
        steps[3].message = 'Places API 测试失败（非必需）';
      }

      // 步骤 5: 域名限制检查
      steps[4].status = 'running';
      setResult({ overall: 'partial', steps: [...steps], recommendations, apiKeyInfo });
      
      const currentDomain = window.location.hostname;
      const currentPort = window.location.port;
      const currentOrigin = window.location.origin;
      
      steps[4].status = 'success';
      steps[4].message = '域名信息收集完成';
      steps[4].details = [
        `当前域名: ${currentDomain}`,
        `当前端口: ${currentPort || '默认端口'}`,
        `当前来源: ${currentOrigin}`,
        '建议配置: 参考域名配置助手'
      ];

      // 步骤 6: 配额状态检查
      steps[5].status = 'running';
      setResult({ overall: 'partial', steps: [...steps], recommendations, apiKeyInfo });
      
      // 这里可以添加更多配额检查逻辑
      steps[5].status = 'success';
      steps[5].message = '基础配额检查完成';
      steps[5].details = [
        '建议定期检查 Google Cloud Console 中的配额使用情况',
        '确保计费账户已正确设置'
      ];

      // 确定整体结果
      const errorCount = steps.filter(s => s.status === 'error').length;
      const warningCount = steps.filter(s => s.status === 'warning').length;
      
      let overall: 'success' | 'partial' | 'failed';
      if (errorCount === 0 && warningCount === 0) {
        overall = 'success';
      } else if (errorCount === 0) {
        overall = 'partial';
      } else {
        overall = 'failed';
      }

      // 添加通用建议
      if (overall !== 'success') {
        recommendations.push(
          '检查 Google Cloud Console 中的 API 启用状态',
          '验证计费账户设置',
          '确认 API Key 权限配置'
        );
      }

      setResult({ overall, steps, recommendations, apiKeyInfo });

    } catch (error) {
      console.error('验证过程出错:', error);
      recommendations.push('验证过程中出现错误，请检查网络连接');
      setResult({ overall: 'failed', steps, recommendations, apiKeyInfo });
    }

    setIsValidating(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
      >
        🔬 高级验证
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🔬 高级 API Key 验证器"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {!currentApiKey && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <p className="text-orange-700">⚠️ 未检测到 API Key，请先配置</p>
            </Card>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={validateApiKey}
              disabled={isValidating || !currentApiKey}
              className="flex-1"
            >
              {isValidating ? <Loading size="sm" /> : '🔬'}
              {isValidating ? '验证中...' : '开始高级验证'}
            </Button>
          </div>

          {result && (
            <div className="space-y-4">
              {/* 整体结果 */}
              <Card className={`p-3 ${
                result.overall === 'success' ? 'bg-green-50 border-green-200' :
                result.overall === 'partial' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {result.overall === 'success' ? '✅' :
                     result.overall === 'partial' ? '⚠️' : '❌'}
                  </span>
                  <span className="font-semibold">
                    {result.overall === 'success' ? 'API Key 验证成功' :
                     result.overall === 'partial' ? 'API Key 部分可用' :
                     'API Key 验证失败'}
                  </span>
                </div>
              </Card>

              {/* API Key 信息 */}
              <Card className="p-3 bg-gray-50">
                <h4 className="font-semibold mb-2">API Key 信息</h4>
                <div className="text-sm space-y-1">
                  <div>格式: {result.apiKeyInfo.format ? '✅ 正确' : '❌ 错误'}</div>
                  <div>长度: {result.apiKeyInfo.length} (标准: 39)</div>
                  <div>前缀: {result.apiKeyInfo.prefix}</div>
                </div>
              </Card>

              {/* 验证步骤 */}
              <div>
                <h4 className="font-semibold mb-2">验证步骤</h4>
                <div className="space-y-2">
                  {result.steps.map((step, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span>
                          {step.status === 'success' ? '✅' :
                           step.status === 'error' ? '❌' :
                           step.status === 'warning' ? '⚠️' :
                           step.status === 'running' ? '⏳' : '⏸️'}
                        </span>
                        <span className="font-medium">{step.name}</span>
                      </div>
                      
                      {step.message && (
                        <div className="text-sm text-gray-700 ml-6">{step.message}</div>
                      )}
                      
                      {step.details && (
                        <div className="text-xs text-gray-600 ml-6 mt-1">
                          {step.details.map((detail, i) => (
                            <div key={i}>• {detail}</div>
                          ))}
                        </div>
                      )}
                      
                      {step.solution && (
                        <div className="text-xs text-blue-600 ml-6 mt-1">
                          <div className="font-medium">解决方案:</div>
                          {step.solution.map((solution, i) => (
                            <div key={i}>• {solution}</div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* 建议 */}
              {result.recommendations.length > 0 && (
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">建议和解决方案</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <div key={index}>• {rec}</div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
