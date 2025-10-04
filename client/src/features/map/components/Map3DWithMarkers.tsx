/**
 * 支持标记的 3D 地图组件
 * 使用 Map3DElement 和 Marker3DElement
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMapStore } from '../hooks/useMapStore';
import { Marker } from '@/shared/types/marker.types';
import { Markers3DLayer } from '@/features/markers/components/Markers3DLayer';
import { Marker3D } from '@/features/markers/components/Marker3D';

export interface Map3DWithMarkersProps {
  onMapClick?: (lat: number, lng: number) => void;
  markers?: Marker[];
  searchMarkerPosition?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: Marker) => void;
}

export function Map3DWithMarkers({ 
  onMapClick, 
  markers = [],
  searchMarkerPosition,
  onMarkerClick 
}: Map3DWithMarkersProps) {
  const { center } = useMapStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map3d, setMap3d] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInteractionTip, setShowInteractionTip] = useState(true);
  
  // 生成唯一的组件ID用于调试
  const componentId = useRef(`map3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // 鼠标交互状态
  const mouseStateRef = useRef({
    isMouseDown: false,
    lastMouseX: 0,
    currentHeading: 0
  });
  
  console.log(`🆔 [Map3DWithMarkers] 组件渲染 - ID: ${componentId.current}`);

  // 初始化 3D 地图（只执行一次）
  useEffect(() => {
    console.log(`🚀 [Map3DWithMarkers] useEffect 初始化开始 - ID: ${componentId.current}`);
    
    let map3dInstance: any = null;
    let isMounted = true;
    let cleanupInteraction: (() => void) | null = null;

    async function init3DMap() {
      try {
        console.log(`🔍 [Map3DWithMarkers] 检查容器 - ID: ${componentId.current}`);
        
        if (!containerRef.current) {
          console.error(`❌ [Map3DWithMarkers] 容器不存在 - ID: ${componentId.current}`);
          return;
        }

        // 检查容器是否已经有地图实例（防止重复添加）
        const existingMaps = containerRef.current.querySelectorAll('gmp-map-3d');
        if (existingMaps.length > 0) {
          console.warn(`⚠️ [Map3DWithMarkers] 容器已有 ${existingMaps.length} 个地图实例，跳过创建 - ID: ${componentId.current}`);
          return;
        }

        console.log(`✅ [Map3DWithMarkers] 容器找到:`, {
          id: componentId.current,
          containerId: containerRef.current.id,
          containerClass: containerRef.current.className,
          existingChildren: containerRef.current.children.length
        });

        if (!window.google?.maps?.importLibrary) {
          console.error(`❌ [Map3DWithMarkers] Google Maps API 未加载 - ID: ${componentId.current}`);
          setError('Google Maps API 未加载');
          return;
        }

        console.log(`📦 [Map3DWithMarkers] 开始加载 Map3DElement... - ID: ${componentId.current}`);

        // 导入 maps3d 库（包含 Map3DElement 和 Marker3DElement）
        const maps3dLib = await window.google.maps.importLibrary("maps3d") as any;
        console.log('✅ [Map3DWithMarkers] maps3d 库已加载');
        console.log('📋 [Map3DWithMarkers] maps3dLib 包含:', Object.keys(maps3dLib || {}));

        if (!maps3dLib) {
          console.error('❌ [Map3DWithMarkers] maps3d 库返回 undefined');
          setError('maps3d 库加载失败，请检查 API Key 和 Map Tiles API');
          return;
        }

        const { Map3DElement, Marker3DElement } = maps3dLib;

        if (!Map3DElement) {
          console.error('❌ [Map3DWithMarkers] Map3DElement 不可用');
          console.log('可用的属性:', Object.keys(maps3dLib));
          setError('Map3DElement 不可用，请确保 API Key 支持 3D Maps 和 Map Tiles API 已启用');
          return;
        }

        if (!Marker3DElement) {
          console.warn('⚠️ [Map3DWithMarkers] Marker3DElement 不可用，标记功能将无法使用');
        } else {
          console.log('✅ [Map3DWithMarkers] Marker3DElement 可用');
        }

        // 创建 3D 地图实例
        console.log(`🏗️ [Map3DWithMarkers] 创建 Map3DElement 实例 - ID: ${componentId.current}`);
        map3dInstance = new Map3DElement({
          center: {
            lat: center.lat,
            lng: center.lng,
            altitude: 0,
          },
          tilt: 67.5,
          range: 2000,
          heading: 0,
          mode: 'SATELLITE'  // 使用 SATELLITE 模式确保建筑显示
        });

        console.log(`✅ [Map3DWithMarkers] Map3DElement 实例已创建 - ID: ${componentId.current}`, map3dInstance);

        // 添加点击事件（使用 gmp-click 事件）
        if (onMapClick) {
          map3dInstance.addEventListener('gmp-click', (event: any) => {
            console.log('🖱️ [Map3DWithMarkers] 3D 地图点击事件:', event);
            if (event.position) {
              onMapClick(event.position.lat, event.position.lng);
            }
          });
        }

        // 添加鼠标拖拽旋转交互
        console.log('🖱️ [Map3DWithMarkers] 添加鼠标交互控制');
        
        // 初始化当前heading
        mouseStateRef.current.currentHeading = map3dInstance.heading || 0;
        
        // 鼠标按下事件
        const handleMouseDown = (event: MouseEvent) => {
          mouseStateRef.current.isMouseDown = true;
          mouseStateRef.current.lastMouseX = event.clientX;
          map3dInstance.style.cursor = 'grabbing';
        };
        
        // 鼠标移动事件 - 控制heading旋转
        const handleMouseMove = (event: MouseEvent) => {
          if (!mouseStateRef.current.isMouseDown) return;
          
          // 计算鼠标水平移动的距离
          const deltaX = event.clientX - mouseStateRef.current.lastMouseX;
          mouseStateRef.current.lastMouseX = event.clientX;
          
          // 根据鼠标移动更新heading
          // 鼠标向右移动，heading减少（逆时针旋转视角）
          // 灵敏度：0.3度/像素
          mouseStateRef.current.currentHeading -= deltaX * 0.3;
          
          // 保持heading在0-360度范围内
          mouseStateRef.current.currentHeading = 
            (mouseStateRef.current.currentHeading + 360) % 360;
          
          // 更新相机视角
          map3dInstance.heading = mouseStateRef.current.currentHeading;
        };
        
        // 鼠标松开事件
        const handleMouseUp = () => {
          mouseStateRef.current.isMouseDown = false;
          map3dInstance.style.cursor = 'grab';
        };
        
        // 鼠标离开地图区域时停止拖拽
        const handleMouseLeave = () => {
          mouseStateRef.current.isMouseDown = false;
          map3dInstance.style.cursor = 'grab';
        };
        
        // 键盘方向键控制
        const handleKeyDown = (event: KeyboardEvent) => {
          const rotateSpeed = 5; // 每次旋转5度
          
          if (event.key === 'ArrowLeft') {
            mouseStateRef.current.currentHeading = 
              (mouseStateRef.current.currentHeading - rotateSpeed + 360) % 360;
            map3dInstance.heading = mouseStateRef.current.currentHeading;
          } else if (event.key === 'ArrowRight') {
            mouseStateRef.current.currentHeading = 
              (mouseStateRef.current.currentHeading + rotateSpeed) % 360;
            map3dInstance.heading = mouseStateRef.current.currentHeading;
          }
        };
        
        // 添加事件监听器
        map3dInstance.addEventListener('mousedown', handleMouseDown);
        map3dInstance.addEventListener('mousemove', handleMouseMove);
        map3dInstance.addEventListener('mouseup', handleMouseUp);
        map3dInstance.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('keydown', handleKeyDown);
        
        // 设置初始鼠标样式
        map3dInstance.style.cursor = 'grab';
        
        console.log('✅ [Map3DWithMarkers] 鼠标交互控制已添加');
        
        // 保存事件监听器清理函数
        cleanupInteraction = () => {
          map3dInstance.removeEventListener('mousedown', handleMouseDown);
          map3dInstance.removeEventListener('mousemove', handleMouseMove);
          map3dInstance.removeEventListener('mouseup', handleMouseUp);
          map3dInstance.removeEventListener('mouseleave', handleMouseLeave);
          document.removeEventListener('keydown', handleKeyDown);
          console.log('🧹 [Map3DWithMarkers] 鼠标交互监听器已清理');
        };

        // 在添加到 DOM 前再次检查是否已卸载
        if (!isMounted) {
          console.log(`⚠️ [Map3DWithMarkers] 组件已卸载（添加前检查），取消添加 - ID: ${componentId.current}`);
          return;
        }

        if (!containerRef.current) {
          console.error(`❌ [Map3DWithMarkers] 容器在添加时消失 - ID: ${componentId.current}`);
          return;
        }

        // 添加到 DOM
        console.log(`➕ [Map3DWithMarkers] 添加地图到DOM - ID: ${componentId.current}`);
        console.log(`📍 [Map3DWithMarkers] 容器信息:`, {
          containerId: containerRef.current.id,
          containerChildren: containerRef.current.children.length,
          containerHTML: containerRef.current.innerHTML.substring(0, 100)
        });
        
        containerRef.current.appendChild(map3dInstance);
        
        console.log(`✅ [Map3DWithMarkers] 地图已添加到DOM - ID: ${componentId.current}`);
        console.log(`📍 [Map3DWithMarkers] 容器现在有 ${containerRef.current.children.length} 个子元素`);
        
        // 再次检查是否已卸载（在设置状态前）
        if (!isMounted) {
          console.log(`⚠️ [Map3DWithMarkers] 组件已卸载（状态更新前），移除刚添加的地图 - ID: ${componentId.current}`);
          if (containerRef.current && map3dInstance) {
            containerRef.current.removeChild(map3dInstance);
          }
          return;
        }
        
        setMap3d(map3dInstance);
        setIsReady(true);

        console.log(`🎉 [Map3DWithMarkers] 3D 地图初始化完成 - ID: ${componentId.current}`);
        console.log('📊 [Map3DWithMarkers] 准备渲染标记，数量:', markers.length);
      } catch (error) {
        console.error('❌ [Map3DWithMarkers] 初始化失败:', error);
        setError(error instanceof Error ? error.message : '未知错误');
      }
    }

    init3DMap();

    // 清理函数
    return () => {
      console.log(`🧹 [Map3DWithMarkers] 组件卸载，开始清理 - ID: ${componentId.current}`);
      isMounted = false; // 标记为已卸载，防止异步操作继续执行
      
      // 清理鼠标交互事件监听器
      if (cleanupInteraction) {
        cleanupInteraction();
      }
      
      if (map3dInstance) {
        try {
          // 尝试从 DOM 中移除
          if (containerRef.current && containerRef.current.contains(map3dInstance)) {
            console.log(`🗑️ [Map3DWithMarkers] 移除地图实例 - ID: ${componentId.current}`);
            containerRef.current.removeChild(map3dInstance);
            console.log(`✅ [Map3DWithMarkers] 3D 地图已清理 - ID: ${componentId.current}`);
          } else {
            console.log(`ℹ️ [Map3DWithMarkers] 地图实例不在容器中，无需移除 - ID: ${componentId.current}`);
          }
        } catch (e) {
          console.warn(`⚠️ [Map3DWithMarkers] 清理时出错 - ID: ${componentId.current}`, e);
        }
      } else {
        console.log(`ℹ️ [Map3DWithMarkers] 无需清理（地图未创建） - ID: ${componentId.current}`);
      }
      
      // 清理所有可能残留的地图实例
      if (containerRef.current) {
        const remainingMaps = containerRef.current.querySelectorAll('gmp-map-3d');
        if (remainingMaps.length > 0) {
          console.log(`🗑️ [Map3DWithMarkers] 清理残留的 ${remainingMaps.length} 个地图实例 - ID: ${componentId.current}`);
          remainingMaps.forEach((map, index) => {
            try {
              map.remove();
              console.log(`✅ [Map3DWithMarkers] 移除残留地图 ${index + 1} - ID: ${componentId.current}`);
            } catch (e) {
              console.warn(`⚠️ [Map3DWithMarkers] 移除残留地图 ${index + 1} 失败 - ID: ${componentId.current}`, e);
            }
          });
        }
      }
    };
  }, []); // 空依赖数组，只初始化一次

  // 监听中心点变化，更新 3D 地图视角
  useEffect(() => {
    if (map3d && isReady) {
      console.log('🗺️ [Map3DWithMarkers] 更新地图中心:', { lat: center.lat, lng: center.lng });
      
      try {
        // 更新 3D 地图的 center 属性
        map3d.center = {
          lat: center.lat,
          lng: center.lng,
          altitude: 0,
        };
        
        console.log('✅ [Map3DWithMarkers] 地图中心已更新');
      } catch (error) {
        console.error('❌ [Map3DWithMarkers] 更新地图中心失败:', error);
      }
    }
  }, [center.lat, center.lng, map3d, isReady]);

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* 3D 地图容器 - 永远占满整个空间 */}
      <div 
        ref={containerRef}
        id={`container-${componentId.current}`}
        className="absolute inset-0 w-full h-full"
        data-component="Map3DWithMarkers"
        data-component-id={componentId.current}
      />
      
      {/* 加载状态遮罩 */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 backdrop-blur-sm z-20">
          <div className="text-center bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">加载 3D 地图中...</p>
            <p className="text-gray-500 text-xs mt-2">需要 Map Tiles API</p>
          </div>
        </div>
      )}
      
      {/* 错误状态遮罩 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm z-20">
          <div className="text-center bg-white p-6 rounded-lg shadow-xl max-w-md">
            <p className="text-red-600 font-semibold text-lg mb-2">❌ 3D 地图加载失败</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500">
              请确保 API Key 正确且已启用 Map Tiles API
            </p>
          </div>
        </div>
      )}
      
      {/* 成功加载后显示标记 */}
      {isReady && map3d && (
        <>
          {/* 渲染所有保存的标记 */}
          {markers.length > 0 && (
            <Markers3DLayer
              map3d={map3d}
              markers={markers}
              onMarkerClick={onMarkerClick}
            />
          )}
          
          {/* 渲染搜索标记 */}
          {searchMarkerPosition && (
            <Marker3D
              map3d={map3d}
              position={{
                lat: searchMarkerPosition.lat,
                lng: searchMarkerPosition.lng,
                altitude: 150, // 搜索标记更高一些
              }}
              label="📌 搜索位置"
              altitudeMode="ABSOLUTE"
              extruded={true}
            />
          )}
        </>
      )}
      
      {/* 状态指示器（小巧版） - 包含组件ID用于调试 */}
      {isReady && (
        <>
          <div 
            className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-[10px] z-10"
            title={`组件ID: ${componentId.current}`}
          >
            ✅ {markers.length}个标记
            <div className="text-[8px] text-gray-400 mt-0.5">
              ID: {componentId.current.slice(-8)}
            </div>
          </div>
          
          {/* 交互提示 */}
          {showInteractionTip && (
            <div className="absolute top-16 right-2 bg-blue-600/90 text-white px-3 py-2 pr-6 rounded-lg text-xs z-10 max-w-xs shadow-lg">
              <button
                onClick={() => setShowInteractionTip(false)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded transition-colors text-sm"
                title="关闭提示"
              >
                ✕
              </button>
              <div className="font-semibold mb-1">🖱️ 3D 交互控制</div>
              <div className="text-[10px] space-y-0.5">
                <div>• 拖拽鼠标：旋转视角</div>
                <div>• ← → 方向键：旋转视角</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

