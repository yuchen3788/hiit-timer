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
