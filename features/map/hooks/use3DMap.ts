/**
 * 3D Map Hook - 使用新的 Map3DElement API
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Map3DConfig } from '@/clientservershare/types/map.types';
import { DEFAULT_MAP_CONFIG, DEFAULT_3D_CONFIG } from '@/clientservershare/constants/map.constants';

export function use3DMap(containerId: string, config: Partial<Map3DConfig> = {}) {
  const [map, setMap] = useState<any | null>(null); // Map3DElement 类型
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef<any | null>(null);
  const configRef = useRef(config);
  
  // 只在第一次挂载时创建地图
  useEffect(() => {
    console.log(`🗺️ [use3DMap] 开始初始化 3D 地图 - containerId: ${containerId}`);
    
    if (!window.google) {
      console.warn('⚠️ [use3DMap] window.google 不可用，等待 SDK 加载');
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`❌ [use3DMap] 找不到容器元素: #${containerId}`);
      return;
    }
    
    // 如果地图实例已存在，恢复状态但不重新创建
    if (mapRef.current) {
      console.log('ℹ️ [use3DMap] 3D 地图实例已存在，恢复状态');
      setMap(mapRef.current);
      setIsReady(true);
      return;
    }
    
    // 使用新的 Map3DElement API - 需要单独的 bootstrap loader
    async function init3DMap() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        console.log('📦 [use3DMap] 加载 3D Maps (Photorealistic) ...');
        
        // 3D Maps 需要使用 beta 版本的 bootstrap loader
        // 如果已经有 importLibrary，尝试使用它
        if (typeof google.maps.importLibrary === 'function') {
          console.log('✅ [use3DMap] 使用现有的 importLibrary');
        } else {
          console.log('🔧 [use3DMap] 加载 3D Maps bootstrap loader (beta)...');
          
          // 加载支持 3D 的 bootstrap
          await new Promise<void>((resolve, reject) => {
            (function(g: any) {
              var h: any, a: any, k: any, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", 
                  q = "__ib__", m = document, b = window as any;
              b = b[c] || (b[c] = {});
              var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(),
                  u = () => h || (h = new Promise(async (f: any, n: any) => {
                    await (a = m.createElement("script"));
                    e.set("libraries", [...r] + "");
                    for (k in g) e.set(k.replace(/[A-Z]/g, (t: string) => "_" + t[0].toLowerCase()), g[k]);
                    e.set("callback", c + ".maps." + q);
                    a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
                    d[q] = f;
                    a.onerror = () => h = n(Error(p + " could not load."));
                    a.nonce = m.querySelector("script[nonce]")?.getAttribute('nonce') || "";
                    m.head.append(a);
                  }));
              d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n));
            })({
              key: apiKey,
              v: "alpha", // 3D Maps 官方文档推荐使用 alpha
            });
            
            // 等待 importLibrary 可用
            const checkInterval = setInterval(() => {
              if (typeof google?.maps?.importLibrary === 'function') {
                clearInterval(checkInterval);
                console.log('✅ [use3DMap] 3D Maps bootstrap loader 加载成功');
                resolve();
              }
            }, 100);
            
            setTimeout(() => {
              clearInterval(checkInterval);
              reject(new Error('3D Maps bootstrap loader 加载超时'));
            }, 10000);
          });
        }
        
        // 准备中心点配置
        const center = {
          lat: configRef.current.center?.lat || DEFAULT_MAP_CONFIG.center.lat,
          lng: configRef.current.center?.lng || DEFAULT_MAP_CONFIG.center.lng,
          altitude: 500, // 3D 地图需要高度
        };
        
        console.log('📍 [use3DMap] 中心位置:', center);
        
        // 导入 3D Maps 库
        const maps3dLib = await google.maps.importLibrary("maps3d") as any;
        console.log('📦 [use3DMap] maps3d 库加载成功');
        console.log('📦 [use3DMap] maps3d 库类型:', typeof maps3dLib);
        console.log('📦 [use3DMap] maps3d 库的所有键:', Object.keys(maps3dLib || {}));
        console.log('📦 [use3DMap] maps3d 完整内容:', maps3dLib);
        
        // 尝试多种方式获取 Map3DElement
        let Map3DElement = maps3dLib?.Map3DElement || 
                          maps3dLib?.default?.Map3DElement ||
                          (window as any).google?.maps?.Map3DElement ||
                          (window as any).google?.maps?.maps3d?.Map3DElement;
        
        console.log('🔍 [use3DMap] Map3DElement 查找结果:', Map3DElement);
        
        // 如果还是找不到，尝试直接创建 Web Component
        if (!Map3DElement) {
          console.warn('⚠️ [use3DMap] Map3DElement 类未找到，尝试使用 Web Component 方式');
          
          // 直接创建 gmp-map-3d 元素
          const map3DElement = document.createElement('gmp-map-3d') as any;
          
          // 设置属性
          map3DElement.setAttribute('center', `${center.lat},${center.lng},${center.altitude}`);
          map3DElement.setAttribute('tilt', String(configRef.current.tilt || DEFAULT_3D_CONFIG.tilt));
          map3DElement.setAttribute('heading', String(configRef.current.heading || DEFAULT_3D_CONFIG.heading));
          map3DElement.setAttribute('range', '1000');
          
          // 设置样式
          map3DElement.style.width = '100%';
          map3DElement.style.height = '100%';
          map3DElement.style.display = 'block';
          
          // 添加到容器
          container.innerHTML = '';
          container.appendChild(map3DElement);
          
          console.log('✅ [use3DMap] 使用 Web Component 方式创建成功');
          
          mapRef.current = map3DElement;
          setMap(map3DElement);
          setIsReady(true);
          
          console.log('🎉 [use3DMap] 3D 地图（Web Component）初始化完成');
          return;
        }
        
        console.log('🏗️ [use3DMap] 正在创建 Map3DElement 实例...');
        console.log('📐 [use3DMap] 倾斜角度:', configRef.current.tilt || DEFAULT_3D_CONFIG.tilt);
        
        // 创建 3D 地图元素
        const map3DElement = new Map3DElement({
          center,
          tilt: configRef.current.tilt || DEFAULT_3D_CONFIG.tilt,
          heading: configRef.current.heading || DEFAULT_3D_CONFIG.heading,
          range: 1000, // 视距
        });
        
        console.log('✅ [use3DMap] Map3DElement 对象创建成功:', map3DElement);
        console.log('📏 [use3DMap] 元素类型:', map3DElement.constructor.name);
        
        // 将 3D 地图元素添加到容器
        console.log('📦 [use3DMap] 准备添加到容器:', container.id);
        container.innerHTML = ''; // 清空容器
        container.appendChild(map3DElement);
        
        console.log('✅ [use3DMap] 已添加到 DOM，容器子元素数:', container.children.length);
        
        // 等待元素渲染
        setTimeout(() => {
          console.log('🎨 [use3DMap] 检查元素尺寸:', {
            width: map3DElement.offsetWidth,
            height: map3DElement.offsetHeight,
            style: window.getComputedStyle(map3DElement).display
          });
        }, 100);
        
        mapRef.current = map3DElement;
        setMap(map3DElement);
        setIsReady(true);
        
        console.log('🎉 [use3DMap] 3D 地图初始化完成');
      } catch (error) {
        console.error('❌ [use3DMap] 创建 3D 地图失败:', error);
        console.error('💡 错误详情:', {
          message: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined
        });
        console.error('💡 提示: 3D 地图需要 Map Tiles API，请确保已在 Google Cloud Console 中启用');
        console.error('💡 检查清单:');
        console.error('   1. Map Tiles API 是否已启用？');
        console.error('   2. API Key 是否有正确的权限？');
        console.error('   3. 当前位置是否支持 3D？（试试旧金山: 37.7704, -122.3985）');
      }
    }
    
    init3DMap();
    
    // 不要在 cleanup 中清理地图！让地图实例持久化
  }, [containerId]); // 只依赖 containerId
  
  return { map, isReady };
}

