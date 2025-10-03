# 本地 Mac 开发环境搭建指南

本指南专为在 macOS 上进行本地开发和测试而设计。

## 📋 系统要求

- macOS 10.15 或更高版本
- Node.js 18.17+ 或 20.0+
- npm 9+ 或 pnpm 8+
- SQLite (Node.js 内置支持，无需额外安装)

> **数据库方案**: 本项目使用 **SQLite**，通过 **Repository Pattern** 封装数据访问层，未来可轻松切换到 PostgreSQL、MySQL 等其他数据库，无需修改业务逻辑代码。

## 🚀 快速开始

### 1. 安装必要工具

```bash
# 安装 Homebrew (如果还没安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 验证安装
node --version  # 应该显示 v18 或更高
npm --version

# (可选但推荐) 安装 pnpm
npm install -g pnpm
```

### 2. 数据库方案：SQLite

本项目使用 **SQLite** 作为数据库，优势：

✅ **零配置**：无需额外安装数据库服务  
✅ **文件数据库**：所有数据存储在 `dev.db` 文件中  
✅ **易于备份**：只需复制数据库文件  
✅ **性能足够**：满足本地开发和中小型应用需求  
✅ **可切换**：通过 Repository Pattern 封装，未来可无缝切换到其他数据库

#### 数据库架构设计

```
业务逻辑 (Service)
       ↓
接口定义 (IMarkerRepository)
       ↓
具体实现 (PrismaMarkerRepository)
       ↓
数据库 (SQLite / PostgreSQL / MySQL)
```

**好处**：切换数据库时，只需修改配置和 Repository 实现，业务逻辑代码无需改动！

### 3. 克隆和配置项目

```bash
# 进入项目目录
cd /Users/cocui/i100/kkMy/github/Map

# 安装项目依赖
npm install
# 或使用 pnpm (更快)
pnpm install
```

### 4. 配置环境变量

创建 `.env.local` 文件：

```bash
# 复制环境变量模板
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的配置：

```env
# Google Maps API Key (必填)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_Key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=你的_3D_Map_ID

# 数据库配置 (选择其一)
# SQLite (简单)
DATABASE_URL=file:./dev.db

# PostgreSQL (高级)
# DATABASE_URL=postgresql://localhost:5432/map_dev?schema=public

# 文件上传配置
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# 应用配置
NODE_ENV=development
PORT=3000
```

#### 如何获取 Google Maps API Key？

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下 API：
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Map Tiles API (用于 3D 地图)
4. 创建 API Key (凭据 → 创建凭据 → API 密钥)
5. (可选) 创建 Map ID (地图管理 → 地图 ID)

### 5. 初始化数据库

```bash
# 运行数据库迁移
npx prisma migrate dev

# 生成 Prisma Client
npx prisma generate

# (可选) 查看数据库
npx prisma studio
```

### 6. 创建上传目录

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 7. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

✅ 打开浏览器访问: [http://localhost:3000](http://localhost:3000)

## 🔧 常用命令

```bash
# 开发服务器
npm run dev              # 启动开发服务器 (热重载)

# 构建和生产
npm run build            # 构建生产版本
npm run start            # 运行生产版本

# 数据库
npx prisma studio        # 打开数据库可视化界面 (http://localhost:5555)
npx prisma migrate dev   # 创建新的数据库迁移
npx prisma db push       # 快速同步数据库 (开发时)
npx prisma generate      # 重新生成 Prisma Client

