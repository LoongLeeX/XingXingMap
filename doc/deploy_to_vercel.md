# 项目部署到 Vercel 需求

## 项目背景
请分析 `/Users/cocui/i100/kkMy/github/Map` 项目的代码结构和配置。

## 当前状态
- ✅ 项目可以在本地成功部署和运行
- ✅ 本地开发环境已验证通过
- ✅ 使用 Next.js + Prisma + SQLite/PostgreSQL 技术栈
- ✅ 集成了 Google Maps API（2D/3D 地图功能）

## 部署目标
需要为项目添加 Vercel 部署配置，实现以下目标：

### 主要需求
1. **Vercel 部署支持**
   - 添加必要的 Vercel 配置文件（`vercel.json`）
   - 配置环境变量管理（本地 vs 生产环境）
   - 配置数据库连接（生产环境使用云数据库，如 Vercel Postgres 或其他）
   - 配置文件上传路径（生产环境文件存储方案）

2. **保留本地开发能力**
   - 确保本地开发环境不受影响
   - 维持现有的 `npm run dev` 开发流程
   - 本地继续使用 SQLite 或本地 PostgreSQL
   - 环境变量自动切换机制

3. **环境分离**
   - 开发环境（development）- 本地
   - 生产环境（production）- Vercel
   - 明确区分不同环境的配置和依赖

### 技术要求
- 不破坏现有功能和代码结构
- 使用环境变量管理敏感信息（API keys、数据库连接等）
- 提供清晰的部署文档和步骤说明
- 考虑数据库迁移策略（Prisma migrations）

### 交付物
1. Vercel 配置文件
2. 环境变量配置说明文档
3. 生产环境数据库配置方案
4. 部署步骤文档（step-by-step）
5. 常见问题解决方案（troubleshooting）

## 注意事项
- Google Maps API key 需要在 Vercel 环境变量中配置
- 文件上传功能可能需要调整（本地文件系统 vs 云存储）
- 数据库连接池配置（serverless 环境下的最佳实践）
- 构建和运行时依赖的正确配置

---

## ✅ 任务完成状态

### 已完成的配置文件

1. **vercel.json** - Vercel 部署配置文件
   - 构建命令配置
   - 环境变量设置
   - 函数超时配置
   - CORS 头配置

2. **.env.example** - 环境变量示例文件
   - 包含所有必需和可选的环境变量
   - 详细的注释说明
   - 开发和生产环境配置

3. **prisma/schema.prisma** - 数据库 Schema（已更新）
   - ✅ 支持 PostgreSQL（生产环境）
   - ✅ 支持 SQLite（本地开发）
   - ✅ Vercel Postgres 连接池配置
   - ✅ 数组类型支持（images 字段）

4. **package.json** - 构建脚本（已更新）
   - ✅ `postinstall` - 自动生成 Prisma Client
   - ✅ `vercel-build` - Vercel 专用构建脚本
   - ✅ `prisma:migrate:deploy` - 生产环境迁移脚本

### 已完成的文档

1. **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - 完整部署指南（✅ 已创建）
   - 前置准备和账号设置
   - 详细的部署步骤（Dashboard 和 CLI 两种方式）
   - 数据库配置（Vercel Postgres + 其他选项）
   - 环境变量完整配置
   - 数据库迁移策略
   - 常见问题解决方案
   - 性能优化建议
   - 监控和日志
   - 更新和回滚流程

2. **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - 环境变量配置指南（✅ 已创建）
   - 完整的环境变量清单
   - 本地开发环境配置步骤
   - Vercel 生产环境配置步骤
   - Google Maps API Key 获取和配置
   - 环境变量管理最佳实践
   - 调试和故障排除
   - 安全建议

3. **[FILE_UPLOAD_STRATEGY.md](./FILE_UPLOAD_STRATEGY.md)** - 文件上传策略（✅ 已创建）
   - 云存储方案对比（Vercel Blob、Cloudinary、Supabase、AWS S3）
   - 每种方案的详细实施步骤
   - 完整的代码示例
   - 成本估算和对比
   - 迁移现有代码的指南
   - 开发环境处理方案

4. **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - 5 分钟快速部署（✅ 已创建）
   - 最精简的部署步骤
   - 必需配置清单
   - 快速验证方法
   - 常见问题快速解决

---

## 📂 项目文件结构（新增）

```
Map/
├── vercel.json                          # ✅ Vercel 配置文件（新增）
├── .env.example                         # ✅ 环境变量示例（新增）
├── package.json                         # ✅ 已更新构建脚本
├── prisma/
│   └── schema.prisma                    # ✅ 已更新支持 PostgreSQL
├── doc/
│   ├── deploy_to_vercel.md            # 本文件（需求文档）
│   ├── VERCEL_DEPLOYMENT.md           # ✅ 完整部署指南（新增）
│   ├── VERCEL_QUICK_START.md          # ✅ 快速开始指南（新增）
│   ├── ENVIRONMENT_VARIABLES.md       # ✅ 环境变量指南（新增）
│   └── FILE_UPLOAD_STRATEGY.md        # ✅ 文件上传策略（新增）
└── ...
```

