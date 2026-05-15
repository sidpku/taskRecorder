# TaskRecorder - 时间打卡记录工具

个人时间管理工具，通过"打卡"记录时间点，自动将相邻打卡配对形成时间段。

## 技术栈

- **前端**：Vite + React
- **后端**：Node.js + Express
- **数据存储**：JSON 文件（按天分文件）

## 快速开始

### 环境要求

- Node.js >= 18

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd server && npm install

# 安装前端依赖
cd ../client && npm install
```

### 启动项目

```bash
# 一键启动前后端（在根目录）
npm run dev
```

- 后端运行在 http://localhost:3001
- 前端运行在 http://localhost:5173

也可以单独启动：

```bash
npm run server   # 仅后端
npm run client   # 仅前端
```

## 功能特性

- 打卡记录时间点，自动配对形成时间段
- 标签快捷打卡（多标签多选拼接）
- 边用边建：打卡时直接创建新标签
- 碎片时间记录（不打断主时间段）
- 工作备注（多行，关联当前时间段）
- 实时显示"上次打卡时间"和"已用时"
- 编辑/删除已有打卡记录
- 标签管理（添加/编辑/删除/自动颜色）
- CSV 导出（支持日期范围选择）

## 项目结构

```
taskRecordre/
├── package.json          # 一键启动脚本
├── server/               # Express 后端
│   ├── index.js
│   ├── routes/
│   │   ├── punches.js    # 打卡 API
│   │   ├── tags.js       # 标签 API
│   │   ├── fragments.js  # 碎片时间 API
│   │   └── export.js     # CSV 导出 API
│   ├── utils/data.js     # 数据读写工具
│   └── data/             # JSON 数据文件
├── client/               # React 前端
│   └── src/
│       ├── App.jsx
│       ├── components/   # UI 组件
│       └── api/          # API 封装
└── CONTEXT.md            # 领域设计文档
```

## 数据存储

- 打卡数据：`server/data/YYYY-MM-DD.json`
- 标签数据：`server/data/tags.json`
- 碎片时间：`server/data/fragments-YYYY-MM-DD.json`
