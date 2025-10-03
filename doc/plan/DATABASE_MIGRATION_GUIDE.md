# 数据库切换指南

本文档说明如何从 SQLite 切换到其他数据库（PostgreSQL、MySQL 等）。

## 🎯 为什么设计为可切换？

本项目采用 **Repository Pattern** 架构模式，将数据访问层抽象化：

```
Controller (Server Actions)
         ↓
Service Layer (业务逻辑) ← 与数据库无关
         ↓
Repository Interface (接口定义) ← 统一接口
         ↓
Repository Implementation ← 仅此层需要修改
         ↓
Database (SQLite/PostgreSQL/MySQL)
```

**优势**：
- ✅ 业务逻辑代码与数据库解耦
- ✅ 切换数据库无需修改业务代码
- ✅ 易于测试（可以 Mock Repository）
- ✅ 灵活扩展（支持多数据源）

## 📦 当前架构 (SQLite)

### 文件结构
```
server/src/
├── features/markers/
│   ├── repository/
│   │   ├── marker.repository.interface.ts   ← 接口定义（不变）
│   │   └── marker.repository.prisma.ts      ← Prisma 实现（可能需要调整）
│   ├── services/
│   │   └── marker.service.ts                ← 业务逻辑（不变）
│   └── actions/
│       └── marker-actions.ts                ← Server Actions（不变）
└── lib/
    ├── prisma.ts                            ← Prisma 客户端
    └── repository-factory.ts                ← 工厂函数（需要修改）
```

### 当前配置

