# 数据持久化方案

## 概述

支持换设备恢复训练数据的云同步方案。

## 方案演进

### v1: localStorage（废弃）
- **问题**：删除应用即数据丢失，无跨设备同步
- **替代**：CloudBase

### v2: Firebase（已弃用）
- **原因**：Google服务在中国大陆被墙
- **替代**：腾讯云CloudBase

### v3: 腾讯云CloudBase（当前）
- **优势**：
  - 国内服务，无墙问题
  - Firestore兼容API
  - 支持匿名认证
  - 免费层足够小应用
  - 实时同步 + 离线支持

## 架构

```
设备A (手机/浏览器)
    ↓
[本地存储: IndexedDB]
    ↓
[CloudBase SDK]
    ↓
腾讯云CloudBase (云服务)
    ↓
[Firestore 兼容数据库]
    ↓
设备B (换手机/新浏览器)
    └─ 登录同一账户 → 自动拉取数据
```

## 实现细节

### 数据集合结构

```
users/{uid}/
  ├── plans/{planId}
  │   ├── id
  │   ├── name
  │   ├── exercises: [...]
  │   ├── restDuration
  │   ├── roundRestDuration
  │   └── rounds
  └── records/{recordId}
      ├── id
      ├── planName
      ├── totalDuration
      └── completedAt
```

### 认证流程

- **方式**：优先 CloudBase 匿名登录，未开启时回退到本地生成的 uid
- **步骤**：
  1. 首次打开 app → 尝试 CloudBase 匿名登录（需在控制台开启「匿名登录」）
  2. 获得 uid（来自 auth 或本地生成），存储到 localStorage
  3. 后续使用同一 uid
  4. 换设备：若用匿名登录则每设备一个 uid；若用本地 uid 可导出/导入恢复

### 安全规则建议

- 在 CloudBase 控制台为文档数据库配置安全规则，建议按路径限制为「仅登录用户可读写自己的数据」。
- 若使用**匿名登录**：规则中可用 `auth != null` 或 `auth.uid` 校验。
- 若使用**本地 uid（未开启匿名登录）**：需在规则中放行对 `users/*` 的读写（仅适合开发/内测，生产建议开启匿名登录）。

### 数据同步

- **模式**：实时监听 + 离线缓存
- **流程**：
  1. 创建/修改数据 → 先存IndexedDB
  2. 网络连接 → 同步到CloudBase
  3. 其他设备有更新 → 实时推送（SDK 使用 `watch` 接口）
  4. 离线状态 → 本地读写，网络恢复自动同步

## 环境配置

### .env.local

```env
VITE_CLOUDBASE_ENV_ID=xxx
```

### 获取envId

1. https://console.cloud.tencent.com/tcb
2. 创建新环境 (选择套餐：免费)
3. 复制环境ID

## 代码改动

### 1. firebase.ts → cloudbase.ts

- 替换Firebase SDK为CloudBase SDK
- 适配认证接口
- 适配Firestore-like API

### 2. stores/plans.ts & records.ts

- 改用CloudBase的集合操作
- 保持API兼容（最小改动）
- 支持实时监听

### 3. main.ts

- 初始化CloudBase
- 触发数据加载

## 切换步骤

1. ✅ 卸载firebase包，安装@cloudbase/js-sdk
2. ⏳ 创建CloudBase环境，获取envId
3. ⏳ 改写cloudbase.ts
4. ⏳ 更新stores（plans.ts, records.ts）
5. ⏳ 测试本地功能
6. ⏳ 测试跨设备同步

## 成本估算

- **免费层**：足够个人/小应用
  - 每月1GB存储
  - 每月100万次读操作
  - 无域名/认证成本

- **生产**：按量付费 ¥0.5-2/天

## 备选方案（如需）

| 方案 | 成本 | 难度 | 备注 |
|------|------|------|------|
| 自建后端 | ¥30+/月 | 高 | 完全控制，需运维 |
| MongoDB Atlas | 免费起 | 中 | 有国内节点选项 |
| 导出/导入 | 免费 | 低 | 手动备份，无自动同步 |

