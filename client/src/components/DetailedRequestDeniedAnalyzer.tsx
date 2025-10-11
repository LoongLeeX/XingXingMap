/**
 * 详细的 REQUEST_DENIED 错误分析器
 * 当 Geocoding API 已启用但仍然收到 REQUEST_DENIED 时使用
 */

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Loading } from './ui/Loading';
import { useCurrentApiKey } from '../lib/stores/api-key-store';

interface DetailedAnalysis {
  step: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string[];
  rawResponse?: any;
  solution?: string[];
}

export function DetailedRequestDeniedAnalyzer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DetailedAnalysis[]>([]);
  
  const currentApiKey = useCurrentApiKey();

  const runDetailedAnalysis = async () => {
    if (!currentApiKey) {
      alert('请先配置 API Key');
      return;
    }

    setIsAnalyzing(true);
    const results: DetailedAnalysis[] = [];

    // 步骤 1: 获取详细的 Geocoding API 响应
    results.push({
      step: '获取详细的 Geocoding API 响应',
      status: 'checking',
      message: '正在发送请求并分析响应...'
    });
    setAnalysis([...results]);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=San+Francisco&key=${currentApiKey}`
      );
      
      const data = await response.json();
      
      results[0].status = 'success';
      results[0].message = `HTTP ${response.status} - 收到响应`;
      results[0].rawResponse = data;
      results[0].details = [
        `状态: ${data.status}`,
        `错误信息: ${data.error_message || '无'}`,
        `结果数量: ${data.results?.length || 0}`
      ];

      // 详细分析错误信息
      if (data.status === 'REQUEST_DENIED') {
        if (data.error_message) {
          if (data.error_message.includes('API key not valid')) {
            results[0].solution = [
              '🔑 API Key 本身无效',
              '检查 API Key 是否被删除或禁用',
              '在 Google Cloud Console 中验证 API Key 状态',
              '尝试重新生成 API Key'
            ];
          } else if (data.error_message.includes('billing')) {
            results[0].solution = [
              '💳 计费账户问题',
              '确保项目关联了有效的计费账户',
              '检查计费账户是否有余额',
              '确认计费账户状态为"有效"'
            ];
          } else if (data.error_message.includes('referer') || data.error_message.includes('referrer')) {
            results[0].solution = [
              '🌐 HTTP referrer 限制问题',
              `当前请求来源: ${window.location.origin}`,
              '检查 API Key 的应用限制设置',
              '确保 HTTP referrer 列表包含当前域名'
            ];
          } else if (data.error_message.includes('IP')) {
            results[0].solution = [
              '🔒 IP 地址限制问题',
              '检查 API Key 是否设置了 IP 地址限制',
              '如果设置了 IP 限制，确保包含当前 IP',
              '考虑改用 HTTP referrer 限制'
            ];
          } else if (data.error_message.includes('quota') || data.error_message.includes('limit')) {
            results[0].solution = [
              '📊 配额或限制问题',
              '检查 API 配额使用情况',
              '确认没有超出每日/每月限制',
              '检查 API Key 的使用限制设置'
            ];
          } else {
            results[0].solution = [
              '❓ 其他原因',
              `具体错误: ${data.error_message}`,
              '检查 Google Cloud Console 中的 API 设置',
              '确认所有相关 API 都已启用'
            ];
          }
        } else {
          results[0].solution = [
            '❓ 无具体错误信息',
            '可能是权限或配置问题',
            '检查 API Key 的所有限制设置',
            '确认项目配置正确'
          ];
        }
      }

      setAnalysis([...results]);

      // 步骤 2: 检查 API Key 详细信息
      results.push({
        step: '分析 API Key 配置',
        status: 'checking',
        message: '检查 API Key 格式和配置...'
      });
      setAnalysis([...results]);

      const keyAnalysis = {
        format: /^AIza[0-9A-Za-z_-]{35}$/.test(currentApiKey),
        length: currentApiKey.length,
        prefix: currentApiKey.substring(0, 4),
        suffix: currentApiKey.substring(-4)
      };

      results[1].status = keyAnalysis.format ? 'success' : 'error';
      results[1].message = keyAnalysis.format ? 'API Key 格式正确' : 'API Key 格式异常';
      results[1].details = [
        `长度: ${keyAnalysis.length} (标准: 39)`,
        `前缀: ${keyAnalysis.prefix} (标准: AIza)`,
        `后缀: ...${keyAnalysis.suffix}`
      ];

      if (!keyAnalysis.format) {
        results[1].solution = [
          '重新从 Google Cloud Console 复制 API Key',
          '确保复制完整，没有截断',
          '检查是否有多余的空格或字符'
        ];
      }

      setAnalysis([...results]);

      // 步骤 3: 测试不同的 API 端点
      results.push({
        step: '测试其他 Google Maps API',
        status: 'checking',
        message: '测试 Places API 和其他端点...'
      });
      setAnalysis([...results]);

      try {
        // 测试 Places API
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=${currentApiKey}`
        );
        const placesData = await placesResponse.json();

        // 测试 Static Maps API
        const staticResponse = await fetch(
          `https://maps.googleapis.com/maps/api/staticmap?center=37.7749,-122.4194&zoom=13&size=100x100&key=${currentApiKey}`
        );

        results[2].status = 'success';
        results[2].message = '其他 API 测试完成';
        results[2].details = [
          `Places API 状态: ${placesData.status}`,
          `Static Maps API HTTP: ${staticResponse.status}`,
          '这有助于判断是特定 API 问题还是通用问题'
        ];

        if (placesData.status === 'OK' && staticResponse.ok) {
          results[2].solution = [
            '✅ 其他 API 工作正常',
            '问题可能特定于 Geocoding API',
            '检查 Geocoding API 的特定配置',
            '可能是 API 限制设置问题'
          ];
        } else if (placesData.status === 'REQUEST_DENIED' && !staticResponse.ok) {
          results[2].solution = [
            '❌ 多个 API 都失败',
            '这是通用的 API Key 问题',
            '重点检查计费账户和基本权限',
            '可能需要重新创建 API Key'
          ];
        }

      } catch (error) {
        results[2].status = 'warning';
        results[2].message = '其他 API 测试失败';
        results[2].details = ['网络错误或其他问题'];
      }

      setAnalysis([...results]);

      // 步骤 4: 环境和网络检查
      results.push({
        step: '环境和网络分析',
        status: 'success',
        message: '当前环境信息',
        details: [
          `域名: ${window.location.hostname}`,
          `端口: ${window.location.port || '默认'}`,
          `协议: ${window.location.protocol}`,
          `完整来源: ${window.location.origin}`,
          `用户代理: ${navigator.userAgent.substring(0, 50)}...`
        ],
        solution: [
          '确保在 API Key 限制中包含当前域名',
          '检查网络是否能正常访问 Google 服务',
          '尝试在不同网络环境下测试'
        ]
      });

      setAnalysis([...results]);

    } catch (error) {
      results[0].status = 'error';
      results[0].message = '网络请求失败';
      results[0].details = [error instanceof Error ? error.message : '未知错误'];
      results[0].solution = [
        '检查网络连接',
        '确认防火墙设置',
        '尝试使用 VPN 或不同网络'
      ];
      setAnalysis([...results]);
    }

    setIsAnalyzing(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
      >
        🔬 深度分析 REQUEST_DENIED
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🔬 REQUEST_DENIED 深度分析器"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Card className="p-4 bg-purple-50 border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">深度分析说明</h3>
            <p className="text-sm text-purple-700">
              既然 Geocoding API 已经启用，我们需要深入分析 REQUEST_DENIED 错误的具体原因。
              这个工具会获取详细的错误信息并提供针对性的解决方案。
            </p>
          </Card>

          <div className="flex space-x-2">
            <Button
              onClick={runDetailedAnalysis}
              disabled={isAnalyzing || !currentApiKey}
              className="flex-1"
            >
              {isAnalyzing ? <Loading size="sm" /> : '🔬'}
              {isAnalyzing ? '深度分析中...' : '开始深度分析'}
            </Button>
          </div>

          {!currentApiKey && (
            <Card className="p-3 bg-orange-50 border-orange-200">
              <p className="text-orange-700 text-sm">
                ⚠️ 未检测到 API Key，请先配置
              </p>
            </Card>
          )}

          {analysis.length > 0 && (
            <div className="space-y-3">
              {analysis.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {item.status === 'success' ? '✅' :
                       item.status === 'error' ? '❌' :
                       item.status === 'warning' ? '⚠️' : '🔍'}
                    </span>
                    <h4 className="font-semibold">{item.step}</h4>
                  </div>
                  
                  <div className={`text-sm p-2 rounded mb-2 ${
                    item.status === 'success' ? 'bg-green-50 text-green-700' :
                    item.status === 'error' ? 'bg-red-50 text-red-700' :
                    item.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {item.message}
                  </div>
                  
                  {item.details && (
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="font-medium mb-1">详细信息:</div>
                      {item.details.map((detail, i) => (
                        <div key={i} className="ml-2">• {detail}</div>
                      ))}
                    </div>
                  )}
                  
                  {item.rawResponse && (
                    <details className="text-xs bg-gray-50 p-2 rounded mb-2">
                      <summary className="cursor-pointer font-medium">原始响应数据</summary>
                      <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(item.rawResponse, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {item.solution && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-blue-800 mb-1">解决方案:</div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {item.solution.map((solution, i) => (
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

          {/* 常见的 Geocoding API 已启用但仍失败的原因 */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Geocoding API 已启用但仍失败的常见原因</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div><strong>1. 计费账户问题:</strong> 即使 API 启用，没有计费账户仍会被拒绝</div>
              <div><strong>2. HTTP referrer 限制:</strong> 当前域名不在允许列表中</div>
              <div><strong>3. API Key 权限:</strong> API 限制中没有包含 Geocoding API</div>
              <div><strong>4. 项目配置:</strong> 在错误的项目中启用了 API</div>
              <div><strong>5. 配额超限:</strong> 超出了每日或每月限制</div>
              <div><strong>6. IP 限制:</strong> 设置了 IP 限制但当前 IP 不在列表中</div>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
}
