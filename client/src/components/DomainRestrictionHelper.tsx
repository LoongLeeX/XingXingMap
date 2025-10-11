/**
 * 域名限制配置助手
 * 帮助用户正确配置 Google Maps API Key 的 HTTP referrer 限制
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';

interface DomainInfo {
  current: {
    hostname: string;
    port: string;
    protocol: string;
    fullUrl: string;
  };
  recommendations: string[];
}

export function DomainRestrictionHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const port = window.location.port;
      const protocol = window.location.protocol;
      const fullUrl = window.location.href;

      const recommendations: string[] = [];

      // 基于当前环境生成推荐配置
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // 本地开发环境
        recommendations.push(
          `${hostname}:${port || '3000'}/*`,
          `${hostname}/*`,
          'localhost:3000/*',
          'localhost/*',
          '127.0.0.1:3000/*',
          '127.0.0.1/*'
        );
      } else if (hostname.includes('vercel.app')) {
        // Vercel 环境
        recommendations.push(
          `${hostname}/*`,
          '*.vercel.app/*',
          `${hostname.split('.')[0]}-*.vercel.app/*`
        );
      } else if (hostname.includes('netlify.app')) {
        // Netlify 环境
        recommendations.push(
          `${hostname}/*`,
          '*.netlify.app/*'
        );
      } else {
        // 自定义域名
        recommendations.push(
          `${hostname}/*`,
          `*.${hostname.split('.').slice(-2).join('.')}/*`
        );
      }

      // 添加通用的开发环境配置
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        recommendations.push(
          'localhost:3000/*',
          'localhost/*',
          '127.0.0.1:3000/*',
          '127.0.0.1/*'
        );
      }

      setDomainInfo({
        current: {
          hostname,
          port: port || (protocol === 'https:' ? '443' : '80'),
          protocol,
          fullUrl
        },
        recommendations: [...new Set(recommendations)] // 去重
      });
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const copyAllRecommendations = async () => {
    if (!domainInfo) return;
    
    const allRecommendations = domainInfo.recommendations.join('\n');
    await copyToClipboard(allRecommendations);
  };

  if (!domainInfo) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
        className="ml-2"
      >
        🌐 域名配置助手
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🌐 API Key 域名限制配置助手"
      >
        <div className="space-y-6">
          {/* 当前环境信息 */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">📍 当前运行环境</h3>
            <div className="space-y-2 text-sm">
              <div><strong>域名:</strong> {domainInfo.current.hostname}</div>
              <div><strong>端口:</strong> {domainInfo.current.port}</div>
              <div><strong>协议:</strong> {domainInfo.current.protocol}</div>
              <div><strong>完整URL:</strong> {domainInfo.current.fullUrl}</div>
            </div>
          </Card>

          {/* 推荐配置 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">🔧 推荐的 HTTP referrer 配置</h3>
              <Button
                onClick={copyAllRecommendations}
                variant="secondary"
                size="sm"
              >
                {copied === domainInfo.recommendations.join('\n') ? '✅ 已复制' : '📋 复制全部'}
              </Button>
            </div>
            
            <div className="space-y-2">
              {domainInfo.recommendations.map((domain, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border"
                >
                  <code className="text-sm font-mono text-gray-800">{domain}</code>
                  <Button
                    onClick={() => copyToClipboard(domain)}
                    variant="secondary"
                    size="sm"
                  >
                    {copied === domain ? '✅' : '📋'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 配置步骤 */}
          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">📋 配置步骤</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
              <li>访问 <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>找到您的 API Key 并点击编辑</li>
              <li>在 "Application restrictions" 部分选择 "HTTP referrers (web sites)"</li>
              <li>将上面推荐的域名配置逐个添加到 "Website restrictions" 中</li>
              <li>点击 "Save" 保存配置</li>
              <li>等待 1-2 分钟让配置生效</li>
            </ol>
          </Card>

          {/* 常见问题 */}
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-3">⚠️ 常见问题</h3>
            <div className="space-y-3 text-sm text-yellow-700">
              <div>
                <strong>问题 1:</strong> 设置了域名限制但仍然失败
                <br />
                <strong>解决:</strong> 检查是否包含了端口号，确保格式正确（如 localhost:3000/*）
              </div>
              
              <div>
                <strong>问题 2:</strong> Vercel 预览环境无法访问
                <br />
                <strong>解决:</strong> 添加通配符域名 *.vercel.app/*
              </div>
              
              <div>
                <strong>问题 3:</strong> 配置后需要多长时间生效？
                <br />
                <strong>解决:</strong> 通常 1-2 分钟，最多可能需要 5 分钟
              </div>
            </div>
          </Card>

          {/* 临时解决方案 */}
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800 mb-3">🚨 临时解决方案（仅开发环境）</h3>
            <div className="text-sm text-red-700 space-y-2">
              <p>如果急需测试，可以临时关闭域名限制：</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>在 API Key 设置中选择 "Application restrictions" → "None"</li>
                <li>保存配置</li>
                <li><strong className="text-red-800">⚠️ 重要：生产环境必须重新启用域名限制！</strong></li>
              </ol>
              <div className="mt-3 p-2 bg-red-100 rounded">
                <strong>安全警告：</strong> 关闭域名限制会让您的 API Key 可以被任何网站使用，存在安全风险和费用风险。
              </div>
            </div>
          </Card>

          {/* 测试工具 */}
          <div className="flex space-x-3">
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              className="flex-1"
            >
              🔄 刷新页面测试
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              ✅ 完成配置
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
