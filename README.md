# wedding-feast

婚礼宾客管理与可视化排桌工具，基于 Nuxt 4、Vue 3、TypeScript 和 Pinia 构建。

当前版本是一个可本地运行的 MVP，提供宾客名单管理、人数统计、CSV 导入导出，以及婚宴桌次画布排座。

## 功能

- 宾客新增、编辑、删除
- 按姓名搜索宾客
- 宾客人数统计
- CSV 导入 / 导出
- 桌子创建、编辑、删除
- 桌子拖拽
- 舞台和 T 型台布局项
- 宾客拖拽或点击安排座位
- 移除座位
- 本地持久化保存
- 登录保护与服务端会话校验

## 技术栈

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- `pinia-plugin-persistedstate`
- Nuxt UI
- Motion

## 项目结构

- `app/pages/` 页面路由
- `app/components/` 复用组件
- `app/stores/` Pinia 状态
- `app/types/` 类型定义
- `app/utils/` 工具函数
- `app/assets/css/` 全局样式
- `doc/` 需求与规划文档

## 开发环境

- Node.js `>= 22.12.0`
- pnpm

## 安装

```bash
pnpm install
```

## 启动开发服务器

```bash
pnpm dev
```

默认会启动 Nuxt 开发服务，按终端提示访问本地地址。

## 首次登录与 Supabase 初始化

1. 复制 `.env.example` 为 `.env`，配置 Supabase 地址、服务角色密钥，以及高强度的 `NUXT_AUTH_SESSION_SECRET`（纯数字值必须用双引号包裹）。
2. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
3. 使用初始超管账号 `admin`、密码 `admin123` 登录。数据库只保存密码的 MD5 摘要；上线后应立即在数据库中重置为专属强密码的 MD5 值。

## 生产构建

```bash
pnpm build
```

## 本地预览

```bash
pnpm preview
```

## 当前状态

已完成：

- 基础页面与布局
- 宾客管理页面
- 桌次安排页面
- 本地状态持久化

后续规划：

- Supabase 数据同步
- 真正的 xlsx 导入导出
- 对齐辅助线
- 自动吸附
- 撤销 / 重做

## 说明

当前项目中的导入导出流程使用 CSV 作为可用实现，后续再升级到 Excel。
