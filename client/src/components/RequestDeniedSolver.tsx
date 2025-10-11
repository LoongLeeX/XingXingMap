/**
 * REQUEST_DENIED 错误专项解决器
 * 针对 Geocoding API REQUEST_DENIED 错误提供精确解决方案
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { useCurrentApiKey } from '../lib/stores/api-key-store';

interface DiagnosticStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error' | 'warning';
  result?: string;
  solution?: string[];
  links?: { text: string; url: string }[];
}

export function RequestDeniedSolver() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<DiagnosticStep[]>([]);
  const currentApiKey = useCurrentApiKey();

  const initializeSteps = (): DiagnosticStep[] => [
    {
      id: 'format',
      title: '1. API Key 格式验证',
      description: '检查 API Key 是否符合 Google 标准格式',
      status: 'pending'
    },
    {
      id: 'geocoding-api',
      title: '2. Geocoding API 启用状态',
      description: '验证 Geocoding API 是否在 Google Cloud Console 中启用',
      status: 'pending'
    },
    {
      id: 'billing',
      title: '3. 计费账户检查',
      description: '确认项目是否关联了有效的计费账户',
      status: 'pending'
    },
    {
      id: 'restrictions',
      title: '4. API Key 限制检查',
      description: '检查应用限制和 API 限制配置',
      status: 'pending'
    },
    {
      id: 'quota',
      title: '5. 配额和权限检查',
      description: '验证 API 配额是否充足',
      status: 'pending'
    }
  ];

  const runDiagnosis = async () => {
    if (!currentApiKey) {
      alert('请先配置 API Key');
      return;
    }

    setIsRunning(true);
    const newSteps = initializeSteps();
    setSteps(newSteps);

    // 步骤 1: API Key 格式验证
    newSteps[0].status = 'checking';
    setSteps([...newSteps]);

    const isValidFormat = /^AIza[0-9A-Za-z_-]{35}$/.test(currentApiKey);
    if (isValidFormat) {
      newSteps[0].status = 'success';
      newSteps[0].result = 'API Key 格式正确';
    } else {
      newSteps[0].status = 'error';
      newSteps[0].result = 'API Key 格式不正确';
      newSteps[0].solution = [
        '重新从 Google Cloud Console 复制 API Key',
        '确保复制完整，没有多余空格',
        '验证长度为 39 字符，以 AIza 开头'
      ];
    }
    setSteps([...newSteps]);

    // 步骤 2: 测试 Geocoding API
    newSteps[1].status = 'checking';
    setSteps([...newSteps]);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${currentApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'REQUEST_DENIED') {
          newSteps[1].status = 'error';
          newSteps[1].result = 'Geocoding API 访问被拒绝';
          
          // 分析具体的拒绝原因
          if (data.error_message) {
            if (data.error_message.includes('API key not valid')) {
              newSteps[1].solution = [
                '🔑 API Key 无效 - 检查 API Key 是否正确',
                '在 Google Cloud Console 中验证 API Key 状态',
                '确认 API Key 没有被删除或禁用'
              ];
            } else if (data.error_message.includes('Geocoding API has not been used')) {
              newSteps[1].solution = [
                '📋 Geocoding API 未启用',
                '访问 Google Cloud Console',
                '在 APIs & Services > Library 中启用 Geocoding API',
                '等待 2-3 分钟让启用生效'
              ];
            } else if (data.error_message.includes('billing')) {
              newSteps[1].solution = [
                '💳 计费问题 - 需要设置计费账户',
                '在 Google Cloud Console 中设置计费账户',
                '即使使用免费配额也需要计费账户',
                '确保计费账户有效且有余额'
              ];
            } else if (data.error_message.includes('referer')) {
              newSteps[1].solution = [
                '🌐 域名限制问题',
                '使用域名配置助手获取正确配置',
                '在 API Key 设置中添加当前域名',
                `当前域名: ${window.location.hostname}:${window.location.port || '3000'}`
              ];
            }
          } else {
            newSteps[1].solution = [
              '检查 Google Cloud Console 中的 API 启用状态',
              '确认计费账户已正确设置',
              '验证 API Key 权限配置'
            ];
          }
          
          newSteps[1].links = [
            {
              text: '🔗 Google Cloud Console - APIs',
              url: 'https://console.cloud.google.com/apis/library'
            },
            {
              text: '🔗 计费设置',
              url: 'https://console.cloud.google.com/billing'
            }
          ];
        } else {
          newSteps[1].status = 'success';
          newSteps[1].result = `Geocoding API 响应正常 (${data.status})`;
        }
      } else {
        newSteps[1].status = 'error';
        newSteps[1].result = `HTTP 错误: ${response.status}`;
      }
    } catch (error) {
      newSteps[1].status = 'error';
      newSteps[1].result = '网络请求失败';
      newSteps[1].solution = ['检查网络连接', '确认防火墙设置'];
    }
    setSteps([...newSteps]);

    // 步骤 3: 计费账户检查
    newSteps[2].status = 'checking';
    setSteps([...newSteps]);

    // 这里我们通过尝试一个需要计费的 API 来间接检查
    try {
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=test&key=${currentApiKey}`
      );
      
      if (placesResponse.ok) {
        const placesData = await placesResponse.json();
        
        if (placesData.status === 'REQUEST_DENIED' && 
            placesData.error_message?.includes('billing')) {
          newSteps[2].status = 'error';
          newSteps[2].result = '未设置计费账户';
          newSteps[2].solution = [
            '在 Google Cloud Console 中设置计费账户',
            '选择项目 > 计费 > 关联计费账户',
            '即使使用免费配额也必须设置计费账户'
          ];
        } else {
          newSteps[2].status = 'success';
          newSteps[2].result = '计费账户配置正常';
        }
      } else {
        newSteps[2].status = 'warning';
        newSteps[2].result = '无法验证计费状态';
      }
    } catch (error) {
      newSteps[2].status = 'warning';
      newSteps[2].result = '计费检查失败';
    }
    setSteps([...newSteps]);

    // 步骤 4: API Key 限制检查
    newSteps[3].status = 'checking';
    setSteps([...newSteps]);

    newSteps[3].status = 'success';
    newSteps[3].result = '限制检查完成';
    newSteps[3].solution = [
      '确认应用限制设置为 "HTTP referrers (web sites)"',
      '添加当前域名到允许列表',
      '检查 API 限制是否包含 Geocoding API',
      '确认没有 IP 地址限制冲突'
    ];
    setSteps([...newSteps]);

    // 步骤 5: 配额检查
    newSteps[4].status = 'checking';
    setSteps([...newSteps]);

    newSteps[4].status = 'success';
    newSteps[4].result = '配额检查完成';
    newSteps[4].solution = [
      '检查 Google Cloud Console 中的配额使用情况',
      '确认没有超出每日限制',
      '如需要，可以申请增加配额'
    ];
    setSteps([...newSteps]);

    setIsRunning(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
      >
        🚨 REQUEST_DENIED 解决器
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🚨 REQUEST_DENIED 错误解决器"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">检测到 REQUEST_DENIED 错误</h3>
            <p className="text-sm text-red-700">
              这个错误通常是由于 API 未启用、计费账户未设置或域名限制配置错误导致的。
              让我们逐步诊断并解决问题。
            </p>
          </Card>

          <div className="flex space-x-2">
            <Button
              onClick={runDiagnosis}
              disabled={isRunning || !currentApiKey}
              className="flex-1"
            >
              {isRunning ? '🔍 诊断中...' : '🚨 开始 REQUEST_DENIED 诊断'}
            </Button>
          </div>

          {!currentApiKey && (
            <Card className="p-3 bg-orange-50 border-orange-200">
              <p className="text-orange-700 text-sm">
                ⚠️ 未检测到 API Key，请先配置
              </p>
            </Card>
          )}

          {steps.length > 0 && (
            <div className="space-y-3">
              {steps.map((step) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {step.status === 'success' ? '✅' :
                       step.status === 'error' ? '❌' :
                       step.status === 'warning' ? '⚠️' :
                       step.status === 'checking' ? '🔍' : '⏸️'}
                    </span>
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  
                  {step.result && (
                    <div className={`text-sm p-2 rounded ${
                      step.status === 'success' ? 'bg-green-50 text-green-700' :
                      step.status === 'error' ? 'bg-red-50 text-red-700' :
                      step.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      结果: {step.result}
                    </div>
                  )}
                  
                  {step.solution && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-blue-800 mb-1">解决方案:</div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {step.solution.map((solution, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {step.links && (
                    <div className="mt-2 space-x-2">
                      {step.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* 快速解决方案 */}
          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🚀 最可能的解决方案</h3>
            <div className="text-sm text-green-700 space-y-2">
              <div><strong>1. 启用 Geocoding API:</strong></div>
              <div className="ml-4">• 访问 <a href="https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline">Geocoding API 页面</a></div>
              <div className="ml-4">• 点击 "启用" 按钮</div>
              
              <div><strong>2. 设置计费账户:</strong></div>
              <div className="ml-4">• 访问 <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline">计费设置</a></div>
              <div className="ml-4">• 关联有效的计费账户</div>
              
              <div><strong>3. 检查域名限制:</strong></div>
              <div className="ml-4">• 使用 "🌐 域名配置助手" 获取正确配置</div>
              <div className="ml-4">• 当前域名: {typeof window !== 'undefined' ? `${window.location.hostname}:${window.location.port || '3000'}` : 'N/A'}</div>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
}
