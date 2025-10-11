/**
 * 主页面 - 业务逻辑组件
 * 地图标记应用的主界面
 * 
 * 这是实际的页面内容，可在任何环境中复用
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useGoogleMaps } from '@/features/map/hooks/useGoogleMaps';
import { MapContainer } from '@/features/map/components/MapContainer';
import { SearchBar } from '@/features/search/components/SearchBar';
import { MarkerList } from '@/features/markers/components/MarkerList';
import { MarkerForm } from '@/features/markers/components/MarkerForm';
import { CustomMarker } from '@/features/markers/components/CustomMarker';
import { MarkersLayer } from '@/features/markers/components/MarkersLayer';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { DiagnosticPanel } from '@/components/DiagnosticPanel';
import { ApiKeyStatusIndicator } from '@/client/src/components/ApiKeyStatusIndicator';
import { ApiKeyErrorBoundary } from '@/client/src/components/ApiKeyErrorBoundary';
import { GoogleMapsApiKeyDiagnostic } from '@/client/src/components/GoogleMapsApiKeyDiagnostic';
import { ApiKeyStoreDebugger } from '@/client/src/components/ApiKeyStoreDebugger';
import { useMarkers } from '@/features/markers/hooks/useMarkers';
import { useMarkerMutations } from '@/features/markers/hooks/useMarkerMutations';
import { useMapStore } from '@/features/map/hooks/useMapStore';
import { CreateMarkerDTO } from '@/shared/types/marker.types';
import { SUCCESS_MESSAGES } from '@/shared/constants/app.constants';
import { toast } from '@/client/src/components/ui/Toast';

export function HomePage() {
  console.log('🏠 [HomePage] 组件渲染');
  
  const { isLoaded, loadError } = useGoogleMaps();
  const { markers, isLoading: markersLoading, refetch } = useMarkers();
  const { createMarker, updateMarker, deleteMarker } = useMarkerMutations();
  const { updateMapView, map2D } = useMapStore();
  
  useEffect(() => {
    console.log('📊 [HomePage] 状态更新 - isLoaded:', isLoaded, 'loadError:', loadError);
  }, [isLoaded, loadError]);
  
  const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [editingMarker, setEditingMarker] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchMarkerPosition, setSearchMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  // 处理地图点击
  const handleMapClick = (lat: number, lng: number) => {
    console.log('🖱️ [HomePage] 地图点击:', { lat, lng });
    
    // 清除搜索标记
    setSearchMarkerPosition(null);
    
    // 设置新位置并打开表单
    setSelectedPosition({ lat, lng });
    setIsMarkerFormOpen(true);
  };
  
  // 处理地点搜索
  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      console.log('🔍 [HomePage] 地点已选择:', place.name, { lat, lng });
      
      // 更新地图视图
      updateMapView({ lat, lng }, 18);
      
      // 在搜索位置添加临时标记 📌
      setSearchMarkerPosition({ lat, lng });
    }
  };
  
  // 处理标记编辑
  const handleMarkerEdit = (marker: any) => {
    console.log('✏️ [HomePage] 编辑标记:', marker.title);
    setEditingMarker(marker);
    setSelectedPosition({ lat: marker.latitude, lng: marker.longitude });
    setIsMarkerFormOpen(true);
  };
  
  // 处理标记创建或更新
  const handleMarkerSubmit = async (data: CreateMarkerDTO) => {
    try {
      if (editingMarker) {
        // 更新现有标记
        console.log('🔵 [HomePage] 更新标记:', editingMarker.id);
        await updateMarker(editingMarker.id, {
          title: data.title,
          description: data.description,
        });
        toast.success('标记已更新', SUCCESS_MESSAGES.MARKER_UPDATED || '');
      } else if (selectedPosition) {
        // 创建新标记
        console.log('🔵 [HomePage] 创建新标记:', data);
        const newMarker = await createMarker({
          ...data,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
        });
        console.log('✅ [HomePage] 标记创建成功:', newMarker);
        toast.success('标记已创建', SUCCESS_MESSAGES.MARKER_CREATED);
      }
      
      console.log('🔄 [HomePage] 刷新标记列表...');
      await refetch();
      console.log('✅ [HomePage] 标记列表已刷新');
      
      setIsMarkerFormOpen(false);
      setSelectedPosition(null);
      setEditingMarker(null);
      setSearchMarkerPosition(null);
    } catch (error) {
      const action = editingMarker ? '更新' : '创建';
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`❌ [HomePage] ${action}标记失败:`, error);
      toast.error(`${action}标记失败`, errorMessage);
    }
  };
  
  // 处理标记删除
  const handleMarkerDelete = async (id: string) => {
    if (!confirm('确定要删除这个标记吗？')) return;
    
    try {
      await deleteMarker(id);
      toast.success('标记已删除', SUCCESS_MESSAGES.MARKER_DELETED);
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除标记失败';
      toast.error('删除失败', errorMessage);
    }
  };
  
  // 处理标记点击（定位到地图）
  const handleMarkerClick = (marker: any) => {
    console.log('📍 [HomePage] 标记点击:', marker.title);
    
    // 清除搜索标记
    setSearchMarkerPosition(null);
    
    // 定位到标记位置
    updateMapView({ lat: marker.latitude, lng: marker.longitude }, 18);
  };
  
  // 加载状态
  if (!isLoaded) {
    console.log('⏳ [HomePage] 显示加载界面');
    return <Loading fullScreen text="加载 Google Maps..." />;
  }
  
  console.log('✅ [HomePage] Google Maps 已加载，显示主界面');
  
  // 错误状态
  if (loadError) {
    const isApiKeyChanged = loadError.message.includes('API Key 已更改') || 
                           loadError.message.includes('请刷新页面');
    
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">
            {isApiKeyChanged ? '🔄' : '❌'}
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {isApiKeyChanged ? 'API Key 已更改' : '加载失败'}
          </h1>
          <p className="text-gray-600 mb-6">{loadError.message}</p>
          
          {isApiKeyChanged ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                您刚刚更改了 API Key，需要刷新页面以使用新的配置。
              </p>
              <div className="space-x-3">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔄 刷新页面
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = '/settings'}
                >
                  ⚙️ 返回设置
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                请检查 Google Maps API Key 是否正确配置
              </p>
              <div className="space-x-3">
                <Button 
                  onClick={() => window.location.href = '/settings'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ⚙️ 前往设置
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  🔄 重新加载
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <ApiKeyErrorBoundary>
      <div className="flex h-screen">
        {/* 侧边栏 */}
      <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            📍 地图标记应用
          </h1>
          
          <SearchBar onPlaceSelected={handlePlaceSelected} />
          
          {/* API Key 状态指示器 */}
          <div className="mt-4">
            <ApiKeyStatusIndicator compact />
          </div>
          
          {/* 设置页面链接 */}
          <div className="mt-4">
            <Button
              onClick={() => window.location.href = '/settings'}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              ⚙️ 设置
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">
              共 {markers.length} 个标记
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <MarkerList
            markers={markers}
            isLoading={markersLoading}
            onMarkerClick={handleMarkerClick}
            onMarkerEdit={handleMarkerEdit}
            onMarkerDelete={handleMarkerDelete}
          />
        </div>
      </div>
      
      {/* 地图区域 */}
      <div className="flex-1 relative">
        {/* 侧边栏切换按钮 */}
        <Button
          className="absolute top-4 left-4 z-20"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'}
        </Button>
        
        {/* 提示信息 */}
        <div className="absolute bottom-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">💡 点击地图添加标记</p>
        </div>
        
        <MapContainer 
          onMapClick={handleMapClick}
          markers={markers}
          searchMarkerPosition={searchMarkerPosition}
          onMarkerClick={handleMarkerClick}
        />
      </div>
      
      {/* 标记表单 Modal */}
      <Modal
        isOpen={isMarkerFormOpen}
        onClose={() => {
          setIsMarkerFormOpen(false);
          setSelectedPosition(null);
          setEditingMarker(null);
        }}
        title={editingMarker ? "编辑标记" : "添加新标记"}
      >
        <MarkerForm
          initialData={editingMarker ? {
            title: editingMarker.title,
            description: editingMarker.description,
            latitude: editingMarker.latitude,
            longitude: editingMarker.longitude,
            images: editingMarker.images,
          } : (selectedPosition ? {
            latitude: selectedPosition.lat,
            longitude: selectedPosition.lng,
          } : undefined)}
          onSubmit={handleMarkerSubmit}
          onCancel={() => {
            setIsMarkerFormOpen(false);
            setSelectedPosition(null);
            setEditingMarker(null);
          }}
        />
      </Modal>
      
        {/* 诊断工具 */}
        <DiagnosticPanel />
        <GoogleMapsApiKeyDiagnostic />
        <ApiKeyStoreDebugger />
      </div>
    </ApiKeyErrorBoundary>
  );
}

