# 🔍 调试：两个 3D 地图问题

## 🎯 问题描述
在分屏模式下，右侧 3D 区域出现两个 3D 地图（上下各一个）

**问题原因**：React Strict Mode 在开发环境下会导致组件挂载两次，导致同一个容器内添加了两个 `gmp-map-3d` 实例。

## ✅ 已实施的修复

### 修复 1：防止重复添加
在创建地图前检查容器是否已有地图实例：
```typescript
const existingMaps = containerRef.current.querySelectorAll('gmp-map-3d');
if (existingMaps.length > 0) {
  console.warn('容器已有地图实例，跳过创建');
  return;
}
```

### 修复 2：使用 isMounted 标志
防止异步操作在组件卸载后继续执行：
```typescript
let isMounted = true;

// 在关键操作前检查
if (!isMounted) return;

// 清理时设置
return () => {
  isMounted = false;
  // ...
};
```

### 修复 3：强制清理残留实例
在清理函数中移除所有可能残留的地图：
```typescript
const remainingMaps = containerRef.current.querySelectorAll('gmp-map-3d');
remainingMaps.forEach(map => map.remove());
```

## 🆔 已添加的调试功能

### 1. 组件 ID 系统
每个 `Map3DWithMarkers` 组件实例都有唯一的 ID：
- 格式：`map3d-{timestamp}-{random}`
- 在控制台日志中显示
- 在状态指示器中显示（右下角）

### 2. 详细的日志追踪
现在每个关键步骤都有日志：

**组件层级日志**:
```
🗺️ [MapContainer] 组件渲染
🔄 [SplitView] 组件渲染
🆔 [Map3DWithMarkers] 组件渲染 - ID: map3d-xxx
```

**地图初始化日志**:
```
🚀 [Map3DWithMarkers] useEffect 初始化开始 - ID: xxx
🔍 [Map3DWithMarkers] 检查容器 - ID: xxx
✅ [Map3DWithMarkers] 容器找到
📦 [Map3DWithMarkers] 开始加载 Map3DElement...
🏗️ [Map3DWithMarkers] 创建 Map3DElement 实例
➕ [Map3DWithMarkers] 添加地图到DOM
📍 [Map3DWithMarkers] 容器现在有 X 个子元素
✅ [Map3DWithMarkers] 地图已添加到DOM
🎉 [Map3DWithMarkers] 3D 地图初始化完成
```

**清理日志**:
```
🧹 [Map3DWithMarkers] 组件卸载，开始清理 - ID: xxx
🗑️ [Map3DWithMarkers] 移除地图实例
✅ [Map3DWithMarkers] 3D 地图已清理
```

---

## 🧪 调试步骤

### 第 1 步：清理并重启

```bash
cd /Users/cocui/i100/kkMy/github/Map

# 停止服务器 (Ctrl+C)
# 清理 .next 缓存
rm -rf .next

# 重新启动
npm run dev
```

### 第 2 步：打开浏览器并准备

1. 打开 http://localhost:3000
2. 打开开发者工具（F12）
3. 切换到 **Console** 标签页
4. **清空控制台**（右键 > Clear Console）

### 第 3 步：切换到分屏模式

点击左上角的 "分屏视图" 按钮

### 第 4 步：分析控制台日志

查找以下模式：

#### ✅ 正常情况（只有一个 3D 地图）

```
🗺️ [MapContainer] 组件渲染 { viewMode: 'split', markersCount: X }
🔄 [SplitView] 组件渲染 { markersCount: X, hasSearchMarker: false }
🆔 [Map3DWithMarkers] 组件渲染 - ID: map3d-1696xxxxx-abc123
🚀 [Map3DWithMarkers] useEffect 初始化开始 - ID: map3d-1696xxxxx-abc123
✅ [Map3DWithMarkers] 容器找到: { id: "map3d-1696xxxxx-abc123", ... }
...
🎉 [Map3DWithMarkers] 3D 地图初始化完成 - ID: map3d-1696xxxxx-abc123
```

