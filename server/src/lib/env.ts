/**
 * 服务端环境变量管理模块
 * 包含所有服务端变量，启动时强制校验必需变量
 */

// 环境变量接口
interface ServerEnvVars {
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
}

// 服务端环境变量访问器
export class ServerEnv {
  private static vars: ServerEnvVars = {};
  private static initialized = false;

  /**
   * 初始化环境变量
   */
  static init(): void {
    if (this.initialized) return;

    this.vars = {
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    this.initialized = true;

    // 开发环境输出诊断信息
    if (this.isDevelopment()) {
      this.logDiagnostics();
    }

    // 校验必需的环境变量
    const validation = this.validateRequired();
    if (!validation.valid) {
      console.error('❌ [ServerEnv] 缺少必需的环境变量:', validation.missing);
      // 在生产环境中，缺少必需变量应该抛出错误
      if (this.isProduction()) {
        throw new Error(`Missing required environment variables: ${validation.missing.join(', ')}`);
      }
    }
  }

  /**
   * 获取数据库 URL
   */
  static getDatabaseUrl(): string | undefined {
    this.init();
    return this.vars.DATABASE_URL;
  }

  /**
   * 获取直连数据库 URL
   */
  static getDirectUrl(): string | undefined {
    this.init();
    return this.vars.DIRECT_URL;
  }

  /**
   * 检查是否在开发环境
   */
  static isDevelopment(): boolean {
    this.init();
    return this.vars.NODE_ENV === 'development';
  }

  /**
   * 检查是否在生产环境
   */
  static isProduction(): boolean {
    this.init();
    return this.vars.NODE_ENV === 'production';
  }

  /**
   * 检查是否在 Vercel 环境
   */
  static isVercel(): boolean {
    this.init();
    return this.vars.VERCEL === '1';
  }

  /**
   * 获取 Vercel 环境类型
   */
  static getVercelEnv(): string | undefined {
    this.init();
    return this.vars.VERCEL_ENV;
  }

  /**
   * 获取所有环境变量
   */
  static getAll(): ServerEnvVars {
    this.init();
    return { ...this.vars };
  }

  /**
   * 检查必需的环境变量
   */
  static validateRequired(): { valid: boolean; missing: string[] } {
    this.init();
    
    const required = ['DATABASE_URL'];
    const missing = required.filter(key => !this.vars[key as keyof ServerEnvVars]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * 输出诊断信息（仅开发环境）
   */
  private static logDiagnostics(): void {
    console.group('🔧 [ServerEnv] 服务端环境变量诊断');
    console.log('🌍 NODE_ENV:', this.vars.NODE_ENV);
    console.log('☁️ VERCEL:', this.isVercel() ? '✅ 是' : '❌ 否');
    
    if (this.isVercel()) {
      console.log('🔧 VERCEL_ENV:', this.getVercelEnv());
    }
    
    console.log('🗄️ DATABASE_URL:', this.vars.DATABASE_URL ? '✅ 已配置' : '❌ 未配置');
    console.log('🔗 DIRECT_URL:', this.vars.DIRECT_URL ? '✅ 已配置' : '❌ 未配置');
    
    const validation = this.validateRequired();
    if (!validation.valid) {
      console.warn('⚠️ 缺少必需的环境变量:', validation.missing);
    }
    
    console.groupEnd();
  }
}

// 导出便捷函数
export const serverEnv = {
  // 环境检测
  isDev: () => ServerEnv.isDevelopment(),
  isProd: () => ServerEnv.isProduction(),
  isVercel: () => ServerEnv.isVercel(),
  vercelEnv: () => ServerEnv.getVercelEnv(),
  
  // 环境变量访问
  databaseUrl: () => ServerEnv.getDatabaseUrl(),
  directUrl: () => ServerEnv.getDirectUrl(),
  all: () => ServerEnv.getAll(),
  validate: () => ServerEnv.validateRequired(),
};

// 自动初始化
ServerEnv.init();
