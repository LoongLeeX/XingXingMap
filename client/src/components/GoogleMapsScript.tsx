/**
 * Google Maps 脚本动态加载组件
 * 根据当前 API Key 配置动态加载 Google Maps 脚本
 */

'use client';

import { useEffect } from 'react';
import { useCurrentApiKey } from '../lib/stores/api-key-store';
import { env } from '../lib/env';

export function GoogleMapsScript() {
  const currentApiKey = useCurrentApiKey();

  useEffect(() => {
    // 获取当前生效的 API Key（优先使用 API Key 管理器的配置）
    const apiKey = currentApiKey || env.googleMapsApiKey();
    
    if (!apiKey) {
      console.warn('⚠️ [GoogleMapsScript] 没有可用的 API Key，跳过脚本加载');
      return;
    }

    // 检查是否已经加载了脚本
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('ℹ️ [GoogleMapsScript] Google Maps 脚本已存在，跳过重复加载');
      return;
    }

    console.log('📦 [GoogleMapsScript] 动态加载 Google Maps 脚本...');
    console.log('🔑 [GoogleMapsScript] 使用 API Key:', apiKey.substring(0, 10) + '...');

    // 创建脚本元素
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=alpha&libraries=maps3d,places`;
    
    // 添加加载事件监听
    script.onload = () => {
      console.log('✅ [GoogleMapsScript] Google Maps 脚本加载成功');
      
      // 检查是否有域名限制错误
      setTimeout(() => {
        if (!(window as any).google?.maps) {
          console.error('🚫 [GoogleMapsScript] Google Maps 对象未初始化 - 可能是域名限制问题');
          console.error('💡 [GoogleMapsScript] 解决方案:');
          console.error('   1. 检查 API Key 的 HTTP referrer 设置');
          console.error('   2. 当前域名:', window.location.hostname);
          console.error('   3. 当前端口:', window.location.port || '默认端口');
          console.error('   4. 建议添加:', `${window.location.hostname}:${window.location.port || '3000'}/*`);
        }
      }, 1000);
    };
    
    script.onerror = (error) => {
      console.error('❌ [GoogleMapsScript] Google Maps 脚本加载失败:', error);
      console.error('🔍 [GoogleMapsScript] 可能的原因:');
      console.error('   1. 网络连接问题');
      console.error('   2. API Key 无效');
      console.error('   3. 域名限制 (RefererNotAllowedMapError)');
      console.error('   4. API 未启用');
      console.error('💡 [GoogleMapsScript] 当前请求来源:', window.location.origin);
    };

    // 添加到 head
    document.head.appendChild(script);

    // 清理函数
    return () => {
      // 注意：通常不建议移除 Google Maps 脚本，因为它可能被其他组件使用
      // 这里只是为了完整性而添加清理逻辑
      console.log('🧹 [GoogleMapsScript] 组件卸载（脚本保留）');
    };
  }, [currentApiKey]);

  return null; // 这个组件不渲染任何内容
}
