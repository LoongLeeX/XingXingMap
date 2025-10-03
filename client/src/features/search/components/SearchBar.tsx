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
    
    // 初始化 Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
    });
    
    // 监听地点选择事件
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.geometry) {
        onPlaceSelected(place);
      }
    });
    
    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
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

