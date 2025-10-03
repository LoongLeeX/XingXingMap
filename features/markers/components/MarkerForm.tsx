/**
 * Marker 表单组件
 */

'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { CreateMarkerDTO } from '@/clientservershare/types/marker.types';

export interface MarkerFormProps {
  initialData?: Partial<CreateMarkerDTO>;
  onSubmit: (data: CreateMarkerDTO) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MarkerForm({ initialData, onSubmit, onCancel, isLoading }: MarkerFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '标题不能为空';
    } else if (title.length > 200) {
      newErrors.title = '标题不能超过 200 字';
    }
    
    if (description && description.length > 2000) {
      newErrors.description = '描述不能超过 2000 字';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const data: CreateMarkerDTO = {
      title: title.trim(),
      description: description.trim() || undefined,
      latitude: initialData?.latitude || 0,
      longitude: initialData?.longitude || 0,
      images: initialData?.images || [],
    };
    
    await onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="输入标记标题"
        required
      />
      
      <Textarea
        label="描述（可选）"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder="输入标记描述"
        rows={4}
      />
      
      {initialData?.latitude && initialData?.longitude && (
        <div className="text-sm text-gray-600">
          位置: {initialData.latitude.toFixed(6)}, {initialData.longitude.toFixed(6)}
        </div>
      )}
      
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          保存
        </Button>
      </div>
    </form>
  );
}

