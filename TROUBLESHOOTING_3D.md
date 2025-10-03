# 🔧 3D 地图故障排除指南

## 🚨 问题：3D 地图不显示

### 步骤 1: 检查浏览器控制台日志

打开开发者工具（F12 或 Cmd+Option+I），查看 Console 标签页。

#### ✅ 正常的日志应该是：
```
🗺️ [use3DMap] 开始初始化 3D 地图 - containerId: map-3d
🔍 [use3DMap] Google Maps 版本: 3.xx.x
📦 [use3DMap] 加载 maps3d 库...
📦 [use3DMap] maps3d 库加载成功
🏗️ [use3DMap] 正在创建 Map3DElement 实例...
📍 [use3DMap] 中心位置: {lat: xx, lng: xx, altitude: 500}
✅ [use3DMap] Map3DElement 对象创建成功
✅ [use3DMap] 已添加到 DOM
🎉 [use3DMap] 3D 地图初始化完成
```

#### ❌ 常见错误及解决方案：

---

### 错误 1: `Map Tiles API has not been used in project`

**原因**: Map Tiles API 未启用

**解决方案**:
1. 访问 [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. 点击 "+ ENABLE APIS AND SERVICES"
3. 搜索 "Map Tiles API"
4. 点击启用（Enable）
5. 等待几分钟让 API 生效

---

### 错误 2: `google.maps.importLibrary is not a function`

**原因**: Google Maps SDK 加载方式不正确

**解决方案**:
确保在加载 SDK 时使用了 `loading=async`:
```javascript
// ✅ 正确
<script async src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&loading=async"></script>

// ❌ 错误（旧方式）
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=initMap"></script>
```

本项目使用 `useGoogleMaps` Hook，已经正确配置。

---

### 错误 3: `Map3DElement is not defined`

**原因**: API 版本过旧或 Map Tiles API 未启用

**解决方案**:
1. 确保 Map Tiles API 已启用（见错误 1）
2. 检查 Google Maps 版本是否为最新（weekly）
3. 清除浏览器缓存并刷新

---

### 错误 4: 地图容器显示但没有内容

**原因**: 当前位置可能不支持 3D，或 API Key 权限不足

**解决方案**:

#### A. 测试已知支持的城市
在 `clientservershare/constants/map.constants.ts` 中临时修改默认中心：

```typescript
export const DEFAULT_MAP_CONFIG = {
  center: { lat: 37.7704, lng: -122.3985 }, // 旧金山（确定支持 3D）
  zoom: 15,
};
```

其他已知支持的城市：
- **旧金山**: `{ lat: 37.7704, lng: -122.3985 }`
- **纽约**: `{ lat: 40.7128, lng: -74.0060 }`
- **洛杉矶**: `{ lat: 34.0522, lng: -118.2437 }`
- **东京**: `{ lat: 35.6762, lng: 139.6503 }`
- **伦敦**: `{ lat: 51.5074, lng: -0.1278 }`

#### B. 检查 API Key 权限
1. 访问 [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. 找到你的 API Key
3. 点击 "Edit API Key"
4. 确保以下 API 被允许使用：
   - ✅ Maps JavaScript API
   - ✅ Map Tiles API
   - ✅ Places API（如果使用搜索）

---

### 错误 5: `This API project is not authorized to use this API`

**原因**: API Key 被限制或项目配额不足

**解决方案**:
1. 检查 API Key 限制设置
2. 检查项目配额和计费状态
3. 确保项目已启用计费（3D 地图可能需要）

---

## 🔍 调试步骤

### 1. 基础检查
```javascript
// 在浏览器控制台运行以下命令：

// 检查 Google Maps SDK 是否加载
console.log('Google Maps loaded:', !!window.google);

// 检查版本
console.log('Version:', google.maps.version);

// 检查 importLibrary 是否可用
console.log('importLibrary available:', typeof google.maps.importLibrary);

// 尝试手动加载 maps3d
google.maps.importLibrary("maps3d")
  .then(lib => console.log('maps3d library:', lib))
  .catch(err => console.error('Failed to load maps3d:', err));
```

### 2. 检查容器元素
```javascript
// 检查 3D 地图容器
const container = document.getElementById('map-3d');
console.log('Container:', container);
console.log('Container size:', {
  width: container.offsetWidth,
  height: container.offsetHeight
});
console.log('Container children:', container.children);
```

### 3. 检查元素样式
```javascript
// 如果 Map3DElement 已创建
const map3d = document.querySelector('gmp-map-3d');
console.log('Map3D element:', map3d);
console.log('Map3D computed style:', window.getComputedStyle(map3d));
```

---

## 📋 完整检查清单

在报告问题前，请确认：

- [ ] Google Maps API Key 已配置在 `.env` 文件
- [ ] Maps JavaScript API 已启用
- [ ] **Map Tiles API 已启用**（最重要！）
- [ ] Places API 已启用（如果使用搜索）
- [ ] API Key 没有 HTTP referrer 限制（或已正确配置）
- [ ] 项目已启用计费（如果需要）
- [ ] 浏览器控制台没有 CORS 错误
- [ ] 使用的是现代浏览器（Chrome/Edge/Firefox 最新版）
- [ ] 已尝试已知支持的城市（如旧金山）
- [ ] 已清除浏览器缓存并刷新

---

## 💡 快速测试

创建一个简单的 HTML 文件测试 3D 地图：

```html
<!DOCTYPE html>
<html>
<head>
  <title>3D Map Test</title>
  <style>
    gmp-map-3d { height: 500px; }
  </style>
</head>
<body>
  <gmp-map-3d 
    center="37.7704,-122.3985,500" 
    tilt="67.5" 
    range="1000"
  ></gmp-map-3d>
  
  <script type="module">
    import { Map3DElement } from "https://unpkg.com/@googlemaps/extended-component-library@0.6";
    // 替换为你的 API Key
    Map3DElement.apiKey = 'YOUR_API_KEY_HERE';
  </script>
</body>
</html>
```

如果这个简单示例也不工作，问题可能在于：
1. API Key 配置
2. Map Tiles API 未启用
3. 网络或防火墙问题

---

## 🆘 仍然无法解决？

提供以下信息以获得帮助：

1. **浏览器控制台的完整日志**（截图或文字）
2. **Google Cloud Console 截图**：
   - APIs & Services → Enabled APIs
   - Credentials → API Key 详情
3. **`.env` 文件内容**（隐藏 API Key 的大部分字符）
4. **测试的位置坐标**
5. **浏览器版本和操作系统**

---

## 📚 参考资源

- [Map Tiles API 文档](https://developers.google.com/maps/documentation/tile)
- [3D Maps 示例](https://developers.google.com/maps/documentation/javascript/examples/3d-overview)
- [故障排除指南](https://developers.google.com/maps/documentation/javascript/error-messages)
- [API 使用限制](https://developers.google.com/maps/documentation/javascript/usage-and-billing)

---

**最后更新**: 2025-10-03

