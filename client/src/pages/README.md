# Pages 目录

## 架构说明

这个目录存放所有**页面级别的业务逻辑组件**。

### 设计理念

```
/app/                           # Next.js 路由层（极简）
  ├── page.tsx                  # 仅导入和导出
  └── settings/page.tsx         # 仅导入和导出

/client/src/pages/              # 业务逻辑层（完整实现）
  ├── HomePage.tsx              # 主页面的实际内容
  └── SettingsPage.tsx          # 设置页面的实际内容
```

### 为什么这样设计？

1. **Next.js 约束**
   - App Router 要求路由文件必须在 `/app` 目录
   - 这是框架级别的限制，无法修改

2. **关注点分离**
   - `/app` 目录：负责路由定义（薄层，≤10 行代码）
   - `/client/src/pages`：负责页面逻辑（厚层，完整业务实现）

3. **可移植性**
   - 所有业务代码都在 `/client` 目录
   - 可以轻松迁移到其他框架（如 Remix, React Router）
   - 便于测试、复用和维护

4. **清晰的依赖关系**
   ```
   /app/page.tsx                      # 路由入口
     └─ import HomePage from pages/   # 业务逻辑
          └─ import components/       # UI 组件
               └─ import features/    # 功能模块
   ```

### 使用规范

#### ✅ 正确做法

```typescript
// /app/page.tsx - 路由层
import { HomePage } from '@/client/src/pages/HomePage';
export default HomePage;
```

```typescript
// /client/src/pages/HomePage.tsx - 业务层
'use client';
export function HomePage() {
  // ... 完整的页面逻辑
}
```

#### ❌ 错误做法

```typescript
// ❌ 不要在 /app/page.tsx 中写业务逻辑
export default function Page() {
  const [state, setState] = useState();
  // ... 大量代码
}
```

```typescript
// ❌ 不要把路由文件放在 /client 目录
// /client/src/pages/page.tsx - 这不会创建路由！
```

### 目录结构

```
/client/src/pages/
  ├── README.md           # 本文档
  ├── HomePage.tsx        # 主页面（/）
  ├── SettingsPage.tsx    # 设置页面（/settings）
  └── ...                 # 其他页面
```

### 命名规范

- 文件名：`PascalCase.tsx`（如 `HomePage.tsx`）
- 导出：命名导出（如 `export function HomePage()`）
- 组件名：与文件名一致

### 添加新页面

1. **创建业务组件**
   ```bash
   # 在 /client/src/pages/ 创建
   touch client/src/pages/AboutPage.tsx
   ```

2. **创建路由文件**
   ```bash
   # 在 /app/ 创建
   mkdir -p app/about
   touch app/about/page.tsx
   ```

3. **连接两者**
   ```typescript
   // app/about/page.tsx
   import { AboutPage } from '@/client/src/pages/AboutPage';
   export default AboutPage;
   ```

### 优势总结

| 特性 | 优势 |
|------|------|
| **可维护性** | 业务逻辑集中在 `/client`，易于管理 |
| **可测试性** | 页面组件可独立测试，无需路由环境 |
| **可移植性** | 业务代码与框架解耦，易于迁移 |
| **清晰性** | 路由与逻辑分离，职责明确 |
| **团队协作** | `/app` 稳定，开发集中在 `/client` |

---

**提示**：这个架构保持了 Next.js 的强大功能（SSR、文件路由等），同时让业务代码更加模块化和可维护。