**关键点**：
- 只有一个唯一的 ID
- 只有一组初始化日志

#### ❌ 异常情况（两个 3D 地图）

```
🗺️ [MapContainer] 组件渲染 { viewMode: 'split', markersCount: X }
🔄 [SplitView] 组件渲染 { markersCount: X, hasSearchMarker: false }
🆔 [Map3DWithMarkers] 组件渲染 - ID: map3d-1696xxxxx-abc123
🆔 [Map3DWithMarkers] 组件渲染 - ID: map3d-1696xxxxx-def456  ← 第二个！
...
```

**关键点**：
- 出现两个不同的 ID
- 有两组初始化日志

### 第 5 步：检查实际的 DOM 元素

在控制台运行以下命令：

```javascript
// 查找所有 3D 地图容器
const containers = document.querySelectorAll('[data-component="Map3DWithMarkers"]');
console.log('📊 3D 地图容器数量:', containers.length);
console.log('📋 容器详情:', Array.from(containers).map(c => ({
  id: c.id,
  componentId: c.getAttribute('data-component-id'),
  children: c.children.length,
  childrenTags: Array.from(c.children).map(child => child.tagName)
})));

// 查找所有 gmp-map-3d 元素
const maps3d = document.querySelectorAll('gmp-map-3d');
console.log('🗺️ 3D 地图实例数量:', maps3d.length);
console.log('📍 地图位置:', Array.from(maps3d).map(m => m.getBoundingClientRect()));
```

### 第 6 步：检查视觉元素

在右侧 3D 区域，查看右下角的状态指示器：

```
✅ X个标记
ID: abc123     ← 第一个地图的 ID

✅ X个标记
ID: def456     ← 如果有第二个，说明确实有两个组件
```

**如果看到两个不同的 ID 标签**，说明确实有两个组件实例。

---

## 🔍 可能的原因和解决方案

### 原因 1：React Strict Mode 导致双重渲染

**症状**：
- 开发环境下组件渲染两次
- 看到两组日志，但 ID 相同
- 实际上只有一个地图实例

**检查方法**：
```javascript
// 查看是否启用了 Strict Mode
console.log('Strict Mode:', !!document.querySelector('#__next').parentElement.hasAttribute('data-reactroot'));
```

**解决方案**：
- 这是正常的开发行为
- 生产环境不会发生
- 可以暂时禁用 Strict Mode（不推荐）

### 原因 2：组件被渲染两次（真实问题）

**症状**：
- 看到两个不同的 ID
- DOM 中有两个 `gmp-map-3d` 元素
- 右下角有两个状态指示器

**检查方法**：
在控制台运行：
```javascript
// 检查 SplitView 是否被渲染多次
console.log('检查 SplitView 渲染次数...');
// 查看控制台中 🔄 [SplitView] 出现的次数
```

**解决方案 A - 检查父组件**：
查看 `app/page.tsx` 或其他父组件是否错误地渲染了多次 `MapContainer`

**解决方案 B - 检查条件渲染**：
确保 `MapContainer` 中的条件渲染正确：
```typescript
// 应该是互斥的
{viewMode === '2d' && <Map2D />}
{viewMode === '3d' && <Map3DWithMarkers />}
{viewMode === 'split' && <SplitView />}  ← 只有这个应该渲染
```

### 原因 3：样式问题导致视觉上的"两个地图"

**症状**：
- DOM 中只有一个地图
- 但视觉上看起来有两个

**检查方法**：
```javascript
// 检查地图的实际尺寸和位置
const map = document.querySelector('gmp-map-3d');
console.log('地图尺寸:', map.getBoundingClientRect());
console.log('地图样式:', {
  position: window.getComputedStyle(map).position,
  width: window.getComputedStyle(map).width,
  height: window.getComputedStyle(map).height,
  overflow: window.getComputedStyle(map).overflow
});
```

**解决方案**：
- 检查 CSS 是否导致地图重复显示
- 检查是否有重复的背景或遮罩层

