# ⚡ Vercel 快速部署指南

5 分钟将项目部署到 Vercel！

## 🚀 快速开始

### 1. 准备工作（2 分钟）

```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. 部署到 Vercel（3 分钟）

1. **访问 Vercel** → https://vercel.com/login
2. **导入项目** → "Add New..." → "Project" → 选择 GitHub 仓库
3. **配置环境变量**：
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的_API_Key
   DATABASE_URL=${POSTGRES_PRISMA_URL}
   NODE_ENV=production
   ```
4. **创建数据库**：
   - Storage → Create Database → Postgres
   - 选择区域（Hong Kong）
5. **部署**：点击 "Deploy" 按钮

完成！🎉

---

## 📋 必需配置

### Google Maps API Key

1. 访问 https://console.cloud.google.com/
2. 创建项目 → 启用 API：
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. 创建 API Key
4. 配置限制：
   - HTTP referrers: `https://your-app.vercel.app/*`
   - API 限制：选择上述 3 个 API

### Vercel Postgres

1. 在 Vercel Dashboard 中自动创建
2. 环境变量自动注入
3. 无需额外配置

---

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Google Maps API Key 已创建
- [ ] API Key 已配置域名限制
- [ ] Vercel 项目已创建
- [ ] Vercel Postgres 已创建
- [ ] 环境变量已设置
- [ ] 首次部署成功
- [ ] 地图功能正常
- [ ] 数据库读写正常

---

## 🔍 验证部署

访问你的部署 URL，检查：

1. ✅ 地图正常加载
2. ✅ 搜索功能工作
3. ✅ 可以创建标记
4. ✅ 可以编辑/删除标记
5. ✅ 数据持久化

---

## ⚠️ 常见问题

### 地图加载失败

**原因**：API Key 限制配置错误

**解决**：
1. 检查 Vercel 环境变量
2. 确认 API Key 的 HTTP referrers 包含你的域名
3. 确认已启用所需的 API

### 数据库连接失败

**原因**：DATABASE_URL 未正确配置

**解决**：
1. 确保 Vercel Postgres 已创建
2. 设置 `DATABASE_URL=${POSTGRES_PRISMA_URL}`
3. 重新部署

### 构建失败

**原因**：Prisma 未生成客户端

**解决**：
1. 确保 `package.json` 包含：
   ```json
   "postinstall": "prisma generate"
   ```
2. 重新部署

---

## 📚 详细文档

- [完整部署指南](./VERCEL_DEPLOYMENT.md)
- [环境变量配置](./ENVIRONMENT_VARIABLES.md)
- [文件上传策略](./FILE_UPLOAD_STRATEGY.md)

---

## 🆘 需要帮助？

1. 查看 [完整部署指南](./VERCEL_DEPLOYMENT.md)
2. 查看 [Vercel 文档](https://vercel.com/docs)
3. 查看项目的 GitHub Issues

---

**祝部署顺利！🚀**
