# 网站布局调整说明

## 修改内容

### 1. 去除左右两侧栏
- ✅ 删除了左侧栏（文章分类、最新文章、热门标签）
- ✅ 删除了右侧栏（订阅框、快速链接、社交媒体）
- ✅ 所有页面模板已更新为单栏布局

### 2. 增加中间内容宽度
- 从原来的 `max-width: 900px` 增加到 `max-width: 1200px`
- 内容区域现在更加宽敞，阅读体验更好

### 3. 背景图片设计

#### 实现方式
使用 CSS 的 `::before` 和 `::after` 伪元素实现背景图片 + 透明度效果：

- **`body::before`**：背景图片层
  - 亮色模式：山脉风景图（Unsplash）
  - 暗色模式：雪山夜景图（Unsplash）
  - 透明度：通过 `opacity` 属性控制（亮色 0.3，暗色 0.2）
  
- **`body::after`**：颜色叠加层
  - 在图片上方叠加半透明渐变颜色
  - 增强文字可读性
  - 保持整体色调统一

#### 背景图片来源
使用的是 Unsplash 免费高清图库：
- 亮色模式：https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80
- 暗色模式：https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80

这些图片是免费商用的，您可以直接使用。

### 4. 视觉效果
- 内容卡片悬浮在背景图片上方
- 半透明玻璃拟态效果（`backdrop-filter: blur`）
- 背景图片透明度可调（CSS 中的 `opacity` 值）
- 固定背景（`background-attachment: fixed`），滚动时图片不动

## 如何自定义背景图片

### 方式一：更换图片链接（推荐）
在 `public/styles/style.css` 中修改：

**亮色模式背景（约第 37 行）：**
```css
body::before {
    background-image: url('您的图片链接');
    opacity: 0.3; /* 调整透明度 0-1 */
}
```

**暗色模式背景（约第 66 行）：**
```css
body.dark-mode::before {
    background-image: url('您的图片链接');
    opacity: 0.2; /* 调整透明度 0-1 */
}
```

### 方式二：使用本地图片
1. 将图片放入 `public/images/` 目录
2. 修改 CSS：
```css
body::before {
    background-image: url('/images/your-image.jpg');
}
```

### 调整透明度
- `opacity: 0.1` - 非常淡
- `opacity: 0.3` - 适中（当前设置）
- `opacity: 0.5` - 较明显
- `opacity: 0.8` - 很清晰

## 免费图片资源推荐

1. **Unsplash** - https://unsplash.com
   - 高质量免费图片
   - 可商用
   - 搜索关键词：landscape, nature, mountain, abstract

2. **Pexels** - https://www.pexels.com
   - 免费图片和视频
   - 无需署名

3. **Pixabay** - https://pixabay.com
   - 免费图片、插画、矢量图

## 修改的文件

### CSS 样式
- `public/styles/style.css`
  - 修改背景为图片 + 透明度
  - 调整主内容区宽度
  - 隐藏侧边栏

### 页面模板
- `public/views/layout.html` - 去除侧边栏
- `public/views/home.html` - 去除侧边栏
- `public/views/blog.html` - 去除侧边栏
- `public/views/about.html` - 去除侧边栏
- `public/views/contact.html` - 去除侧边栏
- `public/views/privacy.html` - 去除侧边栏

## 预览效果

部署后您将看到：
1. 页面背景是一张半透明的风景图片
2. 中间内容区宽度增加，更加宽敞
3. 内容卡片有玻璃拟态效果，悬浮在背景上
4. 没有左右侧边栏，页面更加简洁
5. 导航栏固定在顶部

## 下一步建议

如果您想进一步定制：

1. **更换背景图片**：选择您喜欢的图片，修改 CSS 中的 URL
2. **调整透明度**：根据图片色调调整 `opacity` 值
3. **添加颜色叠加**：修改 `body::after` 的渐变颜色
4. **调整内容宽度**：修改 `.main-content` 的 `max-width` 值

---

更新时间：2026-05-27
