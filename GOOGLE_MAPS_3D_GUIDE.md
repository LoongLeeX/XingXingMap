# 🌐 Google Maps 3D 使用指南

## 📖 概述

Google Maps 3D 使用新的 `Map3DElement` API，与传统的 2D 地图 API 不同。

## 🔑 API 差异

### 传统 2D 地图 API
```javascript
const map = new google.maps.Map(container, {
  center: { lat: 37.7704, lng: -122.3985 },
  zoom: 15,
  mapTypeId: 'satellite'
});
```

### 新的 3D 地图 API (Map3DElement)
```javascript
const { Map3DElement } = await google.maps.importLibrary("maps3d");

const map3D = new Map3DElement({
  center: {
    lat: 37.7704,
    lng: -122.3985,
    altitude: 500  // 3D 需要高度
  },
  tilt: 67.5,
  heading: 0,
  range: 1000,     // 视距
  mode: 'HYBRID'   // 'HYBRID' 或 'UNLIT'
});

container.appendChild(map3D);
```

## ⚙️ 配置参数

### center
```javascript
{
  lat: number,      // 纬度
  lng: number,      // 经度
  altitude: number  // 高度（米），3D 特有
}
```

### tilt
- 类型: `number`
- 范围: 0-90 度
- 说明: 地图倾斜角度，0 为俯视，90 为平视
- 推荐: 67.5 度

### heading
- 类型: `number`
- 范围: 0-360 度
- 说明: 地图旋转角度，0 为正北

### range
- 类型: `number`
- 单位: 米
- 说明: 相机到中心点的距离（视距）

### mode
- `'HYBRID'`: 混合模式，显示建筑和标注
- `'UNLIT'`: 无光照模式

## 🚀 启用 3D 地图的步骤

### 1. 启用必需的 API

在 Google Cloud Console 中启用：
- ✅ **Maps JavaScript API**
- ✅ **Map Tiles API** (3D 地图必需)
- ✅ **Places API** (如果使用搜索)

### 2. 创建 Map ID（可选）

虽然 `Map3DElement` 不需要 Map ID，但如果要使用混合模式（2D+3D），可能需要配置。

1. 访问 [Map Management](https://console.cloud.google.com/google/maps-apis/studio/maps)
2. 创建新的 Map ID
3. 配置地图样式（可选）

### 3. 配置环境变量

```env
# Google Maps API Key（必需）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# Map ID（可选，用于高级功能）
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_map_id
```

## 🎯 支持的城市

3D 地图并非全球覆盖，目前支持的主要城市包括：

### 北美
- 旧金山、洛杉矶、纽约、芝加哥、拉斯维加斯等

### 欧洲
- 伦敦、巴黎、罗马、柏林、阿姆斯特丹等

### 亚洲
- 东京、首尔、新加坡、香港、台北等
- **中国大陆城市支持有限**

### 其他
- 悉尼、墨尔本等

**查看支持的城市**: [Google Maps Platform Coverage](https://developers.google.com/maps/coverage)

## 🔍 功能对比

| 功能 | 2D 地图 (google.maps.Map) | 3D 地图 (Map3DElement) |
|------|---------------------------|------------------------|
| 全球覆盖 | ✅ 完全支持 | ⚠️ 部分城市 |
| 标记 (Markers) | ✅ 完全支持 | ❌ 不支持* |
| 信息窗口 | ✅ 支持 | ❌ 不支持* |
| 绘图工具 | ✅ 支持 | ❌ 不支持 |
| 3D 建筑 | ⚠️ 有限 | ✅ 完全支持 |
| 倾斜旋转 | ⚠️ 有限 | ✅ 完全支持 |
| 光照效果 | ❌ 不支持 | ✅ 支持 |

*注意: Map3DElement 是一个 Web Component，不支持传统的 2D 地图 API（如 Markers）。

## 💡 使用建议

### 何时使用 3D 地图？
- ✅ 需要展示建筑物细节
- ✅ 需要不同视角（倾斜、旋转）
- ✅ 目标位置在支持的城市
- ✅ 纯展示用途，不需要交互标记

### 何时使用 2D 地图？
- ✅ 需要添加标记和信息窗口
- ✅ 需要全球任意位置
- ✅ 需要绘图和测量工具
- ✅ 需要复杂的交互功能

### 推荐方案：分屏对比
```
本项目采用的方案：
- 左侧：2D 卫星地图（支持标记和交互）
- 右侧：3D 真实感地图（展示建筑细节）
- 优势：两者互补，最佳用户体验
```

## 🐛 常见问题

### Q: 3D 地图不显示？
**A**: 检查以下几点：
1. Map Tiles API 是否已启用
2. 当前位置是否支持 3D（尝试旧金山: 37.7704, -122.3985）
3. 浏览器控制台是否有错误

### Q: 如何在 3D 地图上添加标记？
**A**: Map3DElement 不支持传统的 `google.maps.Marker`。建议使用分屏模式，在 2D 地图上添加标记。

### Q: 3D 地图性能问题？
**A**: 3D 地图需要更多性能：
- 使用现代浏览器（Chrome/Edge 最佳）
- 确保硬件加速已启用
- 避免同时渲染多个 3D 地图

### Q: 可以控制 3D 地图的视角吗？
**A**: 可以通过修改以下属性：
```javascript
map3D.center = { lat, lng, altitude };
map3D.tilt = 67.5;
map3D.heading = 45;
map3D.range = 1000;
```

## 📚 参考资源

- [Map3DElement 文档](https://developers.google.com/maps/documentation/javascript/3d-tiles)
- [3D Maps 示例](https://developers.google.com/maps/documentation/javascript/examples/3d-overview)
- [迁移指南](https://developers.google.com/maps/documentation/javascript/3d-migration)

## 🎨 本项目实现

本项目在以下文件中实现了 3D 地图：
- `features/map/hooks/use3DMap.ts` - 3D 地图 Hook
- `features/map/components/Map3D.tsx` - 3D 地图组件
- `features/map/components/SplitView.tsx` - 2D/3D 分屏对比

---

**最后更新**: 2025-10-03  
**Google Maps Platform 版本**: Latest (weekly)

