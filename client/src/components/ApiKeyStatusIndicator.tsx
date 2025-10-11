/**
 * API Key 状态指示器
 * 显示当前 API Key 的状态和快速操作
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { toast } from './ui/Toast';
import { 
  useApiKeyConfigs, 
  useEnvironmentInfo, 
  useApiKeyActions, 
  useApiKeyStatus,
  useApiKeyError 
} from '../lib/stores/api-key-store';

interface Props {
  compact?: boolean;
  showActions?: boolean;
}

export function ApiKeyStatusIndicator({ compact = false, showActions = true }: Props) {
  const [isValidating, setIsValidating] = useState(false);

  const configs = useApiKeyConfigs();
  const environment = useEnvironmentInfo();
  const actions = useApiKeyActions();
  const status = useApiKeyStatus();
  const error = useApiKeyError();

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleQuickValidate = async () => {
    setIsValidating(true);
    try {
      const isValid = await actions.validateCurrentKey();
      showToast(
        isValid ? 'API Key 验证成功 ✅' : 'API Key 无效 ❌',
        isValid ? 'success' : 'error'
      );
    } catch (error) {
      showToast('验证失败', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // 获取状态显示信息
  const getStatusInfo = () => {
    if (error) {
      return {
        icon: '❌',
        text: '配置错误',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    if (!status.hasConfig) {
      return {
        icon: '⚠️',
        text: '未配置',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }

    if (status.isValidating) {
      return {
        icon: '⏳',
        text: '验证中',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    if (status.isValid) {
      return {
        icon: '✅',
        text: '正常',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    if (status.hasError) {
      return {
        icon: '❌',
        text: '无效',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    return {
      icon: '❓',
      text: '未测试',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const statusInfo = getStatusInfo();

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${statusInfo.color} ${statusInfo.bgColor}`}>
          <span>{statusInfo.icon}</span>
          <span>{statusInfo.text}</span>
        </div>
        {showActions && (
          <Link href="/settings">
            <Button size="sm" variant="secondary">
              设置
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{statusInfo.icon}</span>
          <div>
            <div className={`font-medium ${statusInfo.color}`}>
              API Key 状态: {statusInfo.text}
            </div>
            <div className="text-sm text-gray-600">
              环境: {environment.displayName}
            </div>
            {configs.current && (
              <div className="text-sm text-gray-600">
                来源: {actions.getSourceDisplayText(configs.current)}
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {configs.current && (
              <Button
                size="sm"
                onClick={handleQuickValidate}
                disabled={isValidating}
              >
                {isValidating ? '验证中...' : '快速验证'}
              </Button>
            )}
            <Link href="/settings">
              <Button size="sm" variant="secondary">
                管理设置
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-700">
          错误: {error}
        </div>
      )}

      {configs.current?.error && (
        <div className="mt-3 text-sm text-red-700">
          验证错误: {configs.current.error}
        </div>
      )}

    </div>
  );
}
