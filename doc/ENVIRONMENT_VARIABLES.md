# 🔐 环境变量配置指南

本文档详细说明项目所需的所有环境变量及其配置方法。

## 📋 环境变量清单

### 必需变量

| 变量名 | 环境 | 描述 | 示例值 |
|--------|------|------|--------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 全部 | Google Maps API 密钥 | `AIzaSyC...` |
| `DATABASE_URL` | 全部 | 数据库连接字符串 | `postgresql://...` 或 `file:./prisma/dev.db` |
| `NODE_ENV` | 全部 | 运行环境 | `development` / `production` |

### 可选变量

| 变量名 | 环境 | 描述 | 默认值 |
|--------|------|------|--------|
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | 全部 | 3D 地图 Map ID | - |
| `POSTGRES_URL_NON_POOLING` | 生产 | PostgreSQL 直连 URL（Vercel Postgres） | - |
| `PORT` | 开发 | 本地服务器端口 | `3000` |
| `UPLOAD_DIR` | 开发 | 文件上传目录 | `./public/uploads` |
| `MAX_FILE_SIZE` | 全部 | 最大文件大小（字节） | `5242880` (5MB) |

---

## 🏠 本地开发环境配置

### 1. 创建 `.env.local` 文件

```bash
# 复制示例文件
cp .env.example .env.local

# 或手动创建
touch .env.local
```

### 2. 填写必需的变量

```bash
# .env.local

# Google Maps API（必需）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_Key

# 数据库（本地开发使用 SQLite）
DATABASE_URL="file:./prisma/dev.db"

# 环境
NODE_ENV=development

# 可选：3D 地图
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=你的_Map_ID

# 本地开发配置
PORT=3000
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

### 3. 获取 Google Maps API Key

1. **访问 Google Cloud Console**
   - 地址：https://console.cloud.google.com/

2. **创建或选择项目**
   - 点击顶部的项目选择器
   - 创建新项目或选择现有项目

3. **启用必需的 API**
   ```
   APIs & Services → Library → 搜索并启用：
   ✓ Maps JavaScript API
   ✓ Places API
   ✓ Geocoding API
   ```

4. **创建 API Key**
   ```
   APIs & Services → Credentials → Create Credentials → API Key
   ```

5. **配置 API Key 限制**（重要！）
   ```
   点击创建的 API Key → Edit：
   
   应用限制:
   - 选择 "HTTP referrers"
   - 添加网站限制：
     * http://localhost:3000/*
     * http://127.0.0.1:3000/*
   
   API 限制:
   - 选择 "Restrict key"
   - 选择：
     ✓ Maps JavaScript API
     ✓ Places API
     ✓ Geocoding API
   ```

6. **复制 API Key**
   - 复制生成的 Key
   - 粘贴到 `.env.local` 中的 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4. 验证配置

```bash
# 运行开发服务器
npm run dev

# 访问 http://localhost:3000
# 检查地图是否正常加载
```

---

## ☁️ Vercel 生产环境配置

### 1. 访问 Vercel Dashboard

```
登录 Vercel → 选择项目 → Settings → Environment Variables
```

### 2. 添加生产环境变量

#### 必需变量

1. **Google Maps API Key**
   ```
   Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   Value: 你的生产环境API Key（应该与本地不同）
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

2. **数据库 URL**
   ```
   方式一：使用 Vercel Postgres（推荐）
   - 创建 Postgres 数据库后自动添加
   - DATABASE_URL 会自动设置为 ${POSTGRES_PRISMA_URL}
   
   方式二：手动添加
   Name: DATABASE_URL
   Value: postgresql://user:password@host:5432/database
   Environments: ✓ Production ✓ Preview
   ```

3. **Node 环境**
   ```
   Name: NODE_ENV
   Value: production
   Environments: ✓ Production
   ```

#### 可选变量

