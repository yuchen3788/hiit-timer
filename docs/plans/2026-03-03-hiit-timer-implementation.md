# HIIT 循环定时器 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个 Vue 3 PWA HIIT 循环定时器，支持自定义动作、保存训练方案，Nike 运动风 UI。

**Architecture:** Vue 3 + Vite + Pinia + Vue Router + vite-plugin-pwa。两个页面（方案列表 + 计时器），Pinia 管理状态，localStorage 持久化方案数据，Service Worker 实现离线缓存。

**Tech Stack:** Vue 3 (Composition API + `<script setup>`)、TypeScript、Vite、Pinia、Vue Router 4、vite-plugin-pwa

**设计文档:** `docs/plans/2026-03-03-hiit-timer-design.md`

---

### Task 1: 项目脚手架搭建

**目标：** 初始化项目，安装所有依赖，确保开发服务器能正常启动。

**步骤：**
1. 在 `~/code/hiit-timer` 目录下用 `npm create vite@latest` 创建 Vue 3 + TypeScript 模板项目
2. 安装运行时依赖：`vue-router@4`、`pinia`
3. 安装开发依赖：`vite-plugin-pwa`
4. 运行 `npm run dev` 验证开发服务器正常启动
5. 初始化 Git 仓库并提交

---

### Task 2: TypeScript 类型定义

**目标：** 定义核心数据模型，供后续所有模块引用。

**文件：** `src/types/index.ts`

**要点：**
- 定义 `Exercise` 接口（id、name、duration）
- 定义 `Plan` 接口（id、name、exercises 数组、restDuration、rounds）
- 定义 `TimerStatus`、`TimerPhase` 类型别名
- 定义 `TimerState` 接口（status、currentRound、currentExerciseIndex、remainingSeconds、phase）
- 运行 `npx vue-tsc --noEmit` 验证类型无误

---

### Task 3: 音频与震动工具

**目标：** 封装声音提示和震动反馈功能，不依赖外部音频文件。

**文件：** `src/utils/audio.ts`

**要点：**
- 使用 Web Audio API 生成提示音（`OscillatorNode`），不引入任何音频文件
- 封装 4 个函数：`playBeep`（基础短音）、`playPhaseChangeBeep`（阶段切换三连音）、`playCompleteBeep`（完成长音）、`playCountdownBeep`（倒计时最后 3 秒短音）
- 封装 `vibrate` 函数，调用 `navigator.vibrate`，不支持时静默降级

---

### Task 4: Pinia Store - 训练方案管理

**目标：** 实现训练方案的 CRUD 和 localStorage 持久化。

**文件：** `src/stores/plans.ts`

**要点：**
- 使用 Composition API 风格的 `defineStore`
- 初始化时从 localStorage 加载方案列表
- 实现 `addPlan`、`updatePlan`、`deletePlan`、`getPlan` 方法，每次操作后同步写入 localStorage
- 提供 `getPlanTotalDuration` 工具方法，计算方案总时长（含休息和循环）
- id 生成使用 `Date.now().toString(36) + Math.random().toString(36).slice(2)`

---

### Task 5: Pinia Store - 定时器逻辑

**目标：** 实现定时器的倒计时、阶段切换、轮次推进等核心逻辑。

**文件：** `src/stores/timer.ts`

**要点：**
- 用 `setInterval(tick, 1000)` 驱动倒计时
- 状态包含：currentPlan、status、currentRound、currentExerciseIndex、remainingSeconds、phase
- 计算属性：currentExercise、progress（0~1 进度值）、currentPhaseDuration
- `loadPlan(plan)` 加载方案并重置状态
- `start()` / `pause()` / `reset()` 控制定时器
- `tick()` 每秒调用：倒计时最后 3 秒播放提示音，到 0 时调用 `advancePhase()`
- `advancePhase()` 逻辑：运动→休息→下一个动作→下一轮→全部完成，每次切换触发声音和震动
- `complete()` 停止定时器，播放完成提示音和震动

---

### Task 6: Vue Router 配置

**目标：** 配置两个页面的路由，使用 hash 模式（适合 PWA 静态部署）。

**文件：** `src/router/index.ts`、修改 `src/main.ts`

**要点：**
- 使用 `createWebHashHistory()`
- 路由：`/` → PlansView，`/timer/:planId` → TimerView
- 路由组件使用懒加载 `() => import(...)`
- 在 main.ts 中注册 Pinia 和 Router

---

### Task 7: 全局样式与主题

**目标：** 建立 Nike 运动风的全局样式基础。

**文件：** 替换 `src/style.css`

**要点：**
- CSS 变量定义：背景色 `#1a1a1a`、运动渐变（橙红）、休息渐变（蓝绿）、卡片背景、文字颜色、圆角尺寸
- 全局 reset（margin、padding、box-sizing）
- body 深色背景、白色文字、系统字体 `-apple-system`、禁止文字选择
- iPhone 安全区域适配类（`env(safe-area-inset-bottom)` 等）
- 删除 Vite 模板自带的默认样式

---

### Task 8: TimerDisplay 组件

**目标：** 展示倒计时大数字和 SVG 圆形进度环。

**文件：** `src/components/TimerDisplay.vue`

**Props：** remainingSeconds、progress、phase、exerciseName

