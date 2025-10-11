/**
 * Marker Service
 * 
 * 业务逻辑层，处理标记相关的业务规则
 * 通过 Repository 接口访问数据，与具体数据库实现解耦
 */

import { Marker } from '@prisma/client';
import {
  IMarkerRepository,
  CreateMarkerInput,
  UpdateMarkerInput,
  MapBounds,
} from '../repository/marker.repository.interface';
import { RepositoryContainer } from '@/server/src/lib/repository-factory';

export class MarkerService {
  private markerRepository: IMarkerRepository;

  constructor(markerRepository?: IMarkerRepository) {
    // 使用依赖注入，方便测试时 Mock Repository
    this.markerRepository = markerRepository || RepositoryContainer.getMarkerRepository();
  }

  /**
   * 创建标记
   */
  async createMarker(data: CreateMarkerInput): Promise<Marker> {
    // 业务验证
    this.validateMarkerData(data);

    // 调用 Repository 创建数据
    return this.markerRepository.create(data);
  }

  /**
   * 获取所有标记
   */
  async getAllMarkers(options?: { skip?: number; take?: number }): Promise<Marker[]> {
    return this.markerRepository.findAll({
      skip: options?.skip,
      take: options?.take,
      orderBy: { field: 'createdAt', direction: 'desc' },
    });
  }

  /**
   * 根据 ID 获取标记
   */
  async getMarkerById(id: string): Promise<Marker> {
    const marker = await this.markerRepository.findById(id);
    
    if (!marker) {
      throw new Error(`Marker with id ${id} not found`);
    }

    return marker;
  }

  /**
   * 更新标记
   */
  async updateMarker(id: string, data: UpdateMarkerInput): Promise<Marker> {
    // 验证标记是否存在
    await this.getMarkerById(id);

    // 验证更新数据
    if (data.latitude !== undefined || data.longitude !== undefined) {
      this.validateCoordinates(
        data.latitude ?? 0,
        data.longitude ?? 0
      );
    }

    return this.markerRepository.update(id, data);
  }

  /**
   * 删除标记
   */
  async deleteMarker(id: string): Promise<void> {
    // 验证标记是否存在
    await this.getMarkerById(id);

    // 删除标记
    await this.markerRepository.delete(id);

    // TODO: 删除相关的图片文件
  }

  /**
   * 根据地图边界获取标记
   */
  async getMarkersByBounds(bounds: MapBounds): Promise<Marker[]> {
    this.validateBounds(bounds);
    return this.markerRepository.findByBounds(bounds);
  }

  /**
   * 搜索标记
   */
  async searchMarkers(keyword: string): Promise<Marker[]> {
    if (!keyword || keyword.trim().length === 0) {
      throw new Error('Search keyword cannot be empty');
    }

    return this.markerRepository.search(keyword.trim());
  }

  /**
   * 获取标记统计信息
   */
  async getMarkerStats(): Promise<{
    total: number;
    withImages: number;
    withoutDescription: number;
  }> {
    const allMarkers = await this.markerRepository.findAll();
    
    return {
      total: allMarkers.length,
      withImages: allMarkers.filter(m => {
        // 支持数组或 JSON 字符串
        if (Array.isArray(m.images)) {
          return m.images.length > 0;
        }
        try {
          const images = JSON.parse(m.images as any);
          return Array.isArray(images) && images.length > 0;
        } catch {
          return false;
        }
      }).length,
      withoutDescription: allMarkers.filter(m => !m.description).length,
    };
  }

  /**
   * 验证标记数据
   */
  private validateMarkerData(data: CreateMarkerInput): void {
    // 标题验证
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Marker title is required');
    }

    if (data.title.length > 200) {
      throw new Error('Marker title must be less than 200 characters');
    }

    // 描述验证
    if (data.description && data.description.length > 2000) {
      throw new Error('Marker description must be less than 2000 characters');
    }

    // 坐标验证
    this.validateCoordinates(data.latitude, data.longitude);

    // 图片验证
    if (data.images && data.images.length > 10) {
      throw new Error('Maximum 10 images per marker');
    }
  }

  /**
   * 验证坐标
   */
  private validateCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }

  /**
   * 验证地图边界
   */
  private validateBounds(bounds: MapBounds): void {
    if (bounds.south >= bounds.north) {
      throw new Error('Invalid bounds: south must be less than north');
    }

    if (bounds.west >= bounds.east) {
      throw new Error('Invalid bounds: west must be less than east');
    }

    this.validateCoordinates(bounds.north, bounds.east);
    this.validateCoordinates(bounds.south, bounds.west);
  }
}

/**
 * 导出单例实例（可选）
 */
export const markerService = new MarkerService();