---

## 🚀 下一步行动

### 立即可以做的事情

1. **快速部署**（5 分钟）
   ```bash
   # 阅读快速开始指南
   cat doc/VERCEL_QUICK_START.md
   
   # 推送代码到 GitHub
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   
   # 访问 Vercel Dashboard 开始部署
   # https://vercel.com/new
   ```

2. **详细部署**（20 分钟）
   - 阅读 [完整部署指南](./VERCEL_DEPLOYMENT.md)
   - 按步骤配置所有内容
   - 设置监控和分析

3. **配置文件上传**（可选，30-60 分钟）
   - 阅读 [文件上传策略](./FILE_UPLOAD_STRATEGY.md)
   - 选择适合的云存储方案
   - 实施文件上传功能

---

## 📊 配置对比

### 本地开发 vs 生产环境

| 配置项 | 本地开发 | Vercel 生产 |
|--------|----------|-------------|
| 数据库 | SQLite (`file:./prisma/dev.db`) | PostgreSQL (Vercel Postgres) |
| 文件上传 | 本地文件系统 (`/public/uploads/`) | 云存储 (Vercel Blob/Cloudinary) |
| API Key | 开发 Key（localhost 限制） | 生产 Key（域名限制） |
| 构建命令 | `npm run dev` | `npm run vercel-build` |
| 环境变量 | `.env.local` | Vercel Dashboard |

---

## 🎯 关键改动说明

### 1. 数据库 Schema 改动

**变更**：`images` 字段类型
```prisma
# 旧版本（SQLite）
images String @default("")

# 新版本（PostgreSQL）
images String[] @default([])
```

**影响**：
- ✅ 本地开发：需要重新运行 `npx prisma migrate dev`
- ✅ 生产环境：自动处理（通过 `vercel-build` 脚本）

**迁移方法**：
```bash
# 本地开发环境
npx prisma migrate dev --name update_images_to_array

# 如果遇到问题，可以重置数据库（⚠️ 会清空数据）
npx prisma migrate reset
```

### 2. 构建脚本改动

**新增脚本**：
```json
{
  "postinstall": "prisma generate",
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
}
```

**作用**：
- `postinstall`: 确保 Prisma Client 在安装后自动生成
- `vercel-build`: Vercel 部署时的自动构建流程

### 3. 环境变量改动

**新增必需变量**（生产环境）：
```bash
DATABASE_URL=${POSTGRES_PRISMA_URL}
POSTGRES_URL_NON_POOLING  # 由 Vercel Postgres 自动注入
```

---

## 📝 TODO：可选的后续优化

### 短期优化（可选）

- [ ] 实施文件上传功能（使用 Vercel Blob 或 Cloudinary）
- [ ] 添加 Vercel Analytics（监控应用性能）
- [ ] 配置自定义域名
- [ ] 设置 GitHub 自动部署工作流

### 长期优化（可选）

- [ ] 添加用户认证（NextAuth.js）
- [ ] 实施 API 速率限制
- [ ] 添加服务端缓存（Redis）
- [ ] 配置 CDN 加速静态资源
- [ ] 实施数据库备份策略

---

## 📚 相关文档索引

### 核心文档
- [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) - 5 分钟快速部署
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 完整部署指南
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - 环境变量配置
- [FILE_UPLOAD_STRATEGY.md](./FILE_UPLOAD_STRATEGY.md) - 文件上传策略

### 项目文档
- [README.md](../README.md) - 项目概述
- [QUICK_START.md](../QUICK_START.md) - 本地快速开始
- [USAGE.md](../USAGE.md) - 使用说明
- [TROUBLESHOOTING_3D.md](../TROUBLESHOOTING_3D.md) - 3D 地图故障排除

### 架构文档
- [plan/ARCHITECTURE.md](./plan/ARCHITECTURE.md) - 架构设计
- [plan/LOCAL_SETUP.md](./plan/LOCAL_SETUP.md) - 本地开发环境
- [plan/DATABASE_MIGRATION_GUIDE.md](./plan/DATABASE_MIGRATION_GUIDE.md) - 数据库迁移

---

## ✅ 总结

所有 Vercel 部署所需的配置文件和文档已全部完成：

1. ✅ **vercel.json** - 部署配置
2. ✅ **.env.example** - 环境变量模板
3. ✅ **Prisma Schema** - 支持 PostgreSQL
4. ✅ **Package.json** - 构建脚本
5. ✅ **完整部署指南** - 详细的部署步骤
6. ✅ **环境变量指南** - 配置说明
7. ✅ **文件上传策略** - 云存储方案
8. ✅ **快速开始指南** - 5 分钟部署

**项目现在已经完全准备好部署到 Vercel！** 🎉

**建议下一步**：
1. 阅读 [快速开始指南](./VERCEL_QUICK_START.md)
2. 访问 https://vercel.com/new
3. 导入 GitHub 仓库
4. 按照指南配置环境变量
5. 点击部署！

---

**祝部署顺利！🚀**
