/**
 * 主页面
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
import { useMarkers } from '@/features/markers/hooks/useMarkers';
import { useMarkerMutations } from '@/features/markers/hooks/useMarkerMutations';
import { useMapStore } from '@/features/map/hooks/useMapStore';
import { CreateMarkerDTO } from '@/clientservershare/types/marker.types';
import { SUCCESS_MESSAGES } from '@/clientservershare/constants/app.constants';

export default function HomePage() {
  console.log('🏠 [HomePage] 组件渲染');
  
  const { isLoaded, loadError } = useGoogleMaps();
  const { markers, isLoading: markersLoading, refetch } = useMarkers();
  const { createMarker, deleteMarker } = useMarkerMutations();
  const { updateMapView, map2D } = useMapStore();
  
  useEffect(() => {
    console.log('📊 [HomePage] 状态更新 - isLoaded:', isLoaded, 'loadError:', loadError);
  }, [isLoaded, loadError]);
  
  const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
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
  
  // 处理标记创建
  const handleMarkerSubmit = async (data: CreateMarkerDTO) => {
    try {
      if (selectedPosition) {
        await createMarker({
          ...data,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
        });
        
        alert(SUCCESS_MESSAGES.MARKER_CREATED);
        setIsMarkerFormOpen(false);
        setSelectedPosition(null);
        setSearchMarkerPosition(null); // 清除搜索标记
        refetch();
      }
    } catch (error) {
      alert('创建标记失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };
  
  // 处理标记删除
  const handleMarkerDelete = async (id: string) => {
    if (!confirm('确定要删除这个标记吗？')) return;
    
    try {
      await deleteMarker(id);
      alert(SUCCESS_MESSAGES.MARKER_DELETED);
      refetch();
    } catch (error) {
      alert('删除标记失败');
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">加载失败</h1>
          <p className="text-gray-600">{loadError.message}</p>
          <p className="text-sm text-gray-500 mt-4">
            请检查 Google Maps API Key 是否正确配置
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            📍 地图标记应用
          </h1>
          
          <SearchBar onPlaceSelected={handlePlaceSelected} />
          
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
        }}
        title="添加新标记"
      >
        <MarkerForm
          initialData={selectedPosition || undefined}
          onSubmit={handleMarkerSubmit}
          onCancel={() => {
            setIsMarkerFormOpen(false);
            setSelectedPosition(null);
          }}
        />
      </Modal>
      
      {/* 诊断工具 */}
      <DiagnosticPanel />
    </div>
  );
}

