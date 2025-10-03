# 🔍 调试指南

## 已添加详细日志

我已经在以下文件中添加了详细的日志输出：

1. ✅ `features/map/hooks/useGoogleMaps.ts` - Google Maps SDK 加载过程
2. ✅ `features/map/hooks/useMapInstance.ts` - 地图实例创建过程
3. ✅ `features/map/components/Map2D.tsx` - 2D 地图组件渲染
4. ✅ `app/page.tsx` - 主页面加载状态

## 📋 查看日志步骤

### 1. 打开浏览器开发者工具

- **Chrome/Edge**: 按 `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`)
- **Firefox**: 按 `F12` 或 `Ctrl+Shift+K` (Mac: `Cmd+Option+K`)
- **Safari**: 按 `Cmd+Option+C`

### 2. 切换到 Console 标签页

查找带有表情符号的日志输出。

### 3. 刷新页面

按 `Ctrl+R` (Mac: `Cmd+R`) 或点击刷新按钮。

## 🔎 日志分析

### 正常的日志流程应该是：

```
🏠 [HomePage] 组件渲染
🔍 [useGoogleMaps] 开始加载 Google Maps
🔑 [useGoogleMaps] API Key 状态: ✅ 已配置
📦 [useGoogleMaps] 开始加载 Google Maps SDK...
✅ [useGoogleMaps] Google Maps SDK 加载成功
🌍 [useGoogleMaps] window.google 可用: true
📊 [useGoogleMaps] 状态更新 - isLoaded: true loadError: null
📊 [HomePage] 状态更新 - isLoaded: true loadError: null
✅ [HomePage] Google Maps 已加载，显示主界面
🎨 [Map2D] 组件渲染 - containerId: map-2d
📍 [Map2D] Store 状态 - center: {...} zoom: 12 mapType: roadmap
🗺️ [useMapInstance] 开始初始化地图 - containerId: map-2d
🌍 [useMapInstance] window.google 可用: true
📦 [useMapInstance] 容器元素: ✅ 找到
⚙️ [useMapInstance] 地图配置: {...}
🏗️ [useMapInstance] 正在创建地图实例...
✅ [useMapInstance] 地图实例创建成功
📊 [useMapInstance] 状态更新 - map: true isReady: false
🔄 [Map2D] useMapInstance 状态变化 - map: true isReady: false
💾 [Map2D] 保存地图实例到 store
🎉 [useMapInstance] 地图加载完成 (idle event)
📊 [useMapInstance] 状态更新 - map: true isReady: true
🔄 [Map2D] useMapInstance 状态变化 - map: true isReady: true
```

## 🐛 常见问题及解决方案

### 问题 1: API Key 未配置

**日志显示**:
```
🔑 [useGoogleMaps] API Key 状态: ❌ 未配置
❌ [useGoogleMaps] Google Maps API Key 未配置
```

**解决方案**:
1. 编辑 `.env` 文件
2. 添加 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的API密钥`
3. 重启开发服务器

### 问题 2: 一直显示"加载地图中..."

**可能原因 A - SDK 加载失败**:
```
❌ [useGoogleMaps] 加载失败: [错误信息]
```

**解决方案**:
- 检查 API Key 是否正确
- 检查必需的 API 是否已启用
- 检查网络连接

**可能原因 B - window.google 不可用**:
```
⚠️ [useMapInstance] window.google 不可用，等待 SDK 加载
```

**解决方案**:
- 确认看到了 `✅ [useGoogleMaps] Google Maps SDK 加载成功`
- 如果没有，检查 API Key 和网络

**可能原因 C - 找不到容器元素**:
```
❌ [useMapInstance] 找不到容器元素: #map-2d
```

**解决方案**:
- 这是时序问题，容器元素可能还没渲染
- 通常会自动重试

### 问题 3: 地图创建失败

**日志显示**:
```
❌ [useMapInstance] 创建地图失败: [错误信息]
```

**解决方案**:
- 查看具体的错误信息
- 可能是配置问题或 API 限制

### 问题 4: 地图创建成功但 isReady 一直是 false

**日志显示**:
```
✅ [useMapInstance] 地图实例创建成功
📊 [useMapInstance] 状态更新 - map: true isReady: false
# 但从未看到 "地图加载完成 (idle event)"
```

**可能原因**:
- 地图容器大小为 0
- CSS 样式问题

**解决方案**:
在浏览器 Console 中运行：
```javascript
const container = document.getElementById('map-2d');
console.log('Container:', container);
console.log('Container size:', container?.offsetWidth, 'x', container?.offsetHeight);
```

如果大小是 0x0，检查 CSS。

## 🛠️ 调试命令

在浏览器 Console 中运行这些命令进行调试：

```javascript
// 检查 Google Maps 是否加载
console.log('Google Maps loaded:', !!window.google);

// 检查容器元素
const container = document.getElementById('map-2d');
console.log('Container element:', container);
console.log('Container size:', container?.offsetWidth, 'x', container?.offsetHeight);

// 检查环境变量（客户端）
console.log('API Key configured:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

// 清空 Console
console.clear();
```

## 📸 截图日志

如果需要帮助，请截图以下内容：

1. **完整的 Console 日志**（从页面加载开始）
2. **Elements 标签页中的 `#map-2d` 元素**
3. **Network 标签页中的 Google Maps 请求**

## 🔄 重新测试

清空缓存后重新测试：

1. 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"
4. 查看新的日志输出

## 💡 提示

- 🟢 绿色勾号 (✅) = 成功
- 🔴 红色叉号 (❌) = 错误
- 🟡 警告符号 (⚠️) = 警告
- 📊 图表 = 状态更新
- 🎨 调色板 = 组件渲染

---

**现在请刷新浏览器并查看 Console 日志！**

将日志输出发给我，我可以帮你分析问题。