**要点：**
- 将秒数格式化为 `MM:SS` 显示，字体 64px+ 加粗
- SVG 圆形进度环：用 `stroke-dasharray` + `stroke-dashoffset` 实现进度动画
- 进度环描边使用渐变色（运动橙红 / 休息蓝绿），通过 `<linearGradient>` 定义
- 数字颜色也跟随阶段变化（CSS 渐变文字）
- 显示当前动作名和阶段标签（运动/休息）

---

### Task 9: TimerControls 组件

**目标：** 提供开始/暂停/重置控制按钮。

**文件：** `src/components/TimerControls.vue`

**Props：** status

**Emits：** start、pause、reset

**要点：**
- 主按钮（大圆形，渐变填充）：idle/paused 时显示 ▶，running 时显示 ⏸
- 重置按钮（小圆形，半透明背景）：idle 时 disabled
- 按下时 `transform: scale(0.9)` 反馈动效

---

### Task 10: ExerciseProgress 组件

**目标：** 在计时器页底部展示动作序列进度条。

**文件：** `src/components/ExerciseProgress.vue`

**Props：** exercises、currentIndex、phase

**要点：**
- 水平排列动作列表，每个动作显示圆点 + 名称
- 当前动作高亮放大，已完成动作半透明，未完成动作低透明度
- 圆点颜色跟随阶段（运动橙红 / 休息蓝绿）
- 横向可滚动，隐藏滚动条

---

### Task 11: PlanEditor 组件

**目标：** 弹窗式训练方案编辑器，支持新建和编辑。

**文件：** `src/components/PlanEditor.vue`

**Props：** visible、plan（可选，传入则为编辑模式）

**Emits：** close、save

**要点：**
- 使用 `<Teleport to="body">` 渲染到 body
- 从底部滑出的弹窗样式（`border-radius` 顶部圆角）
- 表单字段：方案名称、休息时长（秒）、循环次数、动作列表（名称+时长）
- 动作列表支持动态添加/删除
- 编辑模式：打开时用 `watch(visible)` 填充已有数据
- 保存时过滤空名称动作，验证方案名非空且至少有一个有效动作
- 底部安全区域适配

---

### Task 12: PlansView 页面

**目标：** 训练方案列表页，展示所有方案卡片，支持新建/编辑/删除。

**文件：** `src/views/PlansView.vue`

**要点：**
- 顶部标题栏 + 右上角「+」按钮打开 PlanEditor
- 方案卡片列表：每张卡片显示方案名、动作数量、总时长（格式化为分秒）
- 卡片使用渐变背景 + 毛玻璃效果 + 大圆角
- 点击卡片 → `router.push` 到 `/timer/:planId`
- 卡片上提供编辑和删除按钮（图标按钮）
- 空状态提示："还没有训练方案，点击 + 创建一个吧"
- 调用 PlanEditor 组件处理新建和编辑

---

### Task 13: TimerView 页面

**目标：** 计时器主页面，组装所有计时器组件。

**文件：** `src/views/TimerView.vue`

**要点：**
- 通过路由参数 `planId` 从 PlansStore 获取方案，加载到 TimerStore
- 顶部显示方案名 + 返回按钮 + 轮次信息（第 X/Y 轮）
- 中部放置 TimerDisplay 组件
- 底部依次放置 ExerciseProgress 和 TimerControls
- 页面背景色根据阶段平滑过渡（运动深红 / 休息深蓝 / 空闲默认深灰）
- 离开页面时（`onBeforeUnmount`）重置定时器

---

### Task 14: App.vue 与底部 Tab 栏

**目标：** 搭建应用外壳，包含 `<router-view>` 和底部导航 Tab。

**文件：** `src/App.vue`

**要点：**
- 移除 Vite 模板默认内容
- `<router-view>` 占满剩余空间
- 底部 Tab 栏：两个 Tab（📋 方案 / ⏱ 计时器），高亮当前路由
- 计时器 Tab 仅在已选择方案时可点击（或隐藏 Tab 栏，计时器页通过方案点击进入）
- 底部安全区域适配

---

### Task 15: PWA 配置

**目标：** 配置 vite-plugin-pwa，生成 manifest 和 Service Worker。

**文件：** `vite.config.ts`、`public/` 目录下的图标

**要点：**
- 在 vite.config.ts 中配置 `VitePWA` 插件
- manifest: name="HIIT Timer"、short_name="HIIT"、theme_color="#1a1a1a"、background_color="#1a1a1a"、display="standalone"
- 配置图标（192x192 和 512x512），可先用纯色占位图标
- Service Worker 策略使用 `generateSW`（自动生成）
- 在 index.html 中添加 `<meta name="apple-mobile-web-app-capable" content="yes">` 等 iOS PWA meta 标签
- `<meta name="viewport">` 设置 `viewport-fit=cover` 以支持安全区域

---

### Task 16: 构建与本地部署验证

**目标：** 构建生产版本，本地启动服务，用手机验证。

**步骤：**
1. 运行 `npm run build`，确认无报错
2. 运行 `npx serve dist`（或 `npx http-server dist`）启动本地静态服务
3. 查看 Mac 局域网 IP（`ifconfig | grep inet`）
4. iPhone Safari 访问 `http://<Mac IP>:3000`
5. 验证页面正常显示，创建方案、运行计时器功能正常
6. 点击 Safari 分享按钮 → "添加到主屏幕"
7. 从主屏幕打开，验证全屏显示无地址栏