# 代码质量
npm run lint             # 运行 ESLint
npm run format           # 格式化代码 (如果配置了 Prettier)
npx tsc --noEmit         # TypeScript 类型检查
```

## 📁 项目结构

```
Map/
├── client/              # 前端代码
│   └── src/
│       ├── app/         # Next.js App Router
│       ├── features/    # 功能模块 (map, markers, search)
│       └── components/  # 通用 UI 组件
│
├── server/              # 后端代码
│   └── src/
│       ├── features/    # 后端功能模块
│       └── api/         # API Routes
│
├── clientservershare/   # 共享代码
│   ├── types/           # TypeScript 类型
│   └── schemas/         # Zod 验证 Schema
│
├── public/              # 静态资源
│   └── uploads/         # 上传的图片
│
├── prisma/              # 数据库配置
│   └── schema.prisma
│
└── .env.local           # 本地环境变量 (不提交到 Git)
```

## 🐛 故障排查

### 问题 1: Google Maps 不显示

```bash
# 1. 检查 API Key 是否正确配置
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# 2. 查看浏览器控制台错误
# 打开 Chrome DevTools (F12) → Console 标签

# 3. 验证 API 是否启用
# 访问 Google Cloud Console 检查已启用的 API
```

### 问题 2: 数据库连接失败

**SQLite**:
```bash
# 检查数据库文件
ls -la dev.db

# 重新初始化
rm dev.db
npx prisma migrate dev
```

**PostgreSQL**:
```bash
# 检查服务状态
brew services list

# 重启服务
brew services restart postgresql@15

# 检查数据库是否存在
psql -l | grep map_dev

# 重新创建数据库
dropdb map_dev
createdb map_dev
npx prisma migrate dev
```

### 问题 3: 端口被占用

```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者使用其他端口
PORT=3001 npm run dev
```

### 问题 4: 图片上传失败

```bash
# 检查目录是否存在
ls -la public/uploads

# 检查权限
chmod 755 public/uploads

# 如果目录不存在，创建它
mkdir -p public/uploads
```

### 问题 5: Prisma Client 错误

```bash
# 重新生成 Prisma Client
npx prisma generate

# 清除 node_modules 重新安装
rm -rf node_modules
npm install
```

## 💡 开发技巧

### 1. 使用 Prisma Studio 查看数据

```bash
npx prisma studio
```
在浏览器打开 http://localhost:5555，可视化管理数据库

### 2. 查看上传的图片

- 图片存储位置: `public/uploads/`
- 访问 URL: `http://localhost:3000/uploads/filename.jpg`

### 3. Chrome DevTools 调试

- **Elements**: 检查 DOM 结构
- **Console**: 查看错误和日志
- **Network**: 监控 API 请求
- **Application**: 查看 LocalStorage、Cookies
- 安装 React Developer Tools 扩展

### 4. Next.js 开发特性

- **热重载**: 修改代码自动刷新浏览器
- **Fast Refresh**: React 组件保持状态刷新
- **错误提示**: 详细的错误堆栈信息

### 5. 使用 nvm 管理 Node 版本

```bash
# 安装 nvm
brew install nvm

# 安装 Node 20
nvm install 20
nvm use 20

# 设置默认版本
nvm alias default 20
```

## 📝 最佳实践

1. **使用 SQLite 快速开发**: 初期开发无需配置数据库
2. **定期提交代码**: 使用 Git 保护开发成果
3. **不要提交敏感信息**: `.env.local` 已在 `.gitignore` 中
4. **定期备份数据**: 备份 `dev.db` 或使用 `pg_dump`
5. **使用 TypeScript 严格模式**: 提高代码质量

## 🔐 安全注意事项

1. ⚠️ 永远不要将 `.env.local` 提交到 Git
2. ⚠️ 不要在客户端代码中暴露 API Secret
3. ⚠️ Google Maps API Key 建议设置使用限制
4. ⚠️ 定期轮换 API Key

## 📚 推荐的 VS Code 扩展

- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Tailwind CSS IntelliSense**: Tailwind 智能提示
- **Prisma**: Prisma Schema 语法支持
- **React Developer Tools**: React 调试
- **Thunder Client**: API 测试

## 🎯 下一步

查看 [开发计划文档](doc/plan/1.md) 了解详细的功能实现计划。

---

**需要帮助？** 

- [Google Maps JavaScript API 文档](https://developers.google.com/maps/documentation/javascript)
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

**最后更新**: 2025-10-03

