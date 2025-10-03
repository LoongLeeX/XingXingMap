# 3D 地图交互功能

## 📝 功能概述

为 3D 地图（`Map3DWithMarkers` 组件）添加了完整的鼠标和键盘交互控制，允许用户通过拖拽和键盘来旋转 3D 地图视角。

## 🎮 交互方式

### 1. 鼠标拖拽旋转
- **操作**: 在 3D 地图上按住鼠标左键并拖动
- **效果**: 旋转地图的 heading（方位角）
- **灵敏度**: 0.3 度/像素
- **视觉反馈**: 
  - 鼠标悬停时显示 `grab` 光标
  - 拖拽时显示 `grabbing` 光标

### 2. 键盘控制
- **← 左方向键**: 逆时针旋转（每次 5 度）
- **→ 右方向键**: 顺时针旋转（每次 5 度）

## 🏗️ 实现细节

### 核心代码位置
- **文件**: `/features/map/components/Map3DWithMarkers.tsx`
- **相关代码行**: 第 37-41 行（状态定义）、第 135-217 行（事件处理）

### 状态管理
使用 `useRef` 存储鼠标交互状态：
```typescript
const mouseStateRef = useRef({
  isMouseDown: false,      // 鼠标是否按下
  lastMouseX: 0,           // 上一次鼠标 X 坐标
  currentHeading: 0        // 当前方位角
});
```

### 事件监听器
在地图实例创建后添加以下事件监听器：
- `mousedown`: 记录鼠标按下状态和初始位置
- `mousemove`: 计算鼠标移动距离并更新 heading
- `mouseup`: 释放鼠标，恢复光标样式
- `mouseleave`: 鼠标离开地图时停止拖拽
- `keydown` (document): 监听方向键

### 清理机制
在组件卸载时自动清理所有事件监听器，防止内存泄漏。

## 🎯 适用场景

### 分屏模式
在分屏视图 (`SplitView`) 中，3D 地图会自动支持这些交互功能，用户可以：
- 在左侧 2D 地图上查看俯视图
- 在右侧 3D 地图上拖拽旋转，查看不同角度的 3D 建筑和地形

### 单独 3D 模式
在单独的 3D 地图模式下，用户可以充分利用这些交互功能探索 3D 场景。

## 💡 用户提示

在 3D 地图加载完成后，会在右上角显示一个蓝色的交互提示框：
- **内容**: 说明鼠标拖拽和键盘控制方法
- **关闭按钮**: 用户可以点击 ✕ 按钮隐藏提示
- **状态保持**: 关闭后在当前会话中不再显示

## 🔧 技术特性

### 1. 平滑旋转
- 实时响应鼠标移动
- Heading 值自动保持在 0-360 度范围内
- 无跳跃，旋转流畅

### 2. 性能优化
- 使用 `useRef` 避免不必要的重渲染
- 事件监听器在组件卸载时及时清理
- 鼠标状态在 ref 中存储，避免状态更新开销

### 3. 兼容性
- 与地图的原生交互（缩放、平移）完全兼容
- 不影响标记的点击事件
- 支持所有现代浏览器

## 📊 参数配置

### 可调整参数

在代码中可以轻松调整以下参数：

```typescript
// 鼠标拖拽灵敏度（第 159 行）
mouseStateRef.current.currentHeading -= deltaX * 0.3;  // 改变 0.3 调整灵敏度

// 键盘旋转速度（第 183 行）
const rotateSpeed = 5;  // 改变此值调整键盘旋转速度
```

## 🎉 使用示例

### 基础使用
```typescript
import { Map3DWithMarkers } from '@/features/map/components/Map3DWithMarkers';

function MyComponent() {
  return (
    <Map3DWithMarkers
      markers={markers}
      onMapClick={handleMapClick}
      onMarkerClick={handleMarkerClick}
    />
  );
}
```

### 在分屏模式中
```typescript
import { SplitView } from '@/features/map/components/SplitView';

function MyComponent() {
  return (
    <SplitView
      markers={markers}
      onMapClick={handleMapClick}
      onMarkerClick={handleMarkerClick}
    />
  );
}
```

## 🔍 调试

### 控制台日志
组件会输出以下调试信息：
- `🖱️ [Map3DWithMarkers] 添加鼠标交互控制` - 交互初始化
- `✅ [Map3DWithMarkers] 鼠标交互控制已添加` - 交互就绪
- `🧹 [Map3DWithMarkers] 鼠标交互监听器已清理` - 清理完成

### 检查状态
在浏览器控制台中可以检查组件状态：
```javascript
// 查看所有 3D 地图实例
document.querySelectorAll('gmp-map-3d');

// 查看地图的 heading 值
document.querySelector('gmp-map-3d').heading;
```

## 🚀 未来扩展

可以考虑添加的功能：
- [ ] 添加 tilt（倾斜角）控制（上下拖动）
- [ ] 添加触摸屏手势支持
- [ ] 添加旋转速度的动量效果
- [ ] 添加平滑过渡动画
- [ ] 添加旋转角度的可视化指示器
- [ ] 支持自定义灵敏度设置（UI 控件）

## 📝 版本历史

- **v1.0** (2024-10-03): 初始实现
  - 鼠标拖拽旋转
  - 键盘方向键控制
  - 交互提示
  - 事件清理机制

---

**开发时间**: 2024-10-03  
**测试环境**: macOS + Chrome  
**状态**: ✅ 已完成并测试