**prisma/schema.prisma**:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Marker {
  id          String   @id @default(cuid())
  title       String
  description String?
  latitude    Float
  longitude   Float
  images      String   @default("")  // SQLite: JSON 字符串
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**.env.local**:
```env
DATABASE_URL="file:./dev.db"
```

## 🔄 切换到 PostgreSQL

### 步骤 1: 安装 PostgreSQL

```bash
# Mac 使用 Homebrew
brew install postgresql@15

# 启动服务
brew services start postgresql@15

# 创建数据库
createdb map_production
```

### 步骤 2: 修改 Prisma Schema

**prisma/schema.prisma**:
```prisma
datasource db {
  provider = "postgresql"  // ← 改为 postgresql
  url      = env("DATABASE_URL")
}

model Marker {
  id          String   @id @default(cuid())
  title       String
  description String?
  latitude    Float
  longitude   Float
  images      String[] @default([])  // ← PostgreSQL 支持数组
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([latitude, longitude])
  @@map("markers")
}
```

### 步骤 3: 修改环境变量

**.env.local**:
```env
DATABASE_URL="postgresql://localhost:5432/map_production?schema=public"
```

### 步骤 4: 调整 Repository 实现

**server/src/features/markers/repository/marker.repository.prisma.ts**:

```typescript
// PostgreSQL 支持数组类型，无需序列化/反序列化
export class PrismaMarkerRepository implements IMarkerRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateMarkerInput): Promise<Marker> {
    return this.prisma.marker.create({
      data: {
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images || [],  // ← 直接使用数组
      },
    });
  }

  async findAll(options?: FindManyOptions): Promise<Marker[]> {
    return this.prisma.marker.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy
        ? { [options.orderBy.field]: options.orderBy.direction }
        : { createdAt: 'desc' },
    });
  }

  // ... 其他方法类似，移除 serialize/deserialize 逻辑
}
```

### 步骤 5: 运行数据迁移

```bash
# 生成迁移文件
npx prisma migrate dev --name switch_to_postgresql

# 查看迁移状态
npx prisma migrate status

# 生成 Prisma Client
npx prisma generate
```

### 步骤 6: 迁移数据（可选）

如果需要从 SQLite 迁移现有数据：

```bash
# 1. 从 SQLite 导出数据
npx prisma db pull --schema=./prisma/schema.sqlite.prisma

# 2. 使用自定义脚本迁移数据
node scripts/migrate-sqlite-to-postgres.js
```

**scripts/migrate-sqlite-to-postgres.js**:
```javascript
const { PrismaClient: SQLiteClient } = require('@prisma/client');
const { PrismaClient: PostgresClient } = require('@prisma/client');

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./dev.db' } }
});

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrate() {
  const markers = await sqlite.marker.findMany();
  
  for (const marker of markers) {
    await postgres.marker.create({
      data: {
        ...marker,
        images: JSON.parse(marker.images || '[]'),  // 转换为数组
      },
    });
  }
  
  console.log(`Migrated ${markers.length} markers`);
}

migrate()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### 步骤 7: 测试

```bash
# 运行开发服务器
npm run dev

# 测试数据库连接
npx prisma studio

# 运行测试
npm test
```

## ✅ 验证切换成功

1. **数据库连接**
   ```bash
   npx prisma studio
   # 应该看到 PostgreSQL 中的数据
   ```

2. **应用功能**
   - 创建新标记
   - 查看标记列表
   - 更新标记
   - 删除标记
   - 上传图片

3. **检查日志**
   ```bash
   # 查看 SQL 查询日志
   # 应该显示 PostgreSQL 语法
   ```

## 🔄 切换到 MySQL

类似步骤，主要修改：

**prisma/schema.prisma**:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**.env.local**:
```env
DATABASE_URL="mysql://user:password@localhost:3306/map_production"
```

## 🔄 切换到 MongoDB

MongoDB 需要更多调整，因为它是 NoSQL 数据库：

### 1. 创建新的 Repository 实现

**server/src/features/markers/repository/marker.repository.mongo.ts**:
```typescript
import { MongoClient, Db } from 'mongodb';
import { IMarkerRepository, CreateMarkerInput, UpdateMarkerInput } from './marker.repository.interface';

export class MongoMarkerRepository implements IMarkerRepository {
  private db: Db;
  private collection = 'markers';

  constructor(client: MongoClient) {
    this.db = client.db('map_production');
  }

  async create(data: CreateMarkerInput): Promise<Marker> {
    const result = await this.db.collection(this.collection).insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return this.findById(result.insertedId.toString());
  }

  // ... 实现其他接口方法
}
```

### 2. 修改 Repository Factory

**server/src/lib/repository-factory.ts**:
```typescript
import { MongoClient } from 'mongodb';
import { MongoMarkerRepository } from '../features/markers/repository/marker.repository.mongo';

const mongoClient = new MongoClient(process.env.MONGODB_URL);

export function createMarkerRepository(): IMarkerRepository {
  return new MongoMarkerRepository(mongoClient);
}
```

## 📊 数据库对比

| 特性 | SQLite | PostgreSQL | MySQL | MongoDB |
|------|--------|------------|-------|---------|
| 安装配置 | ✅ 零配置 | ⚠️ 需要安装 | ⚠️ 需要安装 | ⚠️ 需要安装 |
| 性能 | 🟢 适中 | 🟢 高 | 🟢 高 | 🟢 高 |
| 扩展性 | 🔴 单用户 | 🟢 多用户 | 🟢 多用户 | 🟢 分布式 |
| 数组支持 | 🔴 需要 JSON | 🟢 原生 | ⚠️ JSON | 🟢 原生 |
| 地理查询 | 🟡 基础 | 🟢 PostGIS | 🟡 基础 | 🟢 强大 |
| 切换成本 | - | 🟢 低 | 🟢 低 | 🟡 中 |

## 🎯 推荐方案

1. **本地开发**: SQLite ✅
   - 快速启动，无需配置

2. **生产环境（小型）**: PostgreSQL 🚀
   - 功能完整，性能好，免费

3. **生产环境（大型）**: PostgreSQL + Redis 缓存 🏆
   - 高性能，高可用

4. **地理位置为核心**: MongoDB + PostGIS ⭐
   - 强大的地理查询能力

## ❓ 常见问题

### Q1: 切换数据库后原有数据会丢失吗？
A: 如果不进行数据迁移，原有数据不会自动转移。需要使用迁移脚本转移数据。

### Q2: Repository Pattern 会影响性能吗？
A: 影响微乎其微。抽象层只是函数调用，现代 JavaScript 引擎优化得很好。

### Q3: 可以同时使用多个数据库吗？
A: 可以！Repository Pattern 支持多数据源。例如：
```typescript
const markerRepo = createMarkerRepository('postgres');
const analyticsRepo = createAnalyticsRepository('mongodb');
```

### Q4: 需要重写所有代码吗？
A: **不需要**！只需修改：
- Prisma Schema (或 ORM 配置)
- Repository 实现 (如果数据库特性不同)
- Repository Factory

业务逻辑、Service 层、Controller 层代码无需修改！

## 📝 最佳实践

1. **始终通过 Repository 接口访问数据**
   ```typescript
   // ✅ 好
   const marker = await markerRepository.findById(id);
   
   // ❌ 不好
   const marker = await prisma.marker.findUnique({ where: { id } });
   ```

2. **在 Service 层进行业务验证**
   ```typescript
   // Service 层不关心使用什么数据库
   class MarkerService {
     async createMarker(data) {
       this.validate(data);  // 业务验证
       return this.repo.create(data);  // 调用接口
     }
   }
   ```

3. **使用依赖注入方便测试**
   ```typescript
   // 测试时注入 Mock Repository
   const mockRepo = new MockMarkerRepository();
   const service = new MarkerService(mockRepo);
   ```

---

**通过良好的架构设计，数据库切换变得简单快速！** 🚀

