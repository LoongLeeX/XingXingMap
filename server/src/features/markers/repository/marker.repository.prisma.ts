/**
 * Marker Repository - Prisma Implementation
 * 
 * 使用 Prisma ORM 实现 IMarkerRepository 接口
 * 适用于 SQLite、PostgreSQL、MySQL 等 Prisma 支持的数据库
 */

import { PrismaClient, Marker } from '@prisma/client';
import {
  IMarkerRepository,
  CreateMarkerInput,
  UpdateMarkerInput,
  MapBounds,
  FindManyOptions,
} from './marker.repository.interface';

export class PrismaMarkerRepository implements IMarkerRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * 辅助方法：将图片数组序列化为字符串（SQLite 不支持数组类型）
   */
  private serializeImages(images?: string[]): string {
    if (!images || images.length === 0) return '';
    return JSON.stringify(images);
  }

  /**
   * 辅助方法：将图片字符串反序列化为数组
   */
  private deserializeImages(imagesStr: string): string[] {
    if (!imagesStr) return [];
    try {
      return JSON.parse(imagesStr);
    } catch {
      return [];
    }
  }

  /**
   * 辅助方法：转换 Marker 对象，处理 images 字段
   */
  private transformMarker(marker: Marker): Marker {
    return {
      ...marker,
      images: this.serializeImages(this.deserializeImages(marker.images)),
    };
  }

  async create(data: CreateMarkerInput): Promise<Marker> {
    const marker = await this.prisma.marker.create({
      data: {
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        images: this.serializeImages(data.images),
      },
    });

    return this.transformMarker(marker);
  }

  async findAll(options?: FindManyOptions): Promise<Marker[]> {
    const markers = await this.prisma.marker.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy
        ? { [options.orderBy.field]: options.orderBy.direction }
        : { createdAt: 'desc' },
    });

    return markers.map(marker => this.transformMarker(marker));
  }

  async findById(id: string): Promise<Marker | null> {
    const marker = await this.prisma.marker.findUnique({
      where: { id },
    });

    return marker ? this.transformMarker(marker) : null;
  }

  async update(id: string, data: UpdateMarkerInput): Promise<Marker> {
    const updateData: any = { ...data };
    
    // 如果有 images 字段，需要序列化
    if (data.images !== undefined) {
      updateData.images = this.serializeImages(data.images);
    }

    const marker = await this.prisma.marker.update({
      where: { id },
      data: updateData,
    });

    return this.transformMarker(marker);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.marker.delete({
      where: { id },
    });
  }

  async findByBounds(bounds: MapBounds): Promise<Marker[]> {
    const markers = await this.prisma.marker.findMany({
      where: {
        latitude: {
          gte: bounds.south,
          lte: bounds.north,
        },
        longitude: {
          gte: bounds.west,
          lte: bounds.east,
        },
      },
    });

    return markers.map(marker => this.transformMarker(marker));
  }

  async search(keyword: string): Promise<Marker[]> {
    const markers = await this.prisma.marker.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return markers.map(marker => this.transformMarker(marker));
  }

  async count(): Promise<number> {
    return this.prisma.marker.count();
  }
}

/**
 * 数据库切换说明：
 * 
 * 当需要从 SQLite 切换到 PostgreSQL 时：
 * 
 * 1. 修改 prisma/schema.prisma:
 *    datasource db {
 *      provider = "postgresql"
 *      url      = env("DATABASE_URL")
 *    }
 * 
 * 2. 修改 Marker model 的 images 字段:
 *    images String[] @default([])  // PostgreSQL 支持数组
 * 
 * 3. 修改此文件的序列化/反序列化逻辑:
 *    - 移除 serializeImages/deserializeImages 方法
 *    - 直接使用 data.images 而不是序列化
 * 
 * 4. 业务逻辑代码（Service、Controller）无需任何修改！✅
 */

