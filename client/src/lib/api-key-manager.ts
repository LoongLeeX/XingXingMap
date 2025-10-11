/**
 * API Key 管理器核心模块
 * 负责所有 API Key 相关的操作和状态管理
 */

'use client';

import { env, EnvironmentDetector } from './env';

// API Key 配置来源类型
export type ApiKeySource = 'ENV' | 'USER_CUSTOM';

// API Key 验证状态
export type ValidationStatus = 'valid' | 'invalid' | 'untested' | 'validating' | 'error';

// API Key 验证检查项
export interface ValidationCheck {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

// API Key 验证结果
export interface ApiKeyValidationResult {
  isValid: boolean;
  overallStatus: ValidationStatus;
  message: string;
  checks: ValidationCheck[];
}

// API Key 配置接口
export interface ApiKeyConfig {
  source: ApiKeySource;
  key: string;
  isActive: boolean;
  validationStatus: ValidationStatus;
  configuredAt?: Date;
  lastValidatedAt?: Date;
  error?: string;
  validationResult?: ApiKeyValidationResult;
}

// API Key 状态接口
export interface ApiKeyState {
  currentConfig: ApiKeyConfig | null;
  envConfig: ApiKeyConfig | null;
  userConfig: ApiKeyConfig | null;
  environment: {
    runtime: 'LOCAL' | 'VERCEL';
    displayName: string;
    vercelEnv?: string;
  };
  isLoading: boolean;
  error?: string;
}

// localStorage 键名
const STORAGE_KEY = 'google_maps_api_key_user_config';

// API Key 管理器类
export class ApiKeyManager {
  private static instance: ApiKeyManager | null = null;
  private listeners: Set<(state: ApiKeyState) => void> = new Set();
  private currentState: ApiKeyState;

  private constructor() {
    this.currentState = this.initializeState();
    this.loadConfigurations();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ApiKeyManager {
    if (!this.instance) {
      this.instance = new ApiKeyManager();
    }
    return this.instance;
  }

  /**
   * 初始化状态
   */
  private initializeState(): ApiKeyState {
    const runtime = EnvironmentDetector.detectRuntime();
    
    return {
      currentConfig: null,
      envConfig: null,
      userConfig: null,
      environment: {
        runtime,
        displayName: EnvironmentDetector.getEnvironmentDisplayName(),
        vercelEnv: EnvironmentDetector.getVercelEnvironment() || undefined,
      },
      isLoading: true,
      error: undefined,
    };
  }

  /**
   * 加载所有配置
   */
  private loadConfigurations(): void {
    try {
      // 加载环境变量配置
      this.loadEnvConfig();
      
      // 加载用户自定义配置
      this.loadUserConfig();
      
      // 确定当前生效的配置
      this.determineActiveConfig();
      
      this.updateState({ isLoading: false });
    } catch (error) {
      console.error('❌ [ApiKeyManager] 加载配置失败:', error);
      this.updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : '加载配置失败' 
      });
    }
  }

  /**
   * 加载环境变量配置
   */
  private loadEnvConfig(): void {
    const envKey = env.googleMapsApiKey();
    
    if (envKey) {
      const envConfig: ApiKeyConfig = {
        source: 'ENV',
        key: envKey,
        isActive: false, // 稍后确定
        validationStatus: 'untested',
      };
      
      this.updateState({ envConfig });
    }
  }

