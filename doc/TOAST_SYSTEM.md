# Toast 提示系统

## 概述

替换了原有的 `alert()` 提示，使用美观的 Toast 组件，支持复制错误信息。

## 特性

✅ **美观的 UI** - 现代化的卡片式提示  
✅ **可复制错误** - 点击 📋 按钮复制完整错误信息  
✅ **多种类型** - 成功、错误、警告、信息  
✅ **智能关闭** - 错误提示不会自动关闭，其他类型会自动关闭  
✅ **平滑动画** - 从右侧滑入的动画效果  
✅ **多提示支持** - 支持同时显示多个提示  

## 使用方法

### 导入

```typescript
import { toast } from '@/client/src/components/ui/Toast';
```

### 基本用法

```typescript
// 成功提示（3秒后自动关闭）
toast.success('操作成功', '可选的详细信息');

// 错误提示（不会自动关闭，支持复制）
toast.error('操作失败', '详细的错误信息');

// 警告提示（4秒后自动关闭）
toast.warning('注意', '警告信息');

// 信息提示（3秒后自动关闭）
toast.info('提示', '提示信息');
```

### 实际示例

```typescript
// 创建标记
try {
  await createMarker(data);
  toast.success('标记已创建', '标记信息已保存');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : '未知错误';
  toast.error('创建标记失败', errorMessage);
}
```

## Toast 类型

### Success (成功)
- **颜色**: 绿色
- **图标**: ✅
- **自动关闭**: 3秒
- **适用场景**: 操作成功、数据保存成功

### Error (错误)
- **颜色**: 红色
- **图标**: ❌
- **自动关闭**: 不关闭（需手动关闭）
- **支持复制**: ✓
- **适用场景**: 错误提示、操作失败

### Warning (警告)
- **颜色**: 黄色
- **图标**: ⚠️
- **自动关闭**: 4秒
- **适用场景**: 警告信息、注意事项

### Info (信息)
- **颜色**: 蓝色
- **图标**: ℹ️
- **自动关闭**: 3秒
- **适用场景**: 一般提示、信息通知

## 复制功能

错误提示会显示 📋 按钮，点击后可以复制完整的错误信息：

```
操作失败

详细的错误信息...
```

复制成功后，按钮会变成 ✓ 2秒钟。

## 高级用法

### 使用 Zustand Store

如果需要更多控制，可以直接使用 store：

```typescript
import { useToastStore } from '@/client/src/components/ui/Toast';

// 在组件中
const { showToast, hideToast, clearAll } = useToastStore();

// 显示自定义 Toast
showToast({
  type: 'error',
  title: '错误',
  message: '详细信息',
  duration: 0, // 0 表示不自动关闭
  canCopy: true,
});

// 手动关闭指定的 Toast
hideToast(toastId);

// 清除所有 Toast
clearAll();
```

## 技术实现

### 文件结构

```
client/src/components/ui/Toast.tsx  - Toast 组件和 Store
app/layout.tsx                      - ToastContainer 容器
app/globals.css                     - 动画样式
```

### 关键技术

- **状态管理**: Zustand
- **动画**: CSS Keyframes
- **剪贴板**: Navigator Clipboard API
- **样式**: Tailwind CSS

### ToastContainer

ToastContainer 放置在 `app/layout.tsx` 中，位于页面右上角：

```tsx
<body className={inter.className}>
  {children}
  <ToastContainer />
</body>
```

## 迁移指南

### 从 alert() 迁移

**之前：**
```typescript
alert('操作成功');
alert('操作失败: ' + error.message);
```

**之后：**
```typescript
import { toast } from '@/client/src/components/ui/Toast';

toast.success('操作成功');
toast.error('操作失败', error.message);
```

### 从 confirm() 迁移

`confirm()` 仍然保留，因为 Toast 不支持用户交互确认。如果需要确认对话框，继续使用 `confirm()` 或创建自定义 Modal 组件。

## 样式定制

Toast 样式在 `Toast.tsx` 中定义，基于 Tailwind CSS：

```typescript
const styles = {
  bg: 'bg-red-50 border-red-200',
  icon: '❌',
  iconBg: 'bg-red-100 text-red-600',
  title: 'text-red-900',
  message: 'text-red-700',
};
```

## 已知限制

1. **confirm() 未替换** - 删除确认等场景仍使用原生 `confirm()`
2. **无队列限制** - 没有限制最大显示数量（可以扩展）
3. **位置固定** - 当前固定在右上角（可以扩展支持其他位置）

## 未来改进

- [ ] 支持更多位置（左上、左下、右下、顶部、底部）
- [ ] 添加进度条显示剩余时间
- [ ] 支持 Toast 队列限制
- [ ] 添加声音提示（可选）
- [ ] 支持自定义图标和颜色
- [ ] 添加 Toast 历史记录

## 相关文件

- `client/src/components/ui/Toast.tsx` - Toast 组件
- `app/layout.tsx` - ToastContainer 容器
- `app/globals.css` - Toast 动画
- `app/page.tsx` - Toast 使用示例
