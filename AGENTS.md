# HIIT Timer - 项目指南

## 项目概述
HIIT（高强度间歇训练）计时器，PWA 移动端优先应用。用户可创建训练方案（包含多个动作、休息时间、循环轮次），在计时页面执行训练，完成后记录统计。

## 技术栈
- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4 (Hash 模式)
- **后端**: 腾讯云开发 CloudBase（@cloudbase/js-sdk）- 匿名登录 + 数据库
- **拖拽**: vuedraggable
- **PWA**: vite-plugin-pwa
- **样式**: 纯 CSS（CSS 变量主题系统，无 UI 框架）

## 代码规范
- 所有 Vue 组件使用 `<script setup lang="ts">` Composition API
- 路径别名 `@` → `./src`
- 中文 UI，代码注释中英文混合
- 无测试框架，无 ESLint/Prettier 配置
- CSS 使用 scoped，全局变量在 `src/style.css`

## 项目结构

```
src/
├── main.ts                  # 入口：初始化 Pinia、Router、CloudBase 匿名登录
├── App.vue                  # 根组件：底部 Tab 栏（训练/统计）
├── style.css                # 全局 CSS 变量（暗色/浅色主题）
├── types/index.ts           # 类型定义：Exercise, Plan, TimerState, WorkoutRecord
├── router/index.ts          # 路由：/ (plans), /timer/:planId, /completion, /stats
├── stores/
│   ├── plans.ts             # 训练方案 CRUD，CloudBase 实时监听
│   ├── timer.ts             # 计时器核心逻辑（start/pause/reset/advancePhase）
│   ├── records.ts           # 训练记录，CloudBase 实时监听
│   └── theme.ts             # 暗色/浅色主题切换，localStorage 持久化
├── views/
│   ├── PlansView.vue        # 首页：方案列表 + 新建/编辑/删除
│   ├── TimerView.vue        # 计时页：动态背景 + 倒计时 + 控制按钮
│   ├── CompletionView.vue   # 完成页：统计摘要 + 励志语录
│   └── StatsView.vue        # 统计页：日历热力图 + 月度记录列表
├── components/
│   ├── PlanEditor.vue       # 底部弹出式方案编辑器（支持拖拽排序）
│   ├── TimerDisplay.vue     # 倒计时大字显示
│   ├── TimerControls.vue    # 开始/暂停/重置按钮
│   ├── ExerciseProgress.vue # 动作进度横向滚动条
│   └── ThemeToggle.vue      # 主题切换开关
└── utils/
    ├── cloudbase.ts         # CloudBase 初始化、匿名登录、CRUD 封装、实时监听
    ├── audio.ts             # Web Audio API 音效（倒计时提示音、阶段切换音、完成音）
    └── quotes.ts            # 励志语录库
```

## 核心数据模型（src/types/index.ts）
- **Plan**: { id, name, exercises[], restDuration, roundRestDuration, rounds }
- **Exercise**: { id, name, duration }
- **WorkoutRecord**: { id, planName, totalDuration, completedAt }
- **TimerStatus**: 'idle' | 'running' | 'paused' | 'completed'
- **TimerPhase**: 'exercise' | 'rest'

## 关键业务逻辑

### 计时器流程（stores/timer.ts）
1. `loadPlan()` → 初始化状态
2. `start()` → 设置 targetTime，启动 requestAnimationFrame + setInterval 双重计时
3. `tick()` → 基于 Date.now() 计算剩余时间（防止后台暂停不准）
4. `advancePhase()` → 动作→休息→下一动作→轮间休息→下一轮→完成
5. `complete()` → 自动保存训练记录到 CloudBase

### CloudBase 数据路径
- 方案: `users/{uid}/plans`
- 记录: `users/{uid}/records`
- 使用 `watch()` 实时监听数据变更

### 主题系统（style.css）
- 暗色（默认）: 深色背景 + 红橙运动色 + 青蓝休息色
- 浅色: 浅灰白背景 + 紫色运动色 + 绿色休息色
- 通过 `data-theme` 属性切换，localStorage 持久化

## 环境变量（.env）
- `VITE_CLOUDBASE_ENV_ID` - 云开发环境 ID
- `VITE_CLOUDBASE_REGION` - 区域（如 ap-shanghai）
- `VITE_CLOUDBASE_ACCESS_KEY` - Publishable Key

## 开发命令
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建（vue-tsc 类型检查 + vite build）
- `npm run preview` - 预览构建产物

## 快捷指令
- **msg**: 当用户输入 `msg` 时，执行 `git diff --staged` 和 `git diff`，分析工作区所有改动，生成一条简洁的 Git commit message（中文，Conventional Commits 格式，如 `feat: xxx` / `fix: xxx`）。只输出 message，不做其他操作。
