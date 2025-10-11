/**
 * 设置页面 - 业务逻辑组件
 * 提供 API Key 管理和各种诊断工具
 * 
 * 这是实际的页面内容，可在任何环境中复用
 */

'use client';

import { ApiKeyManagement } from '@/client/src/components/ApiKeyManagement';
import { DomainRestrictionHelper } from '@/client/src/components/DomainRestrictionHelper';
import { AdvancedApiKeyValidator } from '@/client/src/components/AdvancedApiKeyValidator';
import { RequestDeniedSolver } from '@/client/src/components/RequestDeniedSolver';
import { DetailedRequestDeniedAnalyzer } from '@/client/src/components/DetailedRequestDeniedAnalyzer';
import { ApiKeyConfigurationDiagnostic } from '@/client/src/components/ApiKeyConfigurationDiagnostic';
import { ApiKeyDebugger } from '@/client/src/components/ApiKeyDebugger';
import { GoogleMapsLoadTest } from '@/client/src/components/GoogleMapsLoadTest';
import { NewKeyTroubleshooter } from '@/client/src/components/NewKeyTroubleshooter';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">设置</h1>
              <p className="text-gray-600 mt-2">管理您的应用配置和偏好设置</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ApiKeyConfigurationDiagnostic />
              <RequestDeniedSolver />
              <DetailedRequestDeniedAnalyzer />
              <AdvancedApiKeyValidator />
              <DomainRestrictionHelper />
            </div>
          </div>
        </div>

        {/* Google Maps 加载测试 */}
        <div className="mb-8">
          <GoogleMapsLoadTest />
        </div>

        {/* API Key 调试器 */}
        <div className="mb-8">
          <ApiKeyDebugger />
        </div>

        {/* 新 Key 问题排查器 */}
        <div className="mb-8">
          <NewKeyTroubleshooter />
        </div>

        {/* API Key 管理 */}
        <ApiKeyManagement />

        {/* 其他设置区域可以在这里添加 */}
      </div>
    </div>
  );
}

