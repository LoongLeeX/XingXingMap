# 项目架构文档

本文档详细说明了项目的技术架构和设计决策。

## 🎯 核心设计理念

### 1. 数据库无关性 (Database Agnostic)

通过 **Repository Pattern** 实现数据访问层抽象，确保业务逻辑与具体数据库实现解耦。

```
┌─────────────────────────────────────────────────┐
│           Client Components                      │
│         (React, UI Logic)                        │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│        Server Actions / API Routes               │
│      (Next.js Server Components)                 │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│           Service Layer                          │
│     (Business Logic, Validation)                 │
│     ← 与数据库无关，纯业务逻辑                   │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│       Repository Interface                       │
│     (IMarkerRepository, etc.)                    │
│     ← 接口定义，永不改变                        │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│     Repository Implementation                    │
│   (PrismaMarkerRepository, etc.)                 │
│     ← 可替换的具体实现                          │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│           Database Layer                         │
│   SQLite / PostgreSQL / MySQL / MongoDB         │
│     ← 可切换的数据存储                          │
└─────────────────────────────────────────────────┘
```

**关键优势**：
- ✅ 更换数据库无需修改业务代码
- ✅ 易于编写单元测试（Mock Repository）
- ✅ 支持多数据源
- ✅ 统一的数据访问接口

### 2. Features 驱动开发 (Feature-Driven Development)

按业务功能垂直切分代码，每个 Feature 包含完整的前后端逻辑。

```
features/
├── markers/              # 标记功能
│   ├── components/       # UI 组件
│   ├── hooks/            # React Hooks
│   ├── api/              # API 调用
│   ├── services/         # 业务逻辑
│   ├── repository/       # 数据访问
│   └── actions/          # Server Actions
│
├── search/               # 搜索功能
│   └── ...
│
└── upload/               # 上传功能
    └── ...
```

**好处**：
- ✅ 高内聚：相关代码都在一起
- ✅ 低耦合：功能之间相互独立
- ✅ 易维护：修改功能只需关注对应目录
- ✅ 易扩展：新功能创建新目录即可
- ✅ 易删除：删除功能直接删除目录

## 📦 技术栈详解

### 前端技术栈

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| Next.js | 14+ | 全栈框架 | App Router, Server Actions, 优秀的开发体验 |
| React | 18+ | UI 库 | 最流行的前端框架，生态丰富 |
| TypeScript | 5+ | 类型系统 | 类型安全，减少运行时错误 |
| Tailwind CSS | 3+ | CSS 框架 | 快速构建现代 UI，高度可定制 |
| Zustand | 4+ | 状态管理 | 轻量级，简单易用，性能好 |
| React Hook Form | 7+ | 表单管理 | 高性能表单处理 |
| Zod | 3+ | 数据验证 | 类型安全的运行时验证 |

### 后端技术栈

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| Next.js API Routes | 14+ | API 服务 | 与前端集成紧密 |
| Server Actions | - | 服务端逻辑 | 简化前后端交互 |
| Prisma | 5+ | ORM | 类型安全，支持多数据库 |
| SQLite | 3+ | 数据库 | 零配置，易于开发 |

### 数据库方案

**当前**: SQLite
- ✅ 零配置
- ✅ 文件数据库，易于备份
- ✅ 性能足够

**未来可选**: PostgreSQL, MySQL, MongoDB
- 通过 Repository Pattern 轻松切换
- 业务代码无需修改

## 🏗️ 核心模块设计

### 1. Marker 模块 (标记管理)

#### 数据模型
```typescript
interface Marker {
  id: string;              // 唯一标识
  title: string;           // 标题
  description?: string;    // 描述
  latitude: number;        // 纬度
  longitude: number;       // 经度
  images: string[];        // 图片数组
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
}
```

#### 接口设计
```typescript
interface IMarkerRepository {
  create(data: CreateMarkerInput): Promise<Marker>;
  findAll(options?: FindManyOptions): Promise<Marker[]>;
  findById(id: string): Promise<Marker | null>;
  update(id: string, data: UpdateMarkerInput): Promise<Marker>;
  delete(id: string): Promise<void>;
  findByBounds(bounds: MapBounds): Promise<Marker[]>;
  search(keyword: string): Promise<Marker[]>;
  count(): Promise<number>;
}
```

#### 业务逻辑
```typescript
class MarkerService {
  constructor(private repo: IMarkerRepository) {}
  
  async createMarker(data: CreateMarkerInput) {
    // 1. 业务验证
    this.validateMarkerData(data);
    
    // 2. 调用 Repository
    return this.repo.create(data);
  }
  
  // ... 其他业务方法
}
```

### 2. Upload 模块 (文件上传)

#### 功能
- 图片上传到本地文件系统
- 文件类型和大小验证
- 图片压缩和优化
- 支持拖拽上传

