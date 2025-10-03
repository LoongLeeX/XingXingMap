/**
 * Marker Server Actions
 * 
 * Next.js Server Actions 用于客户端直接调用
 * 通过 Service 层处理业务逻辑，Service 层通过 Repository 访问数据
 * 
 * 数据流:
 * Client Component -> Server Action -> Service -> Repository -> Database
 */

'use server';

import { revalidatePath } from 'next/cache';
import { MarkerService } from '../services/marker.service';
import { CreateMarkerInput, UpdateMarkerInput, MapBounds } from '../repository/marker.repository.interface';

// 创建 Service 实例
const markerService = new MarkerService();

/**
 * 创建标记
 */
export async function createMarkerAction(data: CreateMarkerInput) {
  try {
    const marker = await markerService.createMarker(data);
    
    // 重新验证路径，刷新缓存
    revalidatePath('/');
    
    return {
      success: true,
      data: marker,
    };
  } catch (error) {
    console.error('Failed to create marker:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create marker',
    };
  }
}

/**
 * 获取所有标记
 */
export async function getMarkersAction(options?: { skip?: number; take?: number }) {
  try {
    const markers = await markerService.getAllMarkers(options);
    
    return {
      success: true,
      data: markers,
    };
  } catch (error) {
    console.error('Failed to get markers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get markers',
    };
  }
}

/**
 * 根据 ID 获取标记
 */
export async function getMarkerByIdAction(id: string) {
  try {
    const marker = await markerService.getMarkerById(id);
    
    return {
      success: true,
      data: marker,
    };
  } catch (error) {
    console.error('Failed to get marker:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get marker',
    };
  }
}

/**
 * 更新标记
 */
export async function updateMarkerAction(id: string, data: UpdateMarkerInput) {
  try {
    const marker = await markerService.updateMarker(id, data);
    
    revalidatePath('/');
    
    return {
      success: true,
      data: marker,
    };
  } catch (error) {
    console.error('Failed to update marker:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update marker',
    };
  }
}

/**
 * 删除标记
 */
export async function deleteMarkerAction(id: string) {
  try {
    await markerService.deleteMarker(id);
    
    revalidatePath('/');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to delete marker:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete marker',
    };
  }
}

/**
 * 根据地图边界获取标记
 */
export async function getMarkersByBoundsAction(bounds: MapBounds) {
  try {
    const markers = await markerService.getMarkersByBounds(bounds);
    
    return {
      success: true,
      data: markers,
    };
  } catch (error) {
    console.error('Failed to get markers by bounds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get markers by bounds',
    };
  }
}

/**
 * 搜索标记
 */
export async function searchMarkersAction(keyword: string) {
  try {
    const markers = await markerService.searchMarkers(keyword);
    
    return {
      success: true,
      data: markers,
    };
  } catch (error) {
    console.error('Failed to search markers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search markers',
    };
  }
}

/**
 * 获取标记统计信息
 */
export async function getMarkerStatsAction() {
  try {
    const stats = await markerService.getMarkerStats();
    
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Failed to get marker stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get marker stats',
    };
  }
}

/**
 * 客户端使用示例:
 * 
 * // client/src/features/markers/hooks/useMarkers.ts
 * import { createMarkerAction, getMarkersAction } from '@/server/src/features/markers/actions/marker-actions';
 * 
 * export function useMarkers() {
 *   const createMarker = async (data: CreateMarkerInput) => {
 *     const result = await createMarkerAction(data);
 *     if (result.success) {
 *       // 成功处理
 *       return result.data;
 *     } else {
 *       // 错误处理
 *       throw new Error(result.error);
 *     }
 *   };
 * 
 *   return { createMarker };
 * }
 */

