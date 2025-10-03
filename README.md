# Google Maps 标记应用

一个功能完整的地图标记应用，支持地址搜索、标记管理、卫星视图切换以及 2D/3D 对比视图。

## ✨ 主要功能

- 🔍 **地址搜索**: 使用 Google Places Autocomplete 搜索任意地点
- 📍 **标记管理**: 点击地图添加标记，支持文本描述和图片上传
- 🛰️ **卫星视图**: 一键切换卫星视图和普通地图
- 🌐 **2D/3D 对比**: 分屏显示 2D 卫星视图和 3D 真实感地图
- 📸 **图片上传**: 为标记添加多张图片，支持拖拽上传
- 💾 **数据持久化**: 所有标记保存到本地数据库

## 🚀 快速开始

### 前置要求

- macOS 10.15+
- Node.js 18.17+
- (可选) PostgreSQL 15+ 或使用 SQLite

### 安装

```bash
# 克隆项目
cd /Users/cocui/i100/kkMy/github/Map

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，添加你的 Google Maps API Key

# 初始化数据库
npx prisma migrate dev

# 创建上传目录
mkdir -p public/uploads

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

📖 **详细安装指南**: 查看 [LOCAL_SETUP.md](LOCAL_SETUP.md)

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14+ (App Router)
- **UI**: React 18+ + Tailwind CSS
- **地图**: Google Maps JavaScript API + 3D Tiles
- **状态管理**: Zustand / React Context
- **类型检查**: TypeScript

### 后端
- **框架**: Next.js API Routes / Server Actions
- **数据库**: SQLite (可切换到 PostgreSQL/MySQL)
- **ORM**: Prisma
- **架构模式**: Repository Pattern (数据访问层抽象)
- **文件存储**: 本地文件系统

> **架构亮点**: 采用 Repository Pattern 设计，数据访问层与业务逻辑解耦，未来可零成本切换数据库而无需修改业务代码。

### 开发工具
- **包管理**: npm / pnpm
- **代码规范**: ESLint + Prettier
- **数据验证**: Zod

## 📁 项目结构

```
Map/
├── client/              # 前端代码
│   └── src/
│       ├── app/         # Next.js 页面
│       ├── features/    # 功能模块（按业务划分）
│       │   ├── map/     # 地图功能
│       │   ├── markers/ # 标记功能
│       │   ├── search/  # 搜索功能
│       │   └── upload/  # 上传功能
│       └── components/  # 通用 UI 组件
│
├── server/              # 后端代码
│   └── src/
│       ├── features/    # 后端功能模块
│       └── api/         # API Routes
│
├── clientservershare/   # 前后端共享代码
│   ├── types/           # TypeScript 类型定义
│   ├── schemas/         # Zod 验证 Schema
│   └── constants/       # 常量定义
│
└── doc/                 # 文档
    ├── goal.md
    ├── goal2.md
    └── plan/
        └── 1.md         # 详细开发计划
```

## 🎯 功能详解

### 1. 地址搜索与定位
- 集成 Google Places Autocomplete API
- 实时搜索建议
- 自动缩放到目标位置

### 2. 标记管理
- 点击地图创建标记
- 添加标题和描述
- 上传多张图片
- 编辑和删除标记
- 标记列表查看

### 3. 视图切换
- 普通地图 / 卫星视图切换
- 2D/3D 对比模式
- 独立的缩放和平移控制

### 4. 图片上传
- 拖拽上传
- 图片预览
- 文件大小和类型验证
- 本地存储

## 📚 文档

- [详细开发计划](doc/plan/1.md) - 完整的技术方案和实施计划
- [本地开发指南](LOCAL_SETUP.md) - 详细的环境搭建步骤
- [项目目标](doc/goal.md) - 项目需求和目标

## 🧪 开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
npm run start

# 数据库管理
npx prisma studio          # 可视化数据库管理
npx prisma migrate dev     # 创建数据库迁移

# 代码检查
npm run lint
npx tsc --noEmit          # TypeScript 类型检查
```

## 📝 环境变量

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_map_id

# 数据库 - SQLite (推荐用于本地开发)
DATABASE_URL=file:./dev.db

# 文件上传
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880

# 开发环境
NODE_ENV=development
PORT=3000
```

**数据库切换**：查看 [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) 了解如何切换到 PostgreSQL 或其他数据库。

## 🔑 获取 Google Maps API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目
3. 启用以下 API:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Map Tiles API (3D 地图)
4. 创建 API Key
5. (可选) 创建 Map ID 用于 3D 功能

## 🐛 故障排查

常见问题解决方案请查看 [LOCAL_SETUP.md](LOCAL_SETUP.md) 的故障排查章节。

## 🚧 开发状态

本项目目前处于**计划阶段**，开发将在本地 Mac 环境进行。

预计开发周期：14-19 天

**当前阶段**: Phase 1 - 项目初始化

## 📈 开发计划

- [ ] Phase 1: 项目初始化 (1-2 天)
- [ ] Phase 2: 基础地图功能 (3-4 天)
- [ ] Phase 3: 标记功能 (4-5 天)
- [ ] Phase 4: 3D 功能 (3-4 天)
- [ ] Phase 5: 优化与测试 (2-3 天)
- [ ] Phase 6: 本地测试与优化 (1 天)

详细计划请查看 [开发计划文档](doc/plan/1.md)

## 🎨 架构亮点

### 1. Repository Pattern - 数据库抽象层

采用 Repository Pattern 设计模式，将数据访问逻辑与业务逻辑分离：

```
Controller → Service → Repository Interface → Repository Implementation → Database
```

**优势**：
- ✅ **数据库无关**: 业务逻辑不依赖具体数据库
- ✅ **易于切换**: 从 SQLite 切换到 PostgreSQL 只需修改配置
- ✅ **便于测试**: 可以 Mock Repository 进行单元测试
- ✅ **统一接口**: 所有数据操作通过统一的接口

**示例代码**：
```typescript
// 接口定义（永不改变）
interface IMarkerRepository {
  create(data: CreateMarkerInput): Promise<Marker>;
  findAll(): Promise<Marker[]>;
  // ...
}

// 具体实现（可替换）
class PrismaMarkerRepository implements IMarkerRepository {
  // 使用 Prisma + SQLite
}

// 业务逻辑（不受数据库影响）
class MarkerService {
  constructor(private repo: IMarkerRepository) {}
  async createMarker(data) {
    this.validate(data);  // 业务验证
    return this.repo.create(data);  // 调用接口
  }
}
```

### 2. Features 驱动开发
- 按业务功能垂直切分代码
- 高内聚低耦合
- 易于维护和扩展

### 3. 前后端代码分离
- `client/` - 前端 React 代码
- `server/` - 后端 API 和服务
- `clientservershare/` - 共享类型和验证逻辑

### 4. 类型安全
- 全栈 TypeScript
- Zod 运行时验证
- Prisma 类型安全的数据库操作

### 5. 数据库可切换性

当前使用 SQLite，未来可轻松切换到：
- PostgreSQL (3 步切换)
- MySQL (3 步切换)
- MongoDB (需要新的 Repository 实现)

**切换成本**: 业务代码 0 改动！只需修改配置和 Repository 实现。

详细切换指南: [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)

## 🤝 贡献

这是一个个人学习项目，目前不接受外部贡献。

## 📄 许可

私有项目

## 🙋 需要帮助？

查看以下资源：
- [Google Maps JavaScript API 文档](https://developers.google.com/maps/documentation/javascript)
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

**开发环境**: 全程在本地 Mac (macOS) 上开发和测试  
**最后更新**: 2025-10-03

