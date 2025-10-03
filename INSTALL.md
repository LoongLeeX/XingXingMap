# 安装指南

## 快速开始

### 1. 安装依赖

```bash
cd /Users/cocui/i100/kkMy/github/Map

# 安装 Node.js 依赖
npm install

# 或使用 pnpm (推荐，更快)
# npm install -g pnpm
# pnpm install
```

### 2. 配置 Google Maps API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下 API:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Map Tiles API (用于 3D 地图)

4. 创建 API Key（建议添加 HTTP referrers 限制）

5. (可选) 创建 Map ID 用于 3D 功能:
   - 前往 [Map Management](https://console.cloud.google.com/google/maps-apis/studio/maps)
   - 创建新的 Map ID
   - 启用 "Photorealistic 3D Tiles"

### 3. 配置环境变量

编辑 `.env.local` 文件，填入你的 API Key:

```env
# 必需：Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的_API_KEY_这里

# 可选：3D 地图 Map ID（如果不使用 3D 功能可以留空）
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=你的_MAP_ID_这里

# 数据库配置（默认使用 SQLite）
DATABASE_URL="file:./dev.db"

# 其他配置（使用默认值即可）
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
NODE_ENV=development
PORT=3000
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库和表
npx prisma db push

# 或使用 migrate（推荐用于生产环境）
# npx prisma migrate dev --name init
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用应用！

## 验证安装

### 检查项目

1. **Google Maps 是否正常加载**
   - 打开浏览器控制台，不应有 API Key 错误
   - 地图应正常显示

2. **数据库连接**
   ```bash
   # 打开 Prisma Studio 查看数据库
   npx prisma studio
   ```
   访问 http://localhost:5555

3. **功能测试**
   - ✅ 地图可以拖动和缩放
   - ✅ 搜索栏可以搜索地址
   - ✅ 点击地图可以添加标记
   - ✅ 切换地图类型（地图/卫星）
   - ✅ 切换视图模式（2D/3D/分屏）

## 常见问题

### 问题 1: Google Maps 不显示

**原因**: API Key 未配置或配置错误

**解决方案**:
```bash
# 检查环境变量
cat .env.local | grep GOOGLE_MAPS

# 确保 API Key 已正确填入
# 检查 Google Cloud Console 中 API 是否已启用
```

### 问题 2: 3D 地图不工作

**原因**: Map ID 未配置或该地区不支持 3D

**解决方案**:
- 配置 `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`
- 在 Google Cloud Console 中为 Map ID 启用 3D Tiles
- 注意：3D 地图仅在部分城市可用

### 问题 3: 数据库错误

```bash
# 重置数据库
rm dev.db
npx prisma db push

# 或使用 migrate
npx prisma migrate reset
```

### 问题 4: TypeScript 错误

```bash
# 重新生成 Prisma Client
npx prisma generate

# 类型检查
npx tsc --noEmit
```

### 问题 5: 端口被占用

```bash
# 更改端口
PORT=3001 npm run dev

# 或查找占用 3000 端口的进程
lsof -i :3000
```

## 数据库管理

### 查看数据

```bash
# 使用 Prisma Studio（推荐）
npx prisma studio

# 或使用 SQLite CLI
sqlite3 dev.db
.tables
.schema markers
SELECT * FROM markers;
```

### 备份数据

```bash
# SQLite 数据库只是一个文件
cp dev.db dev.db.backup
```

### 切换到 PostgreSQL

如果你想切换到 PostgreSQL：

1. 安装 PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
createdb map_dev
```

2. 修改 `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"  // 从 "sqlite" 改为 "postgresql"
  url      = env("DATABASE_URL")
}

model Marker {
  // 将 images 字段改为数组类型
  images  String[]  @default([])
}
```

3. 修改 `.env.local`
```env
DATABASE_URL="postgresql://localhost:5432/map_dev?schema=public"
```

4. 运行迁移
```bash
npx prisma migrate dev
```

## 开发工具

### VS Code 扩展（推荐）

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

### 有用的命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据库
npx prisma studio        # 可视化数据库管理
npx prisma generate      # 生成 Prisma Client
npx prisma db push       # 同步数据库（开发）
npx prisma migrate dev   # 创建迁移（生产推荐）

# 代码质量
npm run lint             # 运行 ESLint
npx tsc --noEmit        # TypeScript 类型检查
```

## 下一步

- 阅读 [README.md](README.md) 了解项目架构
- 查看 [doc/plan/1.md](doc/plan/1.md) 了解详细技术方案
- 开始添加标记和探索功能！

## 需要帮助？

- [Google Maps JavaScript API 文档](https://developers.google.com/maps/documentation/javascript)
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

