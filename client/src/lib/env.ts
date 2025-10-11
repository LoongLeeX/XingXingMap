/**
 * 客户端环境变量管理模块
 * 只包含 NEXT_PUBLIC_ 前缀的变量，提供类型安全访问
 */

'use client';

// 环境检测类型
export type RuntimeEnvironment = 'LOCAL' | 'VERCEL';
export type VercelEnvironment = 'production' | 'preview' | 'development';

// 环境变量接口
interface ClientEnvVars {
  GOOGLE_MAPS_API_KEY?: string;
  GOOGLE_MAPS_MAP_ID?: string;
}

// 环境检测工具
export class EnvironmentDetector {
  /**
   * 检测当前运行环境
   */
  static detectRuntime(): RuntimeEnvironment {
    // 检查 Vercel 特定的环境标识
    if (typeof window !== 'undefined') {
      // 客户端检测
      return (window as any).__VERCEL__ || process.env.NEXT_PUBLIC_VERCEL_ENV ? 'VERCEL' : 'LOCAL';
    }
    
    // 服务端检测
    return process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL_ENV ? 'VERCEL' : 'LOCAL';
  }

  /**
   * 获取 Vercel 环境类型
   */
  static getVercelEnvironment(): VercelEnvironment | null {
    const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
    if (vercelEnv && ['production', 'preview', 'development'].includes(vercelEnv)) {
      return vercelEnv as VercelEnvironment;
    }
    return null;
  }

  /**
   * 检查是否在开发环境
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * 获取环境显示名称
   */
  static getEnvironmentDisplayName(): string {
    const runtime = this.detectRuntime();
    
    if (runtime === 'LOCAL') {
      return '💻 本地开发环境';
    }
    
    const vercelEnv = this.getVercelEnvironment();
    switch (vercelEnv) {
      case 'production':
        return '☁️ Vercel 生产环境';
      case 'preview':
        return '☁️ Vercel 预览环境';
      case 'development':
        return '☁️ Vercel 开发环境';
      default:
        return '☁️ Vercel 环境';
    }
  }
}

// 环境变量访问器
export class ClientEnv {
  private static vars: ClientEnvVars = {};
  private static initialized = false;

  /**
   * 初始化环境变量
   */
  static init(): void {
    if (this.initialized) return;

    this.vars = {
      GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      GOOGLE_MAPS_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
    };

    this.initialized = true;

    // 开发环境输出诊断信息
    if (EnvironmentDetector.isDevelopment()) {
      this.logDiagnostics();
    }
  }

  /**
   * 获取 Google Maps API Key
   */
  static getGoogleMapsApiKey(): string | undefined {
    this.init();
    return this.vars.GOOGLE_MAPS_API_KEY;
  }

  /**
   * 获取 Google Maps Map ID
   */
  static getGoogleMapsMapId(): string | undefined {
    this.init();
    return this.vars.GOOGLE_MAPS_MAP_ID;
  }

  /**
   * 获取所有环境变量
   */
  static getAll(): ClientEnvVars {
    this.init();
    return { ...this.vars };
  }

  /**
   * 检查必需的环境变量
   */
  static validateRequired(): { valid: boolean; missing: string[] } {
    this.init();
    
    const required = ['GOOGLE_MAPS_API_KEY'];
    const missing = required.filter(key => !this.vars[key as keyof ClientEnvVars]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * 输出诊断信息（仅开发环境）
   */
  private static logDiagnostics(): void {
    const runtime = EnvironmentDetector.detectRuntime();
    const envName = EnvironmentDetector.getEnvironmentDisplayName();
    
    console.group('🔧 [ClientEnv] 环境变量诊断');
    console.log('🌍 运行环境:', runtime);
    console.log('📍 环境名称:', envName);
    
    if (runtime === 'VERCEL') {
      console.log('☁️ Vercel 环境类型:', EnvironmentDetector.getVercelEnvironment());
    }
    
    console.log('🔑 Google Maps API Key:', this.vars.GOOGLE_MAPS_API_KEY ? '✅ 已配置' : '❌ 未配置');
    console.log('🗺️ Google Maps Map ID:', this.vars.GOOGLE_MAPS_MAP_ID ? '✅ 已配置' : '❌ 未配置');
    
    const validation = this.validateRequired();
    if (!validation.valid) {
      console.warn('⚠️ 缺少必需的环境变量:', validation.missing);
    }
    
    console.groupEnd();
  }
}

// 导出便捷函数
export const env = {
  // 环境检测
  runtime: () => EnvironmentDetector.detectRuntime(),
  vercelEnv: () => EnvironmentDetector.getVercelEnvironment(),
  isDev: () => EnvironmentDetector.isDevelopment(),
  displayName: () => EnvironmentDetector.getEnvironmentDisplayName(),
  
  // 环境变量访问
  googleMapsApiKey: () => ClientEnv.getGoogleMapsApiKey(),
  googleMapsMapId: () => ClientEnv.getGoogleMapsMapId(),
  all: () => ClientEnv.getAll(),
  validate: () => ClientEnv.validateRequired(),
};

// 自动初始化
if (typeof window !== 'undefined') {
  ClientEnv.init();
}
