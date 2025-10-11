# 3D 地图配置指南

## 问题诊断

你的 2D 和 3D 地图**使用同一个 API Key**：`AI...uw`

3D 地图失败的原因：**Map Tiles API 未启用**

## 已修复的问题

✅ **2D 地图现在使用 Map ID** - 支持更好的样式和 3D 建筑物
✅ **3D 地图使用正确的 Web Component 方式**
✅ **使用 v=beta 版本的 Maps JavaScript API** - 支持 3D Maps
✅ **添加详细的错误日志** - 帮助诊断问题

## 你需要做什么

### 第一步：启用 Map Tiles API

1. 打开 [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/library)

2. 搜索 **"Map Tiles API"**

3. 点击进入，然后点击 **"启用"** 按钮

4. 确保以下 API 都已启用：
   - ✅ Maps JavaScript API（已启用 - 2D 能用）
   - ❓ **Map Tiles API**（需要启用！）
   - ✅ Geocoding API（可选）
   - ✅ Places API（可选）

### 第二步：验证 Map ID 配置

你的 `.env.local` 已经有 Map ID：
```
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=a7d6334de19c53da2119427e
```

需要验证：
1. 打开 [Google Cloud Console - Map Management](https://console.cloud.google.com/google/maps-apis/client-styles)
2. 找到这个 Map ID：`a7d6334de19c53da2119427e`
3. 确保它的类型是 **"JavaScript"**
4. 确保启用了 **"Photorealistic 3D Maps"** 选项（如果有的话）

### 第三步：检查 API Key 权限

1. 打开 [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. 找到你的 API Key：`AIzaSyASgpbh-70D8yqtqpSudkdrogVMTwzg0uw`
3. 点击编辑
4. 在 **"API restrictions"** 中，确保允许：
   - Maps JavaScript API
   - **Map Tiles API** ⭐ 重要！
5. 在 **"Website restrictions"** 中，确保包含你的域名：
   - `localhost:*/*`
   - `localhost/*`
   - 你的生产域名

### 第四步：重启应用

启用 API 后，重启你的应用：

```bash
# 停止当前运行的应用 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 验证是否成功

打开浏览器开发者工具 (F12)，查看控制台日志：

### 成功的日志：
```
🔗 [loadGoogleMapsScript] 加载脚本 (v=beta for 3D support)
✅ [loadGoogleMapsScript] Google Maps 脚本加载成功
✅ [use3DMap] 已添加 gmp-map-3d 元素到容器
🎉 [use3DMap] 3D 地图加载成功
```

### 失败的日志（需要修复）：
```
❌ [use3DMap] 3D 地图加载失败
💡 可能原因:
   1. Map Tiles API 未启用  ⬅️ 你当前的问题
   2. API Key 没有 Map Tiles API 权限
   3. Map ID 配置不正确
```

## 快速测试

分屏模式下，你应该看到：
- 左侧：2D 卫星视图 ✅
- 右侧：3D 真实感视图（如果配置正确）

## 常见问题

### Q: 启用 API 后还是不行？
A: 等待 1-2 分钟，Google 需要时间传播配置。然后刷新页面。

### Q: 显示 "Map ID 未配置" 错误？
A: 检查 `.env.local` 文件，确保有 `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`

### Q: 控制台显示 RefererNotAllowedMapError？
A: API Key 的域名限制有问题，需要添加 `localhost:*/*` 到白名单

### Q: 显示配额超限？
A: 需要在 Google Cloud Console 启用计费账号

## 相关链接

- [Google Maps 3D 文档](https://developers.google.com/maps/documentation/javascript/3d-maps)
- [Map Tiles API 文档](https://developers.google.com/maps/documentation/tile/overview)
- [Map ID 配置指南](https://developers.google.com/maps/documentation/javascript/styling#cloud_styling)

## 当前配置总结

```
API Key: 
Map ID: 
版本: v=beta (支持 3D)

2D 和 3D 使用同一个 API Key ✅
```

**下一步：去 Google Cloud Console 启用 Map Tiles API！** 🚀