  /**
   * 加载用户自定义配置
   */
  private loadUserConfig(): void {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      console.log('ℹ️ [ApiKeyManager] 服务器端环境，跳过 localStorage 访问');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        const userConfig: ApiKeyConfig = {
          source: 'USER_CUSTOM',
          key: data.key,
          isActive: false, // 稍后确定
          validationStatus: data.validationStatus || 'untested',
          configuredAt: data.configuredAt ? new Date(data.configuredAt) : undefined,
          lastValidatedAt: data.lastValidatedAt ? new Date(data.lastValidatedAt) : undefined,
          error: data.error,
        };
        
        this.updateState({ userConfig });
      }
    } catch (error) {
      console.error('❌ [ApiKeyManager] 加载用户配置失败:', error);
    }
  }

  /**
   * 确定当前生效的配置
   * 优先级：用户自定义 > 环境变量
   */
  private determineActiveConfig(): void {
    const { userConfig, envConfig } = this.currentState;
    
    let currentConfig: ApiKeyConfig | null = null;
    
    if (userConfig) {
      currentConfig = { ...userConfig, isActive: true };
    } else if (envConfig) {
      currentConfig = { ...envConfig, isActive: true };
    }
    
    this.updateState({ currentConfig });
  }

  /**
   * 更新状态并通知监听器
   */
  private updateState(updates: Partial<ApiKeyState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.notifyListeners();
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('❌ [ApiKeyManager] 监听器错误:', error);
      }
    });
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: ApiKeyState) => void): () => void {
    this.listeners.add(listener);
    
    // 立即调用一次，提供当前状态
    listener(this.currentState);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 获取当前状态
   */
  getState(): ApiKeyState {
    return { ...this.currentState };
  }

  /**
   * 获取当前生效的 API Key
   */
  getCurrentApiKey(): string | null {
    return this.currentState.currentConfig?.key || null;
  }

  /**
   * 设置用户自定义 API Key
   */
  async setUserApiKey(apiKey: string): Promise<void> {
    const oldApiKey = this.getCurrentApiKey(); // 在更新前获取旧 Key
    try {
      this.updateState({ isLoading: true, error: undefined });
      
      // 基本格式验证
      if (!this.isValidApiKeyFormat(apiKey)) {
        throw new Error('API Key 格式无效');
      }
      
      const userConfig: ApiKeyConfig = {
        source: 'USER_CUSTOM',
        key: apiKey,
        isActive: true,
        validationStatus: 'untested',
        configuredAt: new Date(),
      };
      
      // 保存到 localStorage（仅在客户端）
      if (typeof window !== 'undefined') {
        const storageData = {
          key: apiKey,
          validationStatus: 'untested',
          configuredAt: userConfig.configuredAt?.toISOString(),
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      }
      
      // 清理现有的Google Maps脚本（如果存在且API Key不同）
      if (typeof window !== 'undefined') {
        this.cleanupExistingScripts(apiKey);
      }
      
      // 更新状态
      this.updateState({
        userConfig,
        currentConfig: userConfig,
        isLoading: false,
      });
      
      console.log('✅ [ApiKeyManager] 用户自定义 API Key 已设置');
      
      // 如果 API Key 发生变化，则重新加载页面以应用更改
      if (typeof window !== 'undefined' && oldApiKey !== apiKey) {
        console.log('🔄 [ApiKeyManager] API Key 已更改，准备重新加载页面...');
        // 延迟以便用户可以看到提示信息
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ [ApiKeyManager] 设置用户 API Key 失败:', error);
      this.updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : '设置失败' 
      });
      throw error;
    }
  }

  /**
   * 清理现有的Google Maps脚本
   */
  private cleanupExistingScripts(newApiKey: string): void {
    try {
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      
      if (existingScripts.length === 0) {
        console.log('ℹ️ [ApiKeyManager] 没有找到现有的Google Maps脚本');
        return;
      }

      let needsCleanup = false;
      
      existingScripts.forEach(script => {
        const src = script.getAttribute('src') || '';
        const keyMatch = src.match(/key=([^&]+)/);
        const existingKey = keyMatch ? keyMatch[1] : null;
        
        if (existingKey && existingKey !== newApiKey) {
          console.log('🧹 [ApiKeyManager] 发现不匹配的脚本，准备清理');
          console.log(`   现有Key: ${existingKey.substring(0, 10)}...`);
          console.log(`   新Key: ${newApiKey.substring(0, 10)}...`);
          needsCleanup = true;
        }
      });

      if (needsCleanup) {
        // 移除所有Google Maps脚本
        existingScripts.forEach(script => {
          console.log('🗑️ [ApiKeyManager] 移除脚本:', script.getAttribute('src'));
          script.remove();
        });
        
        // 清理window.google对象
        if ((window as any).google) {
          console.log('🧹 [ApiKeyManager] 清理window.google对象');
          delete (window as any).google;
        }
        
        console.log(`✅ [ApiKeyManager] 已清理 ${existingScripts.length} 个Google Maps脚本`);
      } else {
        console.log('ℹ️ [ApiKeyManager] API Key相同，无需清理脚本');
      }
      
    } catch (error) {
      console.error('❌ [ApiKeyManager] 清理脚本失败:', error);
    }
  }

  /**
   * 删除用户自定义 API Key
   */
  async removeUserApiKey(): Promise<void> {
    const oldApiKey = this.getCurrentApiKey(); // 在更新前获取旧 Key
    try {
      this.updateState({ isLoading: true, error: undefined });
      
      // 从 localStorage 删除（仅在客户端）
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        
        // 清理现有脚本，因为要回退到环境变量
        const envKey = this.currentState.envConfig?.key;
        if (envKey) {
          this.cleanupExistingScripts(envKey);
        }
      }
      
      // 更新状态，回退到环境配置
      this.updateState({
        userConfig: null,
        isLoading: false,
      });
      
      // 重新确定生效配置
      this.determineActiveConfig();
      const newApiKey = this.getCurrentApiKey();
      
      console.log('✅ [ApiKeyManager] 用户自定义 API Key 已删除，回退到环境配置');
      
      // 如果生效的 API Key 发生变化，则重新加载页面
      if (typeof window !== 'undefined' && oldApiKey !== newApiKey) {
        console.log('🔄 [ApiKeyManager] API Key 已更改，准备重新加载页面...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ [ApiKeyManager] 删除用户 API Key 失败:', error);
      this.updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : '删除失败' 
      });
      throw error;
    }
  }

  /**
   * 验证 API Key 有效性
   */
  async validateApiKey(apiKey?: string): Promise<boolean> {
    const keyToValidate = apiKey || this.getCurrentApiKey();
    
    if (!keyToValidate) {
      throw new Error('没有可验证的 API Key');
    }
    
    try {
      // 更新验证状态
      this.updateState({ isLoading: true, error: undefined });
      
      // 执行 API 验证
      const validationResult = await this.performApiValidation(keyToValidate);
      this.updateValidationStatus(keyToValidate, validationResult.overallStatus, validationResult);
      
      return validationResult.isValid;
      
    } catch (error) {
      console.error('❌ [ApiKeyManager] API Key 验证失败:', error);
      this.updateState({ isLoading: false }); // Ensure loading is set to false on error
      this.updateValidationStatus(
        keyToValidate, 
        'error', 
        { 
          isValid: false, 
          overallStatus: 'error', 
          message: error instanceof Error ? error.message : '验证失败', 
          checks: [] 
        }
      );
      return false;
    }
  }

  /**
   * 更新指定 API Key 的验证状态
   */
  private updateValidationStatus(apiKey: string, status: ValidationStatus, result?: ApiKeyValidationResult): void {
    const { currentConfig, userConfig, envConfig } = this.currentState;
    
    const updates: Partial<ApiKeyState> = {};
    
    // 更新对应的配置状态
    if (currentConfig?.key === apiKey) {
      updates.currentConfig = {
        ...currentConfig,
        validationStatus: status,
        lastValidatedAt: new Date(),
        error: status === 'error' ? result?.message : undefined,
        validationResult: result,
      };
    }
    
    if (userConfig?.key === apiKey) {
      const updatedUserConfig = {
        ...userConfig,
        validationStatus: status,
        lastValidatedAt: new Date(),
        error: status === 'error' ? result?.message : undefined,
        validationResult: result,
      };
      
      updates.userConfig = updatedUserConfig;
      
      // 同步到 localStorage（仅在客户端）
      if (typeof window !== 'undefined') {
        try {
          const storageData = {
            key: userConfig.key,
            validationStatus: status,
            configuredAt: userConfig.configuredAt?.toISOString(),
            lastValidatedAt: updatedUserConfig.lastValidatedAt?.toISOString(),
            error: updatedUserConfig.error,
            validationResult: result,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
        } catch (e) {
          console.error('❌ [ApiKeyManager] 保存验证状态失败:', e);
        }
      }
    }
    
    if (envConfig?.key === apiKey) {
      updates.envConfig = {
        ...envConfig,
        validationStatus: status,
        lastValidatedAt: new Date(),
        error: status === 'error' ? result?.message : undefined,
        validationResult: result,
      };
    }
    
    this.updateState(updates);
  }

  /**
   * 执行 API 验证 - 改进的验证方法
   */
  private async performApiValidation(apiKey: string): Promise<ApiKeyValidationResult> {
    console.log('🔍 [ApiKeyManager] 开始全面 API Key 验证...');
    const checks: ValidationCheck[] = [];
    let overallSuccess = true;
    let finalMessage = '所有关键 API 验证成功。';

    // 1. Geocoding API Check
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=${apiKey}`);
      const data = await response.json();
      const check: ValidationCheck = {
        name: 'Geocoding API',
        status: data.status === 'OK' || data.status === 'ZERO_RESULTS' ? 'success' : 'error',
        message: `API 返回状态: ${data.status}`,
        details: data.error_message || '',
      };
      checks.push(check);
      if (check.status === 'error') {
        overallSuccess = false;
        if (data.status === 'REQUEST_DENIED') {
          finalMessage = 'Geocoding API 请求被拒绝。请检查 API 是否已启用或是否存在结算问题。';
        }
      }
    } catch (error) {
      checks.push({ name: 'Geocoding API', status: 'error', message: '网络请求失败', details: error instanceof Error ? error.message : String(error) });
      overallSuccess = false;
      finalMessage = 'Geocoding API 请求失败，请检查网络连接。';
    }

    // 2. Places API Check
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.714224,-73.961452&radius=100&key=${apiKey}`);
      const data = await response.json();
      const check: ValidationCheck = {
        name: 'Places API',
        status: data.status === 'OK' || data.status === 'ZERO_RESULTS' ? 'success' : 'warning', // Places API 不是必须的，所以设为 warning
        message: `API 返回状态: ${data.status}`,
        details: data.error_message || '',
      };
      checks.push(check);
      // Not affecting overallSuccess as it's optional
    } catch (error) {
      checks.push({ name: 'Places API', status: 'warning', message: '网络请求失败', details: error instanceof Error ? error.message : String(error) });
    }
    
    // 3. Maps JavaScript API Check (via script loading)
    try {
      const result = await this.testMapsJavaScriptApi(apiKey);
      const check: ValidationCheck = {
        name: 'Maps JavaScript API',
        status: result.success ? 'success' : 'error',
        message: result.success ? '脚本加载成功' : '脚本加载失败',
        details: result.error || '',
      };
      checks.push(check);
      if (!result.success) {
        overallSuccess = false;
        finalMessage = 'Maps JavaScript API 脚本加载失败。这通常是由于域名限制或密钥本身无效。';
      }
    } catch (error) {
      checks.push({ name: 'Maps JavaScript API', status: 'error', message: '测试执行异常', details: error instanceof Error ? error.message : String(error) });
      overallSuccess = false;
    }

    console.log(`%c[ApiKeyManager] 验证完成。结果: ${overallSuccess ? '成功' : '失败'}`, `color: ${overallSuccess ? 'green' : 'red'}`);

    return {
      isValid: overallSuccess,
      overallStatus: overallSuccess ? 'valid' : 'invalid',
      message: finalMessage,
      checks,
    };
  }

  /**
   * 测试 Maps JavaScript API
   */
  private async testMapsJavaScriptApi(apiKey: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      // 检查是否已经加载了 Google Maps
      if ((window as any).google?.maps) {
        resolve({ success: true });
        return;
      }

      // 创建测试脚本
      const testScript = document.createElement('script');
      const callbackName = `__apiKeyTest_${Date.now()}`;
      
      // 设置回调函数
      (window as any)[callbackName] = () => {
        cleanup();
        resolve({ success: true });
      };
      
      // 设置错误处理
      testScript.onerror = () => {
        cleanup();
        resolve({ success: false, error: 'Script loading failed' });
      };
      
      // 设置超时
      const timeout = setTimeout(() => {
        cleanup();
        resolve({ success: false, error: 'Timeout' });
      }, 10000);
      
      const cleanup = () => {
        clearTimeout(timeout);
        if (testScript.parentNode) {
          testScript.parentNode.removeChild(testScript);
        }
        delete (window as any)[callbackName];
      };
      
      // 加载脚本
      testScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
      document.head.appendChild(testScript);
    });
  }

  /**
   * 检查 API Key 格式是否有效
   */
  private isValidApiKeyFormat(apiKey: string): boolean {
    // Google Maps API Key 通常以 "AIza" 开头，长度约 39 字符
    return /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);
  }

  /**
   * 刷新所有配置
   */
  async refresh(): Promise<void> {
    this.updateState({ isLoading: true, error: undefined });
    this.loadConfigurations();
  }

  /**
   * 获取 API Key 的显示文本（部分隐藏）
   */
  static getDisplayKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return apiKey;
    }
    
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 3)}`;
  }

  /**
   * 获取配置来源的显示文本
   */
  static getSourceDisplayText(source: ApiKeySource, runtime: 'LOCAL' | 'VERCEL'): string {
    switch (source) {
      case 'USER_CUSTOM':
        return '👤 用户自定义';
      case 'ENV':
        return runtime === 'LOCAL' ? '💻 本地环境变量' : '☁️ Vercel 环境变量';
      default:
        return '未知来源';
    }
  }

  /**
   * 获取验证状态的显示文本
   */
  static getValidationStatusText(status: ValidationStatus): { text: string; icon: string; color: string } {
    switch (status) {
      case 'valid':
        return { text: '有效', icon: '✅', color: 'text-green-600' };
      case 'invalid':
        return { text: '无效或已过期', icon: '❌', color: 'text-red-600' };
      case 'validating':
        return { text: '验证中', icon: '⏳', color: 'text-blue-600' };
      case 'error':
        return { text: '验证错误', icon: '⚠️', color: 'text-orange-600' };
      case 'untested':
      default:
        return { text: '未测试', icon: '❓', color: 'text-gray-600' };
    }
  }
}

// 导出单例实例
export const apiKeyManager = ApiKeyManager.getInstance();
