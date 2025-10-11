/**
 * Google Maps 加载 Hook
 * 使用 @googlemaps/js-api-loader 加载传统 2D 地图 API
 * 3D 地图会在需要时单独加载
 */

'use client';

import { useEffect, useState } from 'react';
import { GOOGLE_MAPS_LIBRARIES } from '@/shared/constants/map.constants';
import { useCurrentApiKey } from '@/client/src/lib/stores/api-key-store';
import { env } from '@/client/src/lib/env';

/**
 * 加载 Google Maps 脚本的选项
 */
interface LoadGoogleMapsScriptOptions {
  apiKey: string;
  libraries: readonly string[];
  onSuccess: () => void;
  onError: (error: Error) => void;
  maxRetries?: number; // 最大重试次数，默认为3
  retryDelay?: number; // 重试延迟时间（毫秒），默认为1000ms
  currentRetry?: number; // 当前重试次数（内部使用）
}

/**
 * 封装的 Google Maps 脚本加载函数（支持自动重试）
 * @param options 加载选项
 * @returns 脚本元素
 */
function loadGoogleMapsScript(options: LoadGoogleMapsScriptOptions): HTMLScriptElement {
  const { 
    apiKey, 
    libraries, 
    onSuccess, 
    onError,
    maxRetries = 3,
    retryDelay = 1000,
    currentRetry = 0,
  } = options;
  
  // 显示重试信息
  if (currentRetry > 0) {
    console.log(`🔄 [loadGoogleMapsScript] 第 ${currentRetry + 1}/${maxRetries} 次尝试...`);
  } else {
    console.log('📦 [loadGoogleMapsScript] 直接注入 Google Maps 脚本...');
  }
  console.log('🔑 [loadGoogleMapsScript] 使用 API Key:', apiKey.substring(0, 10) + '...');
  
  /**
   * 重试函数
   */
  const retryLoad = (error: Error) => {
    if (currentRetry < maxRetries - 1) {
      console.warn(`⚠️ [loadGoogleMapsScript] 加载失败，${retryDelay}ms 后重试...`);
      console.warn(`   失败原因:`, error.message);
      console.warn(`   剩余重试次数: ${maxRetries - currentRetry - 1}`);
      
      setTimeout(() => {
        // 移除失败的脚本
        const failedScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (failedScript) {
          failedScript.remove();
          console.log('🧹 [loadGoogleMapsScript] 已移除失败的脚本');
        }
        
        // 递归重试
        loadGoogleMapsScript({
          ...options,
          currentRetry: currentRetry + 1,
        });
      }, retryDelay);
    } else {
      console.error(`❌ [loadGoogleMapsScript] 已达到最大重试次数 (${maxRetries})，加载失败`);
      onError(error);
    }
  };
  
  // 创建脚本元素
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  
  // 构建 URL - 使用 v=beta 以支持 3D Maps
  const librariesParam = libraries.join(',');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=${librariesParam}`;
  
  console.log('🔗 [loadGoogleMapsScript] 加载脚本 (v=beta for 3D support):', script.src);
  
  // 添加加载成功监听器
  script.onload = () => {
    console.log('✅ [loadGoogleMapsScript] Google Maps 脚本加载成功');
    
    // 检查 Google Maps 对象是否可用
    if (window.google?.maps?.Map) {
      console.log('🌍 [loadGoogleMapsScript] window.google 可用:', !!window.google);
      console.log('🔍 [loadGoogleMapsScript] Google Maps 版本:', google.maps.version);
      console.log('📦 [loadGoogleMapsScript] google.maps.Map 可用:', !!google.maps.Map);
      onSuccess();
    } else {
      // 可能是域名限制问题，延迟检查
      setTimeout(() => {
        if (window.google?.maps?.Map) {
          console.log('✅ [loadGoogleMapsScript] Google Maps 延迟初始化成功');
          onSuccess();
        } else {
          console.error('🚫 [loadGoogleMapsScript] Google Maps 对象未初始化 - 可能是域名限制问题');
          console.error('💡 [loadGoogleMapsScript] 解决方案:');
          console.error('   1. 检查 API Key 的 HTTP referrer 设置');
          console.error('   2. 当前域名:', window.location.hostname);
          console.error('   3. 当前端口:', window.location.port || '默认端口');
          console.error('   4. 建议添加:', `${window.location.hostname}:${window.location.port || '3000'}/*`);
          
          const error = new Error('Google Maps 初始化失败 - 可能是域名限制问题');
          retryLoad(error);
        }
      }, 2000);
    }
  };
  
  // 添加加载失败监听器
  script.onerror = () => {
    console.error('❌ [loadGoogleMapsScript] Google Maps 脚本加载失败');
    const error = new Error('Google Maps 脚本加载失败。请检查网络连接或 API Key 配置。');
    retryLoad(error);
  };
  
  // 设置全局错误处理器，用于捕获 Google Maps API 错误
  (window as any).gm_authFailure = () => {
    console.error('❌ [loadGoogleMapsScript] Google Maps API 认证失败');
    console.error('🔍 [loadGoogleMapsScript] 可能的原因:');
    console.error('   1. API Key 无效或已过期 (ExpiredKeyMapError)');
    console.error('   2. 域名限制问题 (RefererNotAllowedMapError)');
    console.error('   3. API Key 格式错误 (InvalidKeyMapError)');
    console.error('   4. 配额超限 (QuotaExceededError)');
    console.error('💡 [loadGoogleMapsScript] 建议:');
    console.error('   - 检查 API Key 是否有效');
    console.error('   - 检查是否启用了账单');
    console.error('   - 检查域名限制设置');
    console.error('   - 使用设置页面的诊断工具');
    
    onError(new Error('Google Maps API 认证失败。API Key 可能无效、已过期，或存在域名限制问题。请使用设置页面的诊断工具检查。'));
  };
  
  // 添加到 head
  document.head.appendChild(script);
  
  return script;
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const currentApiKey = useCurrentApiKey();
  
  useEffect(() => {
    console.log('🔍 [useGoogleMaps] 开始加载 Google Maps (2D)');
    
    // 优先使用 API Key 管理器的配置，回退到环境变量
    const apiKey = currentApiKey || env.googleMapsApiKey();
    console.log('🔑 [useGoogleMaps] API Key 状态:', apiKey ? '✅ 已配置' : '❌ 未配置');
    console.log('🔑 [useGoogleMaps] API Key 来源:', 
      currentApiKey ? '🔑 API Key 管理器' : 
      env.googleMapsApiKey() ? '🌍 环境变量' : 
      '❌ 未配置'
    );
    
    if (!apiKey) {
      console.error('❌ [useGoogleMaps] Google Maps API Key 未配置');
      console.error('💡 [useGoogleMaps] 请检查:');
      console.error('   1. .env.local 文件中的 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
      console.error('   2. API Key 管理器的用户配置');
      console.error('   3. 访问 /settings 页面进行配置');
      setLoadError(new Error('Google Maps API Key is not configured'));
      return;
    }
    
    // 检查是否已经加载
    if (window.google?.maps?.Map) {
      console.log('✅ [useGoogleMaps] Google Maps 已加载');
      setIsLoaded(true);
      return;
    }
    
    // Since the page reloads on key change, we don't need to check for mismatched keys.
    // If a script exists, we just wait for it to load.
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      if (!window.google?.maps?.Map) {
        console.log('⏳ [useGoogleMaps] 等待现有脚本加载完成...');
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.Map) {
            console.log('✅ [useGoogleMaps] Google Maps 已加载（通过现有脚本）');
            setIsLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
      } else {
        console.log('✅ [useGoogleMaps] Google Maps 已加载（通过现有脚本）');
        setIsLoaded(true);
      }
      return;
    }
    
    // 使用封装的函数加载 Google Maps 脚本
    loadGoogleMapsScript({
      apiKey,
      libraries: GOOGLE_MAPS_LIBRARIES,
      onSuccess: () => setIsLoaded(true),
      onError: (error) => setLoadError(error),
    });
    
    // 清理函数
    return () => {
      // 注意：通常不建议移除 Google Maps 脚本，因为它可能被其他组件使用
      console.log('🧹 [useGoogleMaps] useEffect 清理');
    };
  }, [currentApiKey]);
  
  useEffect(() => {
    console.log('📊 [useGoogleMaps] 状态更新 - isLoaded:', isLoaded, 'loadError:', loadError);
  }, [isLoaded, loadError]);
  
  return { isLoaded, loadError };
}

