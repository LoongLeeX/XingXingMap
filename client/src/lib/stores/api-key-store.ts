/**
 * API Key 状态管理 Store (Zustand)
 * 提供响应式的 API Key 状态管理
 */

'use client';

import React from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { apiKeyManager, ApiKeyManager, type ApiKeyState, type ApiKeyConfig } from '../api-key-manager';

// Store 接口
interface ApiKeyStore extends ApiKeyState {
  // 操作方法
  actions: {
    // 基础操作
    refresh: () => Promise<void>;
    setUserApiKey: (apiKey: string) => Promise<void>;
    removeUserApiKey: () => Promise<void>;
    validateCurrentKey: () => Promise<boolean>;
    validateSpecificKey: (apiKey: string) => Promise<boolean>;
    
    // 状态查询
    getCurrentApiKey: () => string | null;
    hasUserConfig: () => boolean;
    hasEnvConfig: () => boolean;
    isUsingUserConfig: () => boolean;
    isUsingEnvConfig: () => boolean;
    
    // 显示辅助
    getDisplayKey: (apiKey?: string) => string;
    getSourceDisplayText: (config: ApiKeyConfig) => string;
    getValidationStatusInfo: (config: ApiKeyConfig) => { text: string; icon: string; color: string };
  };
}

// Get the initial state directly from the manager to prevent race conditions
const initialState = apiKeyManager.getState();

// 创建 Store
export const useApiKeyStore = create<ApiKeyStore>()(
  subscribeWithSelector((set, get) => ({
    // Use the synchronous initial state from the manager
    ...initialState,

    // 操作方法
    actions: {
      // 刷新状态
      refresh: async () => {
        try {
          await apiKeyManager.refresh();
        } catch (error) {
          console.error('❌ [ApiKeyStore] 刷新失败:', error);
        }
      },

      // 设置用户自定义 API Key
      setUserApiKey: async (apiKey: string) => {
        try {
          await apiKeyManager.setUserApiKey(apiKey);
        } catch (error) {
          console.error('❌ [ApiKeyStore] 设置用户 API Key 失败:', error);
          throw error;
        }
      },

      // 删除用户自定义 API Key
      removeUserApiKey: async () => {
        try {
          await apiKeyManager.removeUserApiKey();
        } catch (error) {
          console.error('❌ [ApiKeyStore] 删除用户 API Key 失败:', error);
          throw error;
        }
      },

      // 验证当前 API Key
      validateCurrentKey: async () => {
        try {
          return await apiKeyManager.validateApiKey();
        } catch (error) {
          console.error('❌ [ApiKeyStore] 验证当前 API Key 失败:', error);
          return false;
        }
      },

      // 验证指定 API Key
      validateSpecificKey: async (apiKey: string) => {
        try {
          return await apiKeyManager.validateApiKey(apiKey);
        } catch (error) {
          console.error('❌ [ApiKeyStore] 验证指定 API Key 失败:', error);
          return false;
        }
      },

      // 获取当前生效的 API Key
      getCurrentApiKey: () => {
        return apiKeyManager.getCurrentApiKey();
      },

      // 检查是否有用户配置
      hasUserConfig: () => {
        const state = get();
        return !!state.userConfig;
      },

      // 检查是否有环境配置
      hasEnvConfig: () => {
        const state = get();
        return !!state.envConfig;
      },

      // 检查是否正在使用用户配置
      isUsingUserConfig: () => {
        const state = get();
        return state.currentConfig?.source === 'USER_CUSTOM';
      },

      // 检查是否正在使用环境配置
      isUsingEnvConfig: () => {
        const state = get();
        return state.currentConfig?.source === 'ENV';
      },

      // 获取 API Key 的显示文本
      getDisplayKey: (apiKey?: string) => {
        const keyToDisplay = apiKey || get().actions.getCurrentApiKey();
        if (!keyToDisplay) return '';
        return ApiKeyManager.getDisplayKey(keyToDisplay);
      },

      // 获取配置来源的显示文本
      getSourceDisplayText: (config: ApiKeyConfig) => {
        const state = get();
        return ApiKeyManager.getSourceDisplayText(config.source, state.environment.runtime);
      },

      // 获取验证状态信息
      getValidationStatusInfo: (config: ApiKeyConfig) => {
        return ApiKeyManager.getValidationStatusText(config.validationStatus);
      },
    },
  }))
);

// 订阅 ApiKeyManager 的状态变化
let unsubscribe: (() => void) | null = null;

// 初始化订阅
export const initializeApiKeyStore = () => {
  if (unsubscribe) {
    return; // 已经初始化
  }

  unsubscribe = apiKeyManager.subscribe((state: ApiKeyState) => {
    useApiKeyStore.setState({
      currentConfig: state.currentConfig,
      envConfig: state.envConfig,
      userConfig: state.userConfig,
      environment: state.environment,
      isLoading: state.isLoading,
      error: state.error,
    });
  });

  console.log('✅ [ApiKeyStore] 已初始化并订阅 ApiKeyManager');
};

// 清理订阅
export const cleanupApiKeyStore = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    console.log('🧹 [ApiKeyStore] 已清理订阅');
  }
};

// 选择器 Hooks
export const useCurrentApiKey = () => {
  return useApiKeyStore((state) => state.currentConfig?.key || null);
};

export const useApiKeyStatus = () => {
  return useApiKeyStore((state) => ({
    hasConfig: !!state.currentConfig,
    isValid: state.currentConfig?.validationStatus === 'valid',
    isValidating: state.currentConfig?.validationStatus === 'validating',
    hasError: !!state.error || state.currentConfig?.validationStatus === 'error',
    source: state.currentConfig?.source,
  }));
};

export const useEnvironmentInfo = () => {
  return useApiKeyStore((state) => state.environment);
};

export const useApiKeyConfigs = () => {
  return useApiKeyStore((state) => ({
    current: state.currentConfig,
    env: state.envConfig,
    user: state.userConfig,
  }));
};

export const useApiKeyActions = () => {
  return useApiKeyStore((state) => state.actions);
};

export const useApiKeyLoading = () => {
  return useApiKeyStore((state) => state.isLoading);
};

export const useApiKeyError = () => {
  return useApiKeyStore((state) => state.error);
};

// 自动初始化（仅在客户端）
if (typeof window !== 'undefined') {
  initializeApiKeyStore();
}
