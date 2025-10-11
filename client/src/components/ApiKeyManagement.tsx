/**
 * API Key 管理组件
 * 提供完整的 API Key 配置和管理界面
 */

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { toast } from './ui/Toast';
import { Loading } from './ui/Loading';
import { 
  useApiKeyStore, 
  useApiKeyConfigs, 
  useEnvironmentInfo, 
  useApiKeyActions, 
  useApiKeyLoading, 
  useApiKeyError 
} from '../lib/stores/api-key-store';

export function ApiKeyManagement() {
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [showFullKey, setShowFullKey] = useState<string | null>(null);
  const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const configs = useApiKeyConfigs();
  const environment = useEnvironmentInfo();
  const actions = useApiKeyActions();
  const isLoading = useApiKeyLoading();
  const error = useApiKeyError();

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleAddApiKey = async () => {
    if (!newApiKey.trim()) {
      showToast('请输入有效的 API Key', 'error');
      return;
    }

    try {
      await actions.setUserApiKey(newApiKey.trim());
      setNewApiKey('');
      setIsAddingKey(false);
      showToast('API Key 已更新，页面即将刷新...', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '设置失败', 'error');
    }
  };

  const handleRemoveUserKey = async () => {
    try {
      await actions.removeUserApiKey();
      showToast('API Key 已移除，页面即将刷新...', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除失败', 'error');
    }
  };

  const handleValidateKey = async (apiKey?: string) => {
    setIsValidating(true);
    try {
      const isValid = apiKey 
        ? await actions.validateSpecificKey(apiKey)
        : await actions.validateCurrentKey();
      
      showToast(
        isValid ? 'API Key 验证成功 ✅' : 'API Key 无效，请检查 ❌',
        isValid ? 'success' : 'error'
      );
    } catch (error) {
      showToast('验证失败，请稍后重试', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleShowFullKey = (key: string) => {
    setShowFullKey(key);
    setTimeout(() => setShowFullKey(null), 5000);
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      showToast('API Key 已复制到剪贴板', 'success');
    } catch (error) {
      showToast('复制失败', 'error');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loading />
          <span className="ml-2">加载 API Key 配置...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 主标题 */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">🔑 Google Maps API Key 管理</h2>
        <p className="text-gray-600 mt-1">管理和配置您的 Google Maps API Key</p>
      </div>

      {/* 当前运行环境 */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3">当前运行环境</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {environment.runtime === 'LOCAL' ? '💻' : '☁️'}
            </span>
            <div>
              <div className="font-medium">{environment.displayName}</div>
              {environment.vercelEnv && (
                <div className="text-sm text-gray-600">类型: {environment.vercelEnv}</div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 当前使用的 API Key */}
      {configs.current ? (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">当前使用的 API Key</h3>
          <ApiKeyConfigCard
            config={configs.current}
            environment={environment}
            actions={actions}
            onValidate={() => handleValidateKey()}
            onShowFull={() => handleShowFullKey(configs.current!.key)}
            onCopy={() => handleCopyKey(configs.current!.key)}
            onRemove={configs.current.source === 'USER_CUSTOM' ? handleRemoveUserKey : undefined}
            showFullKey={showFullKey === configs.current.key}
            isValidating={isValidating}
          />
        </Card>
      ) : (
        <NoApiKeyCard environment={environment} onAddKey={() => setIsAddingKey(true)} />
      )}

      {/* 环境默认配置（仅在有用户自定义时显示） */}
      {configs.user && configs.env && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">环境默认配置</h3>
          <ApiKeyConfigCard
            config={configs.env}
            environment={environment}
            actions={actions}
            onValidate={() => handleValidateKey(configs.env!.key)}
            onShowFull={() => handleShowFullKey(configs.env!.key)}
            onCopy={() => handleCopyKey(configs.env!.key)}
            showFullKey={showFullKey === configs.env.key}
            isValidating={isValidating}
            isBackup
          />
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              ℹ️ 提示: 用户自定义配置会覆盖此环境配置
            </p>
          </div>
        </Card>
      )}

      {/* 添加自定义 API Key 按钮 */}
      {!configs.user && configs.current && (
        <div className="flex justify-center">
          <Button onClick={() => setIsAddingKey(true)} variant="secondary">
            + 添加自定义 API Key
          </Button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center text-red-700">
            <span className="text-xl mr-2">⚠️</span>
            <div>
              <div className="font-medium">配置错误</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* 添加 API Key 模态框 */}
      <Modal
        isOpen={isAddingKey}
        onClose={() => {
          setIsAddingKey(false);
          setNewApiKey('');
        }}
        title="添加自定义 API Key"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps API Key
            </label>
            <Input
              type="text"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              请输入您的 Google Maps API Key
            </p>
          </div>

          {/* 安全提示 */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div className="text-sm text-yellow-700">
                <div className="font-medium mb-1">安全提示</div>
                <div>自定义 API Key 存储在浏览器本地，存在以下风险：</div>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>可通过浏览器开发者工具查看</li>
                  <li>XSS 攻击可能导致泄露</li>
                </ul>
                <div className="mt-2">生产环境建议使用环境变量配置 API Key</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddingKey(false);
                setNewApiKey('');
              }}
            >
              取消
            </Button>
            <Button onClick={handleAddApiKey}>
              添加
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

// API Key 配置卡片组件
interface ApiKeyConfigCardProps {
  config: any;
  environment: any;
  actions: any;
  onValidate: () => void;
  onShowFull: () => void;
  onCopy: () => void;
  onRemove?: () => void;
  showFullKey?: boolean;
  isValidating?: boolean;
  isBackup?: boolean;
}

function ApiKeyConfigCard({
  config,
  environment,
  actions,
  onValidate,
  onShowFull,
  onCopy,
  onRemove,
  showFullKey,
  isValidating,
  isBackup
}: ApiKeyConfigCardProps) {
  const sourceText = actions.getSourceDisplayText(config);
  const statusInfo = actions.getValidationStatusInfo(config);
  const displayKey = showFullKey ? config.key : actions.getDisplayKey(config.key);

  return (
    <div className={`border rounded-lg p-4 ${isBackup ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'}`}>
      <div className="space-y-3">
        {/* 来源和状态 */}
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-gray-900">来源: {sourceText}</div>
            {config.configuredAt && (
              <div className="text-sm text-gray-600">
                配置时间: {config.configuredAt.toLocaleString()}
              </div>
            )}
          </div>
          <div className={`flex items-center ${statusInfo.color}`}>
            <span className="mr-1">{statusInfo.icon}</span>
            <span className="text-sm font-medium">{statusInfo.text}</span>
          </div>
        </div>

        {/* API Key 显示 */}
        <div className="bg-white rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-mono text-sm text-gray-800">
              Key: {displayKey}
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={onShowFull}
                disabled={showFullKey}
              >
                {showFullKey ? '5秒后隐藏' : '显示完整'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onCopy}
              >
                复制
              </Button>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {config.error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            ❌ {config.error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <Button
            size="sm"
            onClick={onValidate}
            disabled={isValidating}
          >
            {isValidating ? '验证中...' : '测试'}
          </Button>
          {onRemove && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onRemove}
            >
              删除
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// 无 API Key 配置卡片
interface NoApiKeyCardProps {
  environment: any;
  onAddKey: () => void;
}

function NoApiKeyCard({ environment, onAddKey }: NoApiKeyCardProps) {
  return (
    <Card className="p-6 border-orange-200 bg-orange-50">
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <div>
          <h3 className="text-lg font-semibold text-orange-800">
            未检测到 Google Maps API Key
          </h3>
          <p className="text-orange-700 mt-1">
            当前环境: {environment.displayName}
          </p>
        </div>

        <div className="text-left bg-white rounded-lg p-4 space-y-3">
          <p className="font-medium text-gray-900">您需要配置 API Key 才能使用地图功能：</p>
          
          {environment.runtime === 'LOCAL' ? (
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium text-gray-700">方式 1: 在 .env.local 文件中配置（推荐）</div>
                <div className="ml-4 text-gray-600">
                  ├─ 添加: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY
                </div>
                <div className="ml-4 text-gray-600">
                  └─ 重启开发服务器
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-700">方式 2: 在此处直接设置（临时测试用）</div>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <div className="font-medium text-gray-700">在 Vercel Dashboard 设置环境变量</div>
              <div className="ml-4 text-gray-600">
                ├─ 变量名: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </div>
              <div className="ml-4 text-gray-600">
                └─ 重新部署后生效
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-3">
          <Button onClick={onAddKey}>
            + 添加 API Key
          </Button>
          <Button variant="secondary">
            📖 查看配置教程
          </Button>
          <Button variant="secondary">
            🔑 获取 API Key
          </Button>
        </div>
      </div>
    </Card>
  );
}
