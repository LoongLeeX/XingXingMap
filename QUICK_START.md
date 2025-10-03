# 🚀 快速启动 - 获取 Google Maps API Key

## 当前问题

地图没有渲染是因为缺少 **Google Maps API Key**。

## 解决步骤

### 1️⃣ 获取 Google Maps API Key（5-10分钟）

1. **访问 Google Cloud Console**
   - 打开: https://console.cloud.google.com/

2. **创建或选择项目**
   - 点击顶部的项目选择器
   - 点击"新建项目"
   - 输入项目名称（如：Map-App）
   - 点击"创建"

3. **启用 Google Maps API**
   - 在左侧菜单点击"API 和服务" > "库"
   - 搜索并启用以下 API：
     - ✅ **Maps JavaScript API** （必需）
     - ✅ **Places API** （必需，用于搜索）
     - ✅ **Geocoding API** （必需，用于地址解析）
     - ⭕ **Map Tiles API** （可选，用于 3D 地图）

4. **创建 API 密钥**
   - 点击"凭据"
   - 点击"创建凭据" > "API 密钥"
   - 复制生成的 API 密钥（类似：AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX）

5. **（推荐）限制 API 密钥**
   - 点击刚创建的 API 密钥进行编辑
   - 在"应用程序限制"中选择"HTTP 引荐来源网址"
   - 添加：`http://localhost:3000/*`
   - 保存

### 2️⃣ 配置 API Key 到项目

在项目根目录编辑 `.env` 文件：

```bash
# 方法1：使用命令行
echo 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的API密钥' >> .env

# 方法2：使用编辑器
nano .env
# 或
code .env
```

添加以下内容（替换成你的 API Key）：

```env
# Google Maps API Key（必需）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 数据库（已配置）
DATABASE_URL="file:./dev.db"

# 可选：3D 地图 Map ID（如果需要 3D 功能）
# NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=你的MAP_ID
```

### 3️⃣ 重启开发服务器

```bash
# 按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

### 4️⃣ 刷新浏览器

访问 http://localhost:3000 - 地图应该正常显示了！

## 📋 验证清单

配置完成后，你应该能看到：
- ✅ 地图正常加载并显示
- ✅ 可以拖动和缩放地图
- ✅ 搜索栏可以搜索地址
- ✅ 点击地图可以添加标记
- ✅ 可以切换地图类型（地图/卫星）
- ✅ 可以切换视图模式（2D/3D/分屏）

## 💡 临时测试方案（不推荐）

如果你只是想快速测试界面，可以使用一个临时的测试 Key（功能受限）：

```env
# 警告：这只是示例，实际使用需要你自己的 Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg
```

**注意**: 
- 这个 Key 可能不工作或有配额限制
- 强烈建议使用自己的 API Key
- 生产环境必须使用自己的 Key

## ❓ 常见问题

### Q: API Key 需要付费吗？
A: Google Maps 提供每月 $200 的免费额度，对于开发和小型项目足够使用。

### Q: 如何知道 API Key 配置成功？
A: 刷新页面后，浏览器控制台不应有 API Key 相关错误，地图应正常显示。

### Q: 为什么我的 API Key 不工作？
A: 检查：
1. API Key 是否正确复制（没有多余空格）
2. 必需的 API 是否已启用
3. 是否设置了过于严格的限制
4. 是否重启了开发服务器

### Q: 3D 地图需要额外配置吗？
A: 是的，3D 地图需要：
1. 启用 Map Tiles API
2. 创建 Map ID（在 Google Cloud Console 的 Map Management）
3. 配置 `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`

## 🔗 有用的链接

- [Google Maps Platform 文档](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key 最佳实践](https://developers.google.com/maps/api-security-best-practices)
- [定价说明](https://mapsplatform.google.com/pricing/)

---

**需要帮助？** 查看完整的 [INSTALL.md](INSTALL.md) 或 [USAGE.md](USAGE.md)

