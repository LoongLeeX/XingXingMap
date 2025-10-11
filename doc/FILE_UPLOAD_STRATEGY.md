# 📤 文件上传策略 - 生产环境指南

## ⚠️ 重要提示

**Vercel 的无服务器环境是只读的**，这意味着：
- ❌ 不能将文件保存到 `/public/uploads/` 目录
- ❌ 上传的文件在重新部署后会丢失
- ✅ 必须使用外部云存储服务

---

## 🎯 推荐方案对比

| 方案 | 难度 | 成本 | 性能 | 集成度 | 推荐度 |
|------|------|------|------|--------|--------|
| Vercel Blob | ⭐ 简单 | 💰 按量付费 | 🚀 极快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cloudinary | ⭐⭐ 简单 | 💰 免费额度大 | 🚀 快 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Supabase | ⭐⭐ 中等 | 💰 免费可用 | 🚀 快 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| AWS S3 | ⭐⭐⭐ 复杂 | 💰 便宜 | 🚀 快 | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 方案 1：Vercel Blob Storage（推荐）⭐

### 优点
- ✅ 与 Vercel 深度集成，零配置
- ✅ 自动 CDN 分发，全球加速
- ✅ 简单的 API，易于使用
- ✅ 自动处理 CORS
- ✅ 支持大文件（最大 500MB）

### 缺点
- ❌ 按使用量付费（相对较贵）
- ❌ 仅适用于 Vercel 平台

### 定价
```
免费额度：
- 1GB 存储
- 100GB 带宽/月

付费：
- $0.15/GB 存储/月
- $0.10/GB 带宽
```

### 实施步骤

#### 1. 安装依赖
```bash
npm install @vercel/blob
```

#### 2. 启用 Blob Storage
```
1. 访问 Vercel Dashboard
2. 选择项目 → Storage → Create Database
3. 选择 "Blob" → Create
4. 环境变量会自动注入：BLOB_READ_WRITE_TOKEN
```

#### 3. 创建上传 API Route

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }
    
    // 上传到 Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // 避免文件名冲突
    });
    
    return NextResponse.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// 配置 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
};
```

#### 4. 创建删除 API Route（可选）

```typescript
// app/api/upload/delete/route.ts
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    
    await del(url);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
```

#### 5. 更新前端上传组件

```typescript
// client/src/components/ImageUpload.tsx
'use client';

import { useState } from 'react';

