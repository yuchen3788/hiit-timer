# HIIT 循环定时器 - 设计文档

> 日期：2026-03-03
> 平台：iPhone 17（PWA，添加到主屏幕使用）
> 技术栈：Vue 3 + Vite + Pinia + vite-plugin-pwa

## 1. 项目概述

一个 HIIT（高强度间歇训练）循环定时器，支持自定义多个动作、休息时长和循环次数，可保存训练方案。以 PWA 形式运行在 iPhone 上，添加到主屏幕后体验接近原生 App，支持离线使用。

## 2. 项目结构

```
hiit-timer/
├── src/
│   ├── components/
│   │   ├── TimerDisplay.vue      # 倒计时大数字 + 圆形进度环
│   │   ├── TimerControls.vue     # 开始/暂停/重置按钮
│   │   ├── ExerciseProgress.vue  # 当前动作进度指示条
│   │   └── PlanEditor.vue        # 训练方案编辑器（弹窗）
│   ├── views/
│   │   ├── TimerView.vue         # 计时器主页面
│   │   └── PlansView.vue         # 训练方案列表页
│   ├── stores/
│   │   └── timer.ts              # Pinia store - 定时器状态 & 方案持久化
│   ├── utils/
│   │   └── audio.ts              # 声音/震动提示工具
│   ├── App.vue
│   └── main.ts
├── public/
│   └── icons/                    # PWA 图标 (192x192, 512x512)
├── index.html
└── vite.config.ts                # Vite + PWA 插件配置
```

## 3. 数据模型

```ts
// 单个动作
interface Exercise {
  id: string
  name: string          // 如 "深蹲"、"波比跳"
  duration: number      // 秒
}

// 训练方案
interface Plan {
  id: string
  name: string          // 如 "晨间燃脂"
  exercises: Exercise[] // 动作列表
  restDuration: number  // 动作间休息时长（秒）
  rounds: number        // 循环次数
}

// 定时器状态
interface TimerState {
  status: 'idle' | 'running' | 'paused'  // 空闲 | 运行中 | 已暂停
  currentRound: number                    // 当前第几轮
  currentExerciseIndex: number            // 当前动作索引
  remainingSeconds: number                // 当前阶段剩余秒数
  phase: 'exercise' | 'rest'             // 运动阶段 | 休息阶段
}
```

**持久化**：训练方案使用 localStorage 存储，添加到主屏幕后数据持久不丢失。

## 4. 页面与交互

### 训练方案页（PlansView）
- 已保存的方案卡片列表（渐变色卡片）
- 卡片显示：方案名、动作数量、总时长
- 点击卡片 → 进入计时器页开始训练
- 右上角「+」→ 弹出编辑器创建新方案
- 左滑删除，点击编辑图标修改

### 计时器页（TimerView）
- 顶部：当前轮次（第 2/4 轮）
- 中央：大号倒计时数字 + 圆形进度环
- 中央下方：当前动作名，运动时橙红色，休息时蓝绿色
- 底部：动作序列缩略条，高亮当前动作
- 控制按钮：开始 / 暂停 / 重置
- 阶段切换时：声音提示 + 震动反馈

### 导航
- 底部 Tab 栏切换两个页面

## 5. UI 视觉风格（Nike 运动风）

- **背景**：深灰近黑（#1a1a1a）
- **主色调**：运动阶段橙红渐变（#FF6B35 → #FF2D55），休息阶段蓝绿渐变（#00C9FF → #92FE9D）
- **卡片**：大圆角，微透明毛玻璃效果，轻微阴影
- **字体**：倒计时数字 80px+ 加粗，系统字体 -apple-system
- **按钮**：大圆形，渐变填充，按下缩放动效
- **进度环**：SVG 圆形进度条，渐变描边，随倒计时动态减少
- **动画**：阶段切换背景色平滑过渡（0.5s），数字切换弹性动效

## 6. PWA 配置与部署

- **离线支持**：vite-plugin-pwa 生成 Service Worker，缓存全部静态资源
- **Manifest**：display: standalone，隐藏浏览器 UI
- **图标**：192x192 和 512x512 两套
- **部署**：本地 `npm run build` → `npx serve dist` → 手机 Safari 访问 Mac 局域网 IP → 添加到主屏幕
- **注意**：Service Worker 离线缓存需 HTTPS，局域网可后续配自签名证书

## 7. 功能迭代（2026-03-04）

### 7.1 动作拖拽排序

- 引入 `vuedraggable`（基于 sortablejs）
- `PlanEditor.vue` 动作列表用 `<draggable>` 组件包裹
- 左侧序号改为拖拽手柄图标（≡），长按拖动调整顺序
- 拖拽中添加视觉反馈（半透明 + 阴影）

### 7.2 编辑器弹窗刘海屏适配

- `.editor-sheet` 的 `max-height` 从 `90vh` 改为 `calc(100vh - var(--safe-area-top))`
- 确保弹窗内容不会被刘海遮挡

### 7.3 倒计时防锁屏（Wake Lock）

- 计时器 `start` 时调用 `navigator.wakeLock.request('screen')` 获取屏幕锁
- `pause` / `reset` / `completed` 时释放锁
- 监听 `visibilitychange` 事件，页面重新可见时自动重新获取锁
- 目标平台 iOS 26，原生支持 Wake Lock API，无需 fallback

### 7.4 倒计时动作名放大

- `TimerDisplay.vue` 的 phase-label 区域改为动态内容：
  - 运动阶段：显示当前动作名称（如"深蹲"、"波比跳"）
  - 休息阶段：显示"休息"
- 字体放大，确保在运动中清晰可读

### 7.5 训练记录与月度统计

#### 数据模型

```ts
interface WorkoutRecord {
  id: string
  planName: string       // 方案名称
  totalDuration: number  // 总时长（秒）
  completedAt: number    // 完成时间戳
}
```

使用 localStorage 持久化，存储在 Pinia store 中。

#### 记录时机

- 训练状态变为 `completed` 时，自动写入一条记录

#### 统计页（StatsView）

- **新增底部 Tab**「统计」，图标用柱状图样式
- **顶部汇总**：本月完成次数 + 本月总训练时长
- **日历视图**：按月展示，每个格子代表一天，二元状态——已训练（主题色高亮）/ 未训练（暗灰），每天最多一次训练
- **月份切换**：左右箭头翻页，中间显示「2026年3月」
- **底部记录列表**：选中月份的训练记录，显示日期、方案名、时长

#### 涉及文件

- 新增 `src/stores/records.ts` — 训练记录 store
- 新增 `src/views/StatsView.vue` — 统计页
- 修改 `src/router/index.ts` — 添加统计页路由
- 修改 `src/App.vue` — 底部 Tab 栏添加「统计」入口
- 修改 `CompletionView.vue` 或 `src/stores/timer.ts` — 完成训练时写入记录