### 原因 4：加载/错误状态遮罩被误认为是地图

**症状**：
- 看起来有两个，但其中一个是遮罩层

**检查方法**：
查看是否有加载中或错误的遮罩层仍然显示

**解决方案**：
已在代码中修复，遮罩层现在是透明的覆盖层

---

## 📊 预期的正常输出

### 控制台日志（完整流程）

```
🗺️ [MapContainer] 组件渲染 { viewMode: 'split', markersCount: 0 }
🔄 [SplitView] 组件渲染 { markersCount: 0, hasSearchMarker: false }
🆔 [Map3DWithMarkers] 组件渲染 - ID: map3d-1696300000000-abc123xyz
🚀 [Map3DWithMarkers] useEffect 初始化开始 - ID: map3d-1696300000000-abc123xyz
🔍 [Map3DWithMarkers] 检查容器 - ID: map3d-1696300000000-abc123xyz
✅ [Map3DWithMarkers] 容器找到: { id: "container-map3d-1696300000000-abc123xyz", containerId: "container-map3d-1696300000000-abc123xyz", containerClass: "absolute inset-0 w-full h-full" }
📦 [Map3DWithMarkers] 开始加载 Map3DElement... - ID: map3d-1696300000000-abc123xyz
✅ [Map3DWithMarkers] maps3d 库已加载
📋 [Map3DWithMarkers] maps3dLib 包含: ["Map3DElement", "Marker3DElement", ...]
✅ [Map3DWithMarkers] Marker3DElement 可用
🏗️ [Map3DWithMarkers] 创建 Map3DElement 实例 - ID: map3d-1696300000000-abc123xyz
✅ [Map3DWithMarkers] Map3DElement 实例已创建 - ID: map3d-1696300000000-abc123xyz [object]
➕ [Map3DWithMarkers] 添加地图到DOM - ID: map3d-1696300000000-abc123xyz
📍 [Map3DWithMarkers] 容器信息: { containerId: "container-map3d-1696300000000-abc123xyz", containerChildren: 0, containerHTML: "" }
✅ [Map3DWithMarkers] 地图已添加到DOM - ID: map3d-1696300000000-abc123xyz
📍 [Map3DWithMarkers] 容器现在有 1 个子元素
🎉 [Map3DWithMarkers] 3D 地图初始化完成 - ID: map3d-1696300000000-abc123xyz
📊 [Map3DWithMarkers] 准备渲染标记，数量: 0
```

### DOM 检查结果

```javascript
📊 3D 地图容器数量: 1
📋 容器详情: [{
  id: "container-map3d-1696300000000-abc123xyz",
  componentId: "map3d-1696300000000-abc123xyz",
  children: 1,
  childrenTags: ["GMP-MAP-3D"]
}]
🗺️ 3D 地图实例数量: 1
```

---

## 💡 下一步

### 如果确认有两个组件实例

1. **查找渲染源**：
   - 检查控制台，看哪个父组件触发了两次渲染
   - 使用 React DevTools 查看组件树

2. **检查条件逻辑**：
   - 确保 `viewMode` 状态正确
   - 确保没有多个组件同时满足渲染条件

3. **临时禁用 Strict Mode**（仅用于测试）：
   ```typescript
   // app/layout.tsx
   // 临时注释掉 <React.StrictMode>
   ```

### 如果只是视觉问题

1. **检查 CSS**：
   - 使用浏览器开发工具检查元素
   - 查看是否有重叠的元素

2. **检查遮罩层**：
   - 确认加载/错误状态是否正确隐藏

---

## 📝 报告问题

如果问题仍然存在，请提供：

1. **完整的控制台日志**（从切换到分屏开始）
2. **DOM 检查结果**（运行上面的检查命令）
3. **截图**：显示右下角的 ID 标签
4. **React DevTools 截图**：显示组件树

---

**更新时间**: 2025-10-03  
**状态**: ✅ 调试工具已添加，等待测试结果

