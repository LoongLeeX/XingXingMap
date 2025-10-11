# 数据库配置指南

## 概述

本项目支持双数据库环境：
- **本地开发**: SQLite（简单、快速、无需安装）
- **Vercel 生产**: Supabase PostgreSQL（可靠、可扩展）

## Schema 一致性

两个环境的 Schema 定义一致，只有存储细节不同：

| 字段 | SQLite | PostgreSQL | 说明 |
|------|--------|------------|------|
| `id` | TEXT | TEXT | CUID 主键 |
| `title` | TEXT | TEXT | 标记标题 |
| `description` | TEXT | TEXT | 可选描述 |
| `latitude` | REAL | DOUBLE PRECISION | 纬度 |
| `longitude` | REAL | DOUBLE PRECISION | 经度 |
| `images` | TEXT | TEXT[] | 图片URL数组* |
| `createdAt` | INTEGER | TIMESTAMP | 创建时间 |
| `updatedAt` | INTEGER | TIMESTAMP | 更新时间 |

> *重要：SQLite 存储为 JSON 字符串，PostgreSQL 存储为原生数组。Repository 层自动处理转换。

## 本地开发配置（SQLite）

### 1. Schema 配置

`prisma/schema.prisma`:

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
  
  @@index([latitude, longitude])
  @@map("markers")
}
```

### 2. 环境变量

`.env.local`:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 同步数据库 schema
npx prisma db push

# 查看数据库（可选）
npx prisma studio
```

### 4. 验证

```bash
# 检查数据库文件
ls -lh prisma/dev.db

# 查看表结构
sqlite3 prisma/dev.db ".schema markers"

# 查看数据
sqlite3 prisma/dev.db "SELECT * FROM markers;"
```

## Vercel + Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取数据库连接字符串

### 2. 生产 Schema

`prisma/schema.production.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Marker {
  id          String   @id @default(cuid())
  title       String
  description String?
  latitude    Float
  longitude   Float
  images      String[] @default([])  // PostgreSQL: 原生数组
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([latitude, longitude])
  @@map("markers")
}
```

### 3. Vercel 环境变量

在 Vercel Dashboard 设置：

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host:5432/database"
```

> 从 Supabase Dashboard -> Settings -> Database -> Connection string 获取

### 4. 部署配置

`package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate --schema=./prisma/schema.production.prisma && prisma migrate deploy --schema=./prisma/schema.production.prisma && next build"
  }
}
```

### 5. 创建 PostgreSQL Migrations

```bash
# 为生产环境创建迁移
npx prisma migrate dev --schema=./prisma/schema.production.prisma --name init

# 提交代码
git add .
git commit -m "Add PostgreSQL migrations"
git push origin main
```

Vercel 会自动运行 migrations。

## Repository 层自动适配

`PrismaMarkerRepository` 自动检测数据库类型并处理字段转换：

```typescript
class PrismaMarkerRepository {
  private isPostgreSQL(): boolean {
    const dbUrl = process.env.DATABASE_URL || '';
    return dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  }

  async create(data: CreateMarkerInput): Promise<Marker> {
    const marker = await this.prisma.marker.create({
      data: {
        ...data,
        // SQLite: 序列化为 JSON 字符串
        // PostgreSQL: 直接使用数组
        images: this.isPostgreSQL() 
          ? data.images || []
          : JSON.stringify(data.images || []),
      },
    });

    // SQLite: 反序列化 images
    // PostgreSQL: 直接返回
    return this.transformMarker(marker);
  }
}
```

## 常见问题

### Q: 数据保存成功但界面没更新？

**排查步骤：**

1. **检查控制台日志**：
   - 打开浏览器 DevTools (F12)
   - 查看 Console 标签
   - 应该看到：
     ```
     🔵 [HomePage] 创建新标记
     🔵 [createMarkerAction] 开始创建标记
     🔵 [PrismaRepository] 数据库类型: SQLite
     ✅ [PrismaRepository] 标记已保存到数据库
     ✅ [createMarkerAction] 标记创建成功
     🔄 [HomePage] 刷新标记列表
     ```

2. **验证数据库**：
   ```bash
   sqlite3 prisma/dev.db "SELECT * FROM markers ORDER BY createdAt DESC LIMIT 5;"
   ```

3. **检查 refetch**：
   - 确保 `refetch()` 被调用
   - 检查网络请求是否成功

4. **重启开发服务器**：
   ```bash
   # Ctrl+C 停止
   npm run dev
   ```

### Q: Prisma Client 缓存问题？

重新生成 Prisma Client：

```bash
npx prisma generate
```

### Q: 如何清理开发数据库？

```bash
# 删除数据库文件
rm prisma/dev.db

# 重新初始化
npx prisma db push
```

### Q: 如何在本地测试 PostgreSQL？

使用 Docker：

```bash
# 启动 PostgreSQL
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# 更新 .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"

# 使用生产 schema
npx prisma generate --schema=./prisma/schema.production.prisma
npx prisma db push --schema=./prisma/schema.production.prisma
```

### Q: Migration 失败？

```bash
# 查看 migration 状态
npx prisma migrate status --schema=./prisma/schema.production.prisma

# 重置 migrations（仅开发环境）
npx prisma migrate reset --schema=./prisma/schema.production.prisma

# 创建新 migration
npx prisma migrate dev --schema=./prisma/schema.production.prisma
```

## 切换数据库提供商

### 从 SQLite 切换到 PostgreSQL（本地开发）

1. 启动 PostgreSQL（Docker 或本地安装）
2. 更新 `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```
3. 切换 schema:
   ```bash
   cp prisma/schema.production.prisma prisma/schema.prisma
   ```
4. 重新生成并迁移:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 从 PostgreSQL 切换到 SQLite（本地开发）

1. 恢复 SQLite schema:
   ```bash
   cp prisma/schema.prisma.backup prisma/schema.prisma
   ```
2. 更新 `.env.local`:
   ```bash
   DATABASE_URL="file:./prisma/dev.db"
   ```
3. 重新生成:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 部署检查清单

- [ ] `prisma/schema.production.prisma` 存在且配置正确
- [ ] Supabase 项目已创建
- [ ] Vercel 环境变量已设置 (`DATABASE_URL`)
- [ ] `package.json` 的 `vercel-build` 脚本正确
- [ ] PostgreSQL migrations 已创建
- [ ] 代码已提交并推送
- [ ] Vercel 部署成功
- [ ] 测试生产环境的 CRUD 操作

## 相关文件

- `prisma/schema.prisma` - 本地 SQLite schema
- `prisma/schema.production.prisma` - 生产 PostgreSQL schema
- `server/src/features/markers/repository/marker.repository.prisma.ts` - 数据访问层
- `package.json` - 构建脚本
- `.env.local` - 本地环境变量
- `vercel.json` - Vercel 配置

## 总结

✅ **本地开发**: 使用 SQLite，简单快速  
✅ **生产环境**: 使用 Supabase PostgreSQL，可靠稳定  
✅ **自动适配**: Repository 层自动处理数据类型转换  
✅ **Schema 一致**: 两个环境的表结构完全一致  

如有问题，请查看控制台日志或参考本文档的常见问题部分。
