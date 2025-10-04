分析 /Users/cocui/i100/kkMy/github/Map/代码，
分析 编辑 按钮不能work的问题

## 问题分析 ✅

**根本原因：**
在 `app/page.tsx` 中，`MarkerList` 组件缺少 `onMarkerEdit` 属性。

**详细分析：**
1. ✅ MarkerCard 组件有编辑按钮（第66行）
2. ✅ MarkerList 将 onMarkerEdit 传递给 MarkerCard（第51行）
3. ❌ **app/page.tsx 没有传递 onMarkerEdit 给 MarkerList**（第157-162行）
4. ✅ useMarkerMutations hook 有 updateMarker 函数

## 解决方案 ✅

### 修改的文件：`app/page.tsx`

1. **添加状态** (第39行)
   - 添加 `editingMarker` 状态跟踪正在编辑的标记
   - 从 hook 中提取 `updateMarker` 函数

2. **添加编辑处理函数** (第72-77行)
   ```typescript
   const handleMarkerEdit = (marker: any) => {
     setEditingMarker(marker);
     setSelectedPosition({ lat: marker.latitude, lng: marker.longitude });
     setIsMarkerFormOpen(true);
   };
   ```

3. **更新提交处理函数** (第80-108行)
   - 支持创建和更新两种模式
   - 根据是否有 `editingMarker` 决定调用 createMarker 还是 updateMarker

4. **传递 onMarkerEdit 给 MarkerList** (第180行)
   ```typescript
   <MarkerList
     onMarkerEdit={handleMarkerEdit}
     ...
   />
   ```

5. **更新 Modal 标题和初始数据** (第217、220-229行)
   - 动态标题："编辑标记" 或 "添加新标记"
   - 传递编辑标记的完整数据到表单

## 测试建议

1. 点击列表中标记的"编辑"按钮
2. 确认弹出窗口显示现有标记数据
3. 修改标题或描述
4. 保存并确认更新成功