# 🔧 修复：容器内两个 gmp-map-3d 问题

## 问题描述
**症状**：`container-map3d` 下有两个 `gmp-map-3d` 元素

**原因**：React Strict Mode 在开发环境下会故意将组件挂载两次来检测副作用问题。由于我们的 useEffect 中没有正确处理这种情况，导致地图实例被添加了两次。

---

## 已实施的三重修复

### 🛡️ 修复 1：添加前检查（防御性编程）

在创建地图实例之前，检查容器是否已经有地图：

```typescript
// 在 init3DMap 函数开始处
const existingMaps = containerRef.current.querySelectorAll('gmp-map-3d');
if (existingMaps.length > 0) {
  console.warn(`⚠️ 容器已有 ${existingMaps.length} 个地图实例，跳过创建`);
  return;
}
```

**效果**：如果 React Strict Mode 导致 useEffect 执行第二次，会检测到已有地图并跳过创建。

---

### 🚦 修复 2：使用 isMounted 标志（异步保护）

由于地图创建是异步的，需要标志来防止在组件卸载后继续执行：

```typescript
let isMounted = true;

async function init3DMap() {
  // ... 创建地图实例 ...
  
  // 在添加到 DOM 前检查
  if (!isMounted) {
    console.log('组件已卸载，取消添加');
    return;
  }
  
  containerRef.current.appendChild(map3dInstance);
  
  // 在设置状态前再次检查
  if (!isMounted) {
    console.log('组件已卸载，移除刚添加的地图');
    containerRef.current.removeChild(map3dInstance);
    return;
  }
  
  setMap3d(map3dInstance);
  setIsReady(true);
}

// 清理函数
return () => {
  isMounted = false; // 标记为已卸载
  // ...
};
```

**效果**：防止异步操作在组件卸载后修改 DOM 和状态。

---

### 🧹 修复 3：强制清理残留实例（兜底方案）

在清理函数中彻底清除所有可能残留的地图：

```typescript
return () => {
  console.log('🧹 组件卸载，开始清理');
  isMounted = false;
  
  // 移除已知的地图实例
  if (map3dInstance) {
    // ... 移除 map3dInstance ...
  }
  
  // 清理所有可能残留的地图实例（兜底）
  if (containerRef.current) {
    const remainingMaps = containerRef.current.querySelectorAll('gmp-map-3d');
    if (remainingMaps.length > 0) {
      console.log(`🗑️ 清理残留的 ${remainingMaps.length} 个地图实例`);
      remainingMaps.forEach((map, index) => {
        map.remove();
        console.log(`✅ 移除残留地图 ${index + 1}`);
      });
    }
  }
};
```

**效果**：即使前面的逻辑出错，也能在清理时强制移除所有地图实例。

---

## 🧪 验证修复

### 测试步骤

1. **清理缓存并重启**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **打开浏览器并查看控制台**
   - 访问 http://localhost:3000
   - F12 打开控制台
   - 清空控制台

3. **切换到分屏模式**
   - 点击 "分屏视图"

4. **查看控制台日志**

   **如果修复成功**，你会看到：
   ```
   🚀 [Map3DWithMarkers] useEffect 初始化开始 - ID: xxx-abc123
   🔍 [Map3DWithMarkers] 检查容器
   ✅ [Map3DWithMarkers] 容器找到: { existingChildren: 0 }
   🏗️ [Map3DWithMarkers] 创建 Map3DElement 实例
   ➕ [Map3DWithMarkers] 添加地图到DOM
   📍 [Map3DWithMarkers] 容器现在有 1 个子元素  ← 只有1个！
   🎉 [Map3DWithMarkers] 3D 地图初始化完成
   
   // 如果 Strict Mode 触发第二次挂载
   🧹 [Map3DWithMarkers] 组件卸载，开始清理
   🗑️ [Map3DWithMarkers] 移除地图实例
   ✅ [Map3DWithMarkers] 3D 地图已清理
   
   🚀 [Map3DWithMarkers] useEffect 初始化开始 - ID: xxx-abc123
   🔍 [Map3DWithMarkers] 检查容器
   ⚠️ [Map3DWithMarkers] 容器已有 1 个地图实例，跳过创建  ← 防止重复！
   ```

5. **检查 DOM**

   在控制台运行：
   ```javascript
   // 应该只有1个容器
   document.querySelectorAll('[data-component="Map3DWithMarkers"]').length
   // 输出: 1
   
   // 应该只有1个地图实例
   document.querySelectorAll('gmp-map-3d').length
   // 输出: 1
   
   // 检查容器内的地图数量
   const container = document.querySelector('[data-component="Map3DWithMarkers"]');
   container.querySelectorAll('gmp-map-3d').length
   // 输出: 1  ← 关键！之前是2
   ```

6. **视觉检查**
   - 右侧应该只有**一个** 3D 地图
   - 右下角只有**一个**状态指示器
   - 没有重叠或上下排列的地图

---

## 🎯 预期结果

### ✅ 修复成功
- DOM 中只有 **1 个** `gmp-map-3d` 元素
- 右下角只有 **1 个**状态指示器
- 控制台显示检测到已有地图并跳过创建
- 视觉上只看到一个 3D 地图

### ❌ 如果还有问题
请查看控制台并提供：
1. 完整的初始化日志
2. `container.querySelectorAll('gmp-map-3d').length` 的输出
3. 是否看到 "容器已有 X 个地图实例，跳过创建" 的警告

---

## 💡 关于 React Strict Mode

**什么是 Strict Mode？**
- React 18 的一个开发模式功能
- 会故意挂载、卸载、再挂载组件
- 用于检测副作用问题

**为什么会导致双重渲染？**
```
1. 组件挂载 → useEffect 执行 → 创建地图
2. 组件卸载 → 清理函数执行 → 应该移除地图
3. 组件再挂载 → useEffect 再执行 → 应该不创建重复地图
```

**我们的修复如何应对？**
- 步骤 2：清理函数现在会彻底移除所有地图
- 步骤 3：重新执行时检测到已有地图，跳过创建

**是否应该禁用 Strict Mode？**
- ❌ **不推荐**：Strict Mode 帮助我们发现真实问题
- ✅ **推荐**：正确处理副作用（我们现在做的）
- ℹ️ **生产环境**：Strict Mode 自动禁用，不会有双重渲染

---

## 📚 技术总结

这个问题展示了 React 18 和 Web Components 集成时需要注意的几点：

1. **Web Components 不是 React 元素**
   - 需要手动管理生命周期
   - 必须在 cleanup 中手动移除

2. **异步操作需要保护**
   - 使用 `isMounted` 标志
   - 在关键操作前检查组件状态

3. **防御性编程**
   - 在操作前检查前置条件
   - 提供兜底方案（强制清理）

4. **详细的日志**
   - 帮助诊断问题
   - 确认修复效果

---

**修复时间**: 2025-10-03  
**状态**: ✅ 已实施三重修复，等待验证