#### 存储位置
```
public/uploads/
├── 2025/
│   └── 10/
│       ├── image-abc123.jpg
│       └── image-def456.png
```

### 3. Search 模块 (地址搜索)

#### 功能
- Google Places Autocomplete
- 地理编码 (地址 → 坐标)
- 反向地理编码 (坐标 → 地址)
- 搜索历史

## 🔧 开发流程

### 添加新功能的流程

以添加"标记分类"功能为例：

#### 1. 定义数据模型

**prisma/schema.prisma**:
```prisma
model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String?
  createdAt DateTime @default(now())
}
```

#### 2. 创建 Repository 接口

**server/src/features/categories/repository/category.repository.interface.ts**:
```typescript
export interface ICategoryRepository {
  create(data: CreateCategoryInput): Promise<Category>;
  findAll(): Promise<Category[]>;
  // ...
}
```

#### 3. 实现 Repository

**server/src/features/categories/repository/category.repository.prisma.ts**:
```typescript
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: CreateCategoryInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }
  // ...
}
```

#### 4. 创建 Service

**server/src/features/categories/services/category.service.ts**:
```typescript
export class CategoryService {
  constructor(private repo: ICategoryRepository) {}
  
  async createCategory(data: CreateCategoryInput) {
    this.validateCategoryData(data);
    return this.repo.create(data);
  }
  // ...
}
```

#### 5. 创建 Server Actions

**server/src/features/categories/actions/category-actions.ts**:
```typescript
'use server';

export async function createCategoryAction(data: CreateCategoryInput) {
  try {
    const category = await categoryService.createCategory(data);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### 6. 创建前端组件

**client/src/features/categories/components/CategoryForm.tsx**:
```typescript
'use client';

export function CategoryForm() {
  const handleSubmit = async (data) => {
    const result = await createCategoryAction(data);
    if (result.success) {
      // 成功处理
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 切换数据库的流程

详见 [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)

## 📐 设计模式

### 1. Repository Pattern (数据访问层)
- **目的**: 抽象数据访问逻辑
- **优势**: 数据库无关，易于测试
- **实现**: 接口 + 具体实现

### 2. Service Layer Pattern (业务逻辑层)
- **目的**: 封装业务规则
- **优势**: 复用业务逻辑，统一验证
- **实现**: Service 类调用 Repository

### 3. Factory Pattern (对象创建)
- **目的**: 统一创建 Repository 实例
- **优势**: 切换实现只需修改工厂
- **实现**: RepositoryContainer

### 4. Dependency Injection (依赖注入)
- **目的**: 解耦依赖关系
- **优势**: 易于测试和替换
- **实现**: Constructor Injection

## 🧪 测试策略

### 单元测试
```typescript
// 使用 Mock Repository 测试 Service
describe('MarkerService', () => {
  it('should create marker', async () => {
    const mockRepo = {
      create: jest.fn().mockResolvedValue(mockMarker),
    };
    
    const service = new MarkerService(mockRepo as any);
    const result = await service.createMarker(mockData);
    
    expect(mockRepo.create).toHaveBeenCalledWith(mockData);
    expect(result).toEqual(mockMarker);
  });
});
```

### 集成测试
```typescript
// 使用真实数据库测试 Repository
describe('PrismaMarkerRepository', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  
  it('should create marker in database', async () => {
    const repo = new PrismaMarkerRepository(prisma);
    const marker = await repo.create(mockData);
    
    expect(marker.id).toBeDefined();
    expect(marker.title).toBe(mockData.title);
  });
});
```

## 📊 性能优化

### 1. 数据库层面
- ✅ 索引优化 (`@@index([latitude, longitude])`)
- ✅ 查询优化 (使用 Prisma 的查询优化)
- ✅ 连接池管理

### 2. 应用层面
- ✅ Server Components (减少客户端 JS)
- ✅ 图片懒加载
- ✅ 代码分割
- ✅ 缓存策略

### 3. 地图层面
- ✅ 标记聚类
- ✅ 按视窗加载标记
- ✅ 节流和防抖

## 🔐 安全考虑

### 1. 数据验证
- ✅ Zod Schema 验证
- ✅ Service 层业务验证
- ✅ SQL 注入防护 (Prisma ORM)

### 2. 文件上传安全
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 文件名清理

### 3. API 安全
- ✅ 错误处理
- ✅ 日志记录
- ✅ (未来) 认证授权

## 📚 相关文档

- [详细开发计划](doc/plan/1.md)
- [本地环境搭建](LOCAL_SETUP.md)
- [数据库切换指南](DATABASE_MIGRATION_GUIDE.md)
- [项目 README](README.md)

## 🎓 学习资源

### Repository Pattern
- [Martin Fowler - Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**通过良好的架构设计，确保代码的可维护性、可扩展性和可测试性！** 🏗️

