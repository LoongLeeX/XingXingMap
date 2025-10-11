/**
 * 搜索栏组件
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';

export interface SearchBarProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

export function SearchBar({ onPlaceSelected }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  useEffect(() => {
    if (!inputRef.current || !window.google) return;
    
    console.log('🔍 [SearchBar] 初始化 Autocomplete');
    
    // 使用新的 importLibrary API 加载 places 库
    async function initAutocomplete() {
      try {
        // 加载 places 库
        await google.maps.importLibrary("places");
        
        console.log('✅ [SearchBar] places 库加载成功');
        
        if (!inputRef.current) return;
        
        // 初始化 Autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
        });
        
        console.log('✅ [SearchBar] Autocomplete 初始化成功');
        
        // 监听地点选择事件
        const listener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry) {
            console.log('📍 [SearchBar] 地点已选择:', place.name);
            onPlaceSelected(place);
          }
        });
        
        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error('❌ [SearchBar] places 库加载失败:', error);
      }
    }
    
    initAutocomplete();
  }, [onPlaceSelected]);
  
  return (
    <div className="w-full">
      <Input
        ref={inputRef}
        placeholder="搜索地址或地点..."
        className="w-full"
      />
    </div>
  );
}

