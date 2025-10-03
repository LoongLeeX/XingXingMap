/**
 * Marker Repository Interface
 * 
 * 数据访问层接口定义，与具体数据库实现解耦
 * 未来可以轻松切换数据库实现（SQLite -> PostgreSQL -> MongoDB 等）
 */

import { Marker } from '@prisma/client';

// 创建标记的输入类型
export interface CreateMarkerInput {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  images?: string[];
}

// 更新标记的输入类型
export interface UpdateMarkerInput {
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

// 地图边界类型（用于范围查询）
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 查询选项
export interface FindManyOptions {
  skip?: number;
  take?: number;
  orderBy?: {
    field: keyof Marker;
    direction: 'asc' | 'desc';
  };
}

/**
 * Marker Repository 接口
 * 
 * 所有数据库操作都通过这个接口进行
 * 具体实现可以是 Prisma、TypeORM、MongoDB Driver 等
 */
export interface IMarkerRepository {
  /**
   * 创建标记
   * @param data 标记数据
   * @returns 创建的标记对象
   */
  create(data: CreateMarkerInput): Promise<Marker>;

  /**
   * 查询所有标记
   * @param options 查询选项（分页、排序）
   * @returns 标记列表
   */
  findAll(options?: FindManyOptions): Promise<Marker[]>;

  /**
   * 根据 ID 查询标记
   * @param id 标记 ID
   * @returns 标记对象或 null
   */
  findById(id: string): Promise<Marker | null>;

  /**
   * 更新标记
   * @param id 标记 ID
   * @param data 更新的数据
   * @returns 更新后的标记对象
   */
  update(id: string, data: UpdateMarkerInput): Promise<Marker>;

  /**
   * 删除标记
   * @param id 标记 ID
   */
  delete(id: string): Promise<void>;

  /**
   * 根据地图边界查询标记（用于视窗内标记显示）
   * @param bounds 地图边界
   * @returns 边界内的标记列表
   */
  findByBounds(bounds: MapBounds): Promise<Marker[]>;

  /**
   * 根据关键词搜索标记
   * @param keyword 搜索关键词
   * @returns 匹配的标记列表
   */
  search(keyword: string): Promise<Marker[]>;

  /**
   * 统计标记数量
   * @returns 标记总数
   */
  count(): Promise<number>;
}

