# Supabase 同步与 Vercel 部署说明

## 1. 导入数据表

在 Supabase 控制台打开 SQL Editor，执行：

```text
supabase/schema.sql
```

该脚本会创建：

- `weddings`
- `guests`
- `wedding_tables`
- `seats`
- `layout_items`

并包含：

- 表注释
- 字段注释
- 主键
- 外键
- check 约束
- 唯一约束
- 常用索引
- `updated_at` 自动更新时间触发器

## 2. 环境变量

本地复制 `.env.example` 为 `.env`，然后填入：

```bash
NUXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NUXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NUXT_PUBLIC_DEFAULT_WEDDING_ID=00000000-0000-4000-8000-000000000001
```

Vercel 部署时，在 Project Settings -> Environment Variables 添加同样变量。

`NUXT_SUPABASE_SERVICE_ROLE_KEY` 只在 Nuxt/Nitro 服务端使用，不会暴露给浏览器。

## 3. 后端接口

Nuxt server routes：

- `GET /api/v1/wedding-state?weddingId=...`
- `PUT /api/v1/wedding-state`

前端通过这两个接口同步整份婚礼状态：

- 婚礼基础信息
- 宾客名单
- 桌子
- 座位
- 舞台 / T 型台

## 4. Vercel 兼容性

当前后端使用 Nuxt/Nitro server routes，属于 Vercel 可接收的 Nuxt 后端模式。

部署命令：

```bash
pnpm install
pnpm build
```

Vercel 会按 Nuxt 产物部署服务端 API 和前端页面。

