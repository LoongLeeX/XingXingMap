/**
 * Marker 验证 Schema (Zod)
 * 前后端共享的数据验证逻辑
 */

import { z } from 'zod';

// 坐标验证
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// 创建标记 Schema
export const createMarkerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images per marker').optional(),
});

// 更新标记 Schema
export const updateMarkerSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

// 地图边界 Schema
export const mapBoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

// 搜索 Schema
export const searchSchema = z.object({
  keyword: z.string().min(1, 'Search keyword is required'),
});

// 类型推导
export type CreateMarkerInput = z.infer<typeof createMarkerSchema>;
export type UpdateMarkerInput = z.infer<typeof updateMarkerSchema>;
export type MapBounds = z.infer<typeof mapBoundsSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