4. **3D 地图 Map ID**
   ```
   Name: NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
   Value: 你的_Map_ID
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

### 3. 配置生产环境的 Google Maps API Key

⚠️ **重要**：生产环境应使用独立的 API Key，配置不同的限制。

1. **创建生产环境专用 API Key**
   ```
   在 Google Cloud Console 创建新的 API Key
   ```

2. **配置生产环境限制**
   ```
   应用限制:
   - 选择 "HTTP referrers"
   - 添加生产域名：
     * https://your-app.vercel.app/*
     * https://*.vercel.app/*（用于 Preview 部署）
   
   API 限制:
   - 选择 "Restrict key"
   - 选择所需的 API
   ```

3. **设置使用配额**（可选但推荐）
   ```
   APIs & Services → Quotas
   设置每日请求限制，避免意外费用
   ```

### 4. Vercel Postgres 环境变量

如果使用 Vercel Postgres，以下变量会自动创建：

```bash
# 自动创建的变量（无需手动设置）
POSTGRES_URL              # 连接池 URL
POSTGRES_URL_NON_POOLING  # 直连 URL（用于迁移）
POSTGRES_PRISMA_URL       # Prisma 专用 URL
POSTGRES_USER             # 数据库用户名
POSTGRES_PASSWORD         # 数据库密码
POSTGRES_DATABASE         # 数据库名称
POSTGRES_HOST             # 数据库主机
```

**推荐配置**：
```bash
# 手动设置（指向 Prisma URL）
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

---

## 🔄 环境变量管理最佳实践

### 1. 使用不同的 API Key

```bash
# 开发环境
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=dev_key_with_localhost_restriction

# 生产环境
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=prod_key_with_domain_restriction
```

**原因**：
- 安全性：限制 Key 的使用范围
- 配额管理：分别跟踪开发和生产使用量
- 调试：容易识别请求来源

### 2. 使用 `.env` 文件层级

```
.env                 # 公共默认值（可提交到 Git）
.env.local           # 本地覆盖（不提交）
.env.development     # 开发环境（可提交）
.env.production      # 生产环境（不提交）
```

**优先级**（从高到低）：
1. `.env.local`
2. `.env.development` / `.env.production`
3. `.env`

### 3. 客户端 vs 服务器端变量

```bash
# ✅ 客户端可见（浏览器中可访问）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# ✅ 服务器端专用（浏览器中不可见）
DATABASE_URL=...
API_SECRET=...
```

**规则**：
- 客户端变量必须以 `NEXT_PUBLIC_` 开头
- 服务器端变量不要添加此前缀
- 敏感信息（密码、密钥）永远不要使用 `NEXT_PUBLIC_`

### 4. 验证环境变量

创建验证脚本（可选）：

```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'DATABASE_URL',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// 在应用启动时调用
validateEnv();
```

---

## 🔍 环境变量调试

### 检查变量是否正确加载

```typescript
// 仅在开发环境输出
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✓ Set' : '✗ Missing',
    databaseUrl: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
    nodeEnv: process.env.NODE_ENV,
  });
}
```

### 常见问题

1. **变量未定义**
   ```bash
   # 确保文件名正确
   .env.local  ✓
   .env-local  ✗
   
   # 重启开发服务器
   npm run dev
   ```

2. **客户端变量未生效**
   ```bash
   # 确保使用 NEXT_PUBLIC_ 前缀
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...  ✓
   GOOGLE_MAPS_API_KEY=...              ✗
   ```

3. **Vercel 部署后变量未更新**
   ```bash
   # 添加或修改变量后，需要重新部署
   Deployments → 最新部署 → Redeploy
   ```

---

## 📦 从 Vercel 拉取环境变量

使用 Vercel CLI 同步环境变量到本地：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 拉取环境变量
vercel env pull .env.local

# 现在 .env.local 包含生产环境的变量
```

---

## 🔒 安全建议

### ✅ 应该做的

1. **使用 `.gitignore` 忽略敏感文件**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **限制 API Key 的使用范围**
   - HTTP referrers 限制
   - API 范围限制
   - 使用配额限制

3. **定期轮换密钥**
   - 每 3-6 个月更换 API Key
   - 记录密钥使用情况

4. **使用环境特定的配置**
   - 开发、预览、生产使用不同的 Key

### ❌ 不应该做的

1. **不要提交 `.env.local` 到 Git**
   ```bash
   # 错误示例
   git add .env.local  ✗
   ```

2. **不要在代码中硬编码密钥**
   ```typescript
   // 错误示例
   const apiKey = 'AIzaSyC...';  ✗
   
   // 正确示例
   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;  ✓
   ```

3. **不要在客户端暴露服务器密钥**
   ```bash
   # 错误示例
   NEXT_PUBLIC_DATABASE_URL=...  ✗
   
   # 正确示例
   DATABASE_URL=...  ✓
   ```

4. **不要在公共仓库中提交生产环境变量**

---

## 📚 参考资源

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Maps API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

---

**保护好你的密钥！🔐**
