/**
 * Repository Factory
 * 
 * 工厂模式创建 Repository 实例
 * 切换数据库时，只需修改这个文件，业务代码无需改动
 */

import { prisma } from './prisma';
import { IMarkerRepository } from '../features/markers/repository/marker.repository.interface';
import { PrismaMarkerRepository } from '../features/markers/repository/marker.repository.prisma';

/**
 * 创建 Marker Repository 实例
 * 
 * 当前使用: Prisma + SQLite
 * 未来可切换为: Prisma + PostgreSQL, MongoDB, 等
 */
export function createMarkerRepository(): IMarkerRepository {
  return new PrismaMarkerRepository(prisma);
}

/**
 * 未来切换数据库示例：
 * 
 * // 切换到 MongoDB
 * import { MongoMarkerRepository } from '../features/markers/repository/marker.repository.mongo';
 * import { mongoClient } from './mongo';
 * 
 * export function createMarkerRepository(): IMarkerRepository {
 *   return new MongoMarkerRepository(mongoClient);
 * }
 * 
 * // 切换到 TypeORM
 * import { TypeORMMarkerRepository } from '../features/markers/repository/marker.repository.typeorm';
 * import { getRepository } from 'typeorm';
 * 
 * export function createMarkerRepository(): IMarkerRepository {
 *   return new TypeORMMarkerRepository(getRepository(Marker));
 * }
 */

/**
 * Repository 容器（可选的依赖注入容器）
 * 用于在应用中统一管理所有 Repository 实例
 */
export class RepositoryContainer {
  private static markerRepository: IMarkerRepository;

  static getMarkerRepository(): IMarkerRepository {
    if (!this.markerRepository) {
      this.markerRepository = createMarkerRepository();
    }
    return this.markerRepository;
  }

  // 未来可添加更多 Repository
  // static getCategoryRepository(): ICategoryRepository { ... }
  // static getUserRepository(): IUserRepository { ... }
}