export function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.url);
        alert('上传成功！');
      } else {
        alert('上传失败：' + data.error);
      }
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      
      {uploading && <p>上传中...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

---

## 方案 2：Cloudinary（推荐）⭐

### 优点
- ✅ 免费额度很大（25GB 存储，25GB 带宽）
- ✅ 强大的图片处理能力（裁剪、压缩、格式转换）
- ✅ 自动优化和 CDN 分发
- ✅ 支持视频处理
- ✅ 独立于平台，可迁移

### 缺点
- ❌ 需要额外账号和配置
- ❌ API 相对复杂

### 定价
```
免费额度：
- 25GB 存储
- 25GB 带宽/月
- 25,000 次转换/月

足够中小型应用使用！
```

### 实施步骤

#### 1. 注册 Cloudinary
```
访问：https://cloudinary.com/users/register_free
创建账号并获取：
- Cloud Name
- API Key
- API Secret
```

#### 2. 安装依赖
```bash
npm install cloudinary
```

#### 3. 配置环境变量
```bash
# .env.local（开发环境）
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Vercel Dashboard（生产环境）
# 添加相同的三个环境变量
```

#### 4. 创建 Cloudinary 配置

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

#### 5. 创建上传 API Route

```typescript
// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 将文件转换为 buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 上传到 Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'markers', // 组织文件
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // 限制尺寸
            { quality: 'auto' }, // 自动优化质量
            { fetch_format: 'auto' }, // 自动选择格式
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### 6. 创建删除 API Route

```typescript
// app/api/upload/delete/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();
    
    await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
```

---

## 方案 3：Supabase Storage

### 优点
- ✅ 免费额度可用（1GB 存储，2GB 带宽）
- ✅ 如果已使用 Supabase 数据库，集成方便
- ✅ 内置认证和授权
- ✅ 实时功能

### 缺点
- ❌ 免费额度较小
- ❌ 需要额外的 Supabase 项目

### 实施步骤

```bash
# 安装
npm install @supabase/supabase-js

# 配置
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 上传
const { data, error } = await supabase.storage
  .from('markers')
  .upload(`public/${file.name}`, file);

// 获取 URL
const { data: { publicUrl } } = supabase.storage
  .from('markers')
  .getPublicUrl(`public/${file.name}`);
```

---

## 方案 4：AWS S3

### 优点
- ✅ 非常便宜（$0.023/GB/月）
- ✅ 可靠性极高
- ✅ 可扩展性强

### 缺点
- ❌ 配置复杂（IAM、CORS、桶策略）
- ❌ 需要 AWS 账号
- ❌ API 较复杂

### 快速参考

```bash
# 安装
npm install @aws-sdk/client-s3

# 上传示例
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

await s3.send(new PutObjectCommand({
  Bucket: process.env.AWS_BUCKET_NAME,
  Key: file.name,
  Body: buffer,
  ContentType: file.type,
}));
```

---

## 📝 迁移现有代码

### 当前实现（本地文件系统）

```typescript
// ❌ 在 Vercel 上不工作
const uploadDir = './public/uploads';
fs.writeFileSync(`${uploadDir}/${file.name}`, buffer);
```

### 迁移到云存储

1. **更新 Marker Schema**（已支持）
   ```prisma
   model Marker {
     images String[] @default([]) // 存储 URL 数组
   }
   ```

2. **更新上传逻辑**
   ```typescript
   // 旧代码：保存到本地
   const localPath = `/uploads/${filename}`;
   
   // 新代码：上传到云存储
   const cloudUrl = await uploadToCloud(file);
   ```

3. **更新删除逻辑**
   ```typescript
   // 旧代码：删除本地文件
   fs.unlinkSync(localPath);
   
   // 新代码：从云存储删除
   await deleteFromCloud(url);
   ```

4. **更新 Marker 创建**
   ```typescript
   // 先上传图片
   const imageUrls = await Promise.all(
     files.map(file => uploadToCloud(file))
   );
   
   // 再创建 Marker
   await createMarker({
     ...data,
     images: imageUrls,
   });
   ```

---

## 🎯 实施建议

### 小型项目（个人/原型）
**推荐**：Cloudinary
- 免费额度大
- 功能强大
- 易于使用

### 中型项目（创业公司）
**推荐**：Vercel Blob
- 深度集成
- 简单可靠
- 可预测的成本

### 大型项目（企业）
**推荐**：AWS S3 + CloudFront
- 成本最低
- 最大的灵活性
- 企业级可靠性

---

## 📊 成本估算

假设场景：
- 1000 个标记
- 每个标记 3 张图片
- 每张图片 500KB
- 每月 10,000 次访问

| 方案 | 存储成本 | 带宽成本 | 总成本/月 |
|------|----------|----------|-----------|
| Vercel Blob | $0.23 | $1.50 | **$1.73** |
| Cloudinary | $0 | $0 | **$0** (免费额度内) |
| AWS S3 | $0.03 | $0.85 | **$0.88** |
| Supabase | $0 | $0 | **$0** (免费额度内) |

---

## 🔧 开发环境处理

### 保留本地上传（开发）

```typescript
// lib/upload.ts
export async function uploadFile(file: File) {
  // 开发环境：使用本地文件系统
  if (process.env.NODE_ENV === 'development') {
    return uploadToLocal(file);
  }
  
  // 生产环境：使用云存储
  return uploadToCloud(file);
}
```

### 使用环境变量切换

```bash
# .env.local（开发）
UPLOAD_STRATEGY=local

# Vercel（生产）
UPLOAD_STRATEGY=vercel-blob
```

---

## ✅ 迁移检查清单

- [ ] 选择云存储方案
- [ ] 创建账号并获取凭证
- [ ] 在 Vercel 配置环境变量
- [ ] 安装必需的 npm 包
- [ ] 创建上传 API Route
- [ ] 创建删除 API Route
- [ ] 更新前端上传组件
- [ ] 更新 Marker 创建逻辑
- [ ] 测试上传功能
- [ ] 测试删除功能
- [ ] 迁移现有图片（如果需要）
- [ ] 更新文档

---

## 🆘 常见问题

### Q: 是否需要迁移现有的图片？
A: 如果有生产数据，需要将 `/public/uploads/` 中的图片上传到云存储，并更新数据库中的 URL。

### Q: 可以同时使用多个存储方案吗？
A: 可以，但不推荐。增加复杂性和维护成本。

### Q: 如何处理已上传的临时文件？
A: 使用云存储的生命周期策略自动清理未使用的文件，或定期运行清理脚本。

### Q: 图片优化在哪里处理？
A: 
- **Cloudinary**：自动优化
- **Vercel Blob**：需要手动处理
- **S3**：需要手动处理或使用 Lambda

---

## 📚 参考资源

- [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob)
- [Cloudinary 文档](https://cloudinary.com/documentation)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [AWS S3 文档](https://docs.aws.amazon.com/s3/)

---

**开始你的云存储之旅！☁️**
