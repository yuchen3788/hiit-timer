# ⏱️ HIIT Timer

一款 HIIT（高强度间歇训练）计时器，PWA 移动端优先应用。支持自定义训练方案、倒计时执行训练、训练记录统计。

## ✨ 功能特性

- 📋 **训练方案管理** — 创建/编辑/删除训练方案，支持拖拽排序动作顺序
- ⏳ **智能计时器** — 动作倒计时、休息倒计时、多轮循环，自动切换阶段
- 🔊 **音效提示** — 倒计时提示音、阶段切换音、训练完成音（Web Audio API）
- 📊 **训练统计** — 日历热力图 + 月度记录列表，追踪训练频率
- 🌓 **暗色/浅色主题** — 一键切换，偏好自动持久化
- ☁️ **云端同步** — 基于腾讯云 CloudBase，数据实时同步
- 📱 **PWA 支持** — 可安装到桌面，离线可用

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 (Hash 模式) |
| 后端 | 腾讯云 CloudBase（匿名登录 + 数据库） |
| 拖拽 | vuedraggable |
| PWA | vite-plugin-pwa |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/yuchen3788/hiit-timer.git
cd hiit-timer

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 CloudBase 配置

# 启动开发服务器
npm run dev
```

### 环境变量

在 `.env` 文件中配置：

```
VITE_CLOUDBASE_ENV_ID=你的云开发环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=你的AccessKey
```

### 构建部署

```bash
# 类型检查 + 构建
npm run build

# 本地预览构建产物
npm run preview
```

## 📁 项目结构

```
src/
├── main.ts                  # 入口：初始化 Pinia、Router、CloudBase
├── App.vue                  # 根组件：底部 Tab 栏
├── style.css                # 全局 CSS 变量（暗色/浅色主题）
├── types/index.ts           # TypeScript 类型定义
├── router/index.ts          # 路由配置
├── stores/                  # Pinia 状态管理
│   ├── plans.ts             # 训练方案 CRUD
│   ├── timer.ts             # 计时器核心逻辑
│   ├── records.ts           # 训练记录管理
│   └── theme.ts             # 主题切换
├── views/                   # 页面组件
│   ├── PlansView.vue        # 首页：方案列表
│   ├── TimerView.vue        # 计时页：倒计时执行
│   ├── CompletionView.vue   # 完成页：统计摘要
│   └── StatsView.vue        # 统计页：热力图
├── components/              # 通用组件
└── utils/                   # 工具函数
    ├── cloudbase.ts         # CloudBase 封装
    ├── audio.ts             # 音效系统
    └── quotes.ts            # 励志语录库
```

## 📄 License

MIT
