# HYPE KIT · 部署教程（Supabase + Vercel，全程无自建服务器）

本项目是**纯静态前端 + Supabase BaaS**：
- 前端：原生 HTML/CSS/JS，无需构建，直接部署到 Vercel。
- 后端：Supabase 提供数据库（商品/文案）、认证（管理员登录）、存储（图片上传）。
- 权限：访客只能读，只有管理员账号能登录后台改内容（由数据库 RLS 保证）。

目录结构：

```
球衣设计网站/
├── index.html / shop.html / customize.html / cart.html   前端页面
├── css/style.css
├── js/
│   ├── config.js     ← Supabase 连接配置（需要你填写）
│   ├── data.js       ← 从 Supabase 读取商品/文案
│   └── shared.js
├── admin/            ← 管理后台
│   ├── login.html    管理员登录
│   ├── index.html    商品/文案增删改查
│   ├── admin.js
│   └── admin.css
└── supabase/schema.sql  ← 数据库结构 + 权限 + 初始数据
```

---

## 第 1 步：创建 Supabase 项目

1. 打开 https://supabase.com ，注册 / 登录。
2. 点击 **New project**，填写：
   - Name：任意，如 `hype-kit`
   - Database Password：设置一个强密码（自己保存好）
   - Region：选离用户近的（如 `Southeast Asia (Singapore)`）
3. 等待 1~2 分钟，项目创建完成。

## 第 2 步：建表、配置权限、导入初始数据

1. 左侧菜单进入 **SQL Editor** → **New query**。
2. 打开本项目 `supabase/schema.sql`，**全部复制**粘贴进去。
3. 点击 **Run**。看到 `Success` 即完成：
   - 创建 `products`、`site_content` 两张表
   - 开启 RLS：访客只读、登录用户可写
   - 创建公开图片桶 `assets` 及其访问策略
   - 写入初始文案和 10 件示例商品

> 你可以在 **Table Editor** 里看到刚导入的数据。

## 第 3 步：创建管理员账号（并关闭公开注册）

1. 左侧 **Authentication → Users → Add user → Create new user**。
2. 填写管理员 **邮箱 + 密码**，勾选 **Auto Confirm User**（自动确认，免邮件验证），创建。
   - 这个邮箱/密码就是后台登录账号。
3. 关闭公开注册（很重要，防止别人自己注册成"管理员"）：
   - **Authentication → Sign In / Providers**（或 Settings）里，把 **Allow new users to sign up** 关掉（Disable）。
   - 这样系统里就只有你手动创建的管理员，"登录用户 = 管理员"成立。

## 第 4 步：填写前端连接配置（"环境变量"）

静态站点没有服务器注入环境变量，配置直接写在 `js/config.js`。
Supabase 的 **anon key 是公开密钥，可以安全暴露**，真正的数据安全由 RLS 保护。

1. Supabase 左侧 **Project Settings → API**，复制两项：
   - **Project URL**（形如 `https://abcdxyz.supabase.co`）
   - **anon public** key（很长一串）
2. 编辑 `js/config.js`，替换：

```js
window.SUPABASE_URL = "https://abcdxyz.supabase.co";   // ← 换成你的 Project URL
window.SUPABASE_ANON_KEY = "eyJhbGciOi...";            // ← 换成你的 anon public key
```

3. `SB_BUCKET` 保持 `"assets"`（与 SQL 里创建的桶名一致）。

## 第 5 步：本地验证（可选但推荐）

因为用到 fetch/Storage，**不要直接双击 html 打开**（`file://` 会报跨域）。用任意静态服务器：

```bash
# 在 球衣设计网站 目录下，任选一种
npx serve .
# 或 Python
python -m http.server 8080
```

浏览器打开 `http://localhost:8080`：
- 首页/商城商品应来自数据库；
- 打开 `/admin/login.html`，用管理员账号登录，进后台改一条文案/商品，刷新前端确认生效。

## 第 6 步：部署到 Vercel

1. 把 `球衣设计网站` 目录推到一个 GitHub 仓库。
2. 打开 https://vercel.com ，用 GitHub 登录 → **Add New → Project → Import** 该仓库。
3. 配置：
   - **Framework Preset**：`Other`
   - **Root Directory**：如果仓库根目录就是站点，保持默认；若站点在子目录 `球衣设计网站`，点 **Edit** 选中该子目录。
   - **Build Command**：留空（纯静态无需构建）
   - **Output Directory**：留空（默认根目录）
4. 点击 **Deploy**。完成后得到线上地址，如 `https://hype-kit.vercel.app`。
   - 前端：`https://hype-kit.vercel.app/`
   - 后台：`https://hype-kit.vercel.app/admin/login.html`

## 第 7 步：把线上域名加入 Supabase 白名单

1. Supabase **Authentication → URL Configuration**：
   - **Site URL** 填你的 Vercel 域名，如 `https://hype-kit.vercel.app`
   - 需要的话在 **Redirect URLs** 里也加上该域名。
2. 保存。这样后台登录/会话在线上正常工作。

---

## 权限模型说明

| 角色 | 前端浏览 | 登录后台 | 改商品/文案/传图 |
|------|:------:|:------:|:------:|
| 访客（未登录） | ✅ 只读 | ❌ | ❌ |
| 管理员（登录） | ✅ | ✅ | ✅ |

- 数据库 RLS：`select` 对所有人开放；`insert/update/delete` 仅 `authenticated`（登录用户）。
- 关闭了公开注册后，系统里只有你创建的管理员，所以"登录用户 = 管理员"。
- anon key 泄露也无法写数据，因为写操作要求登录态。

## 日常使用

- 改文案：后台「文案管理」→ 改文本 → 保存 → 刷新前端。
- 上下架/改价/改配色：后台「商品管理」→ 编辑/新增/删除。
- 换商品图：编辑商品时上传图片，会自动存到 Supabase Storage 并覆盖 SVG 展示；不传则继续用配色生成的 SVG。

## 常见问题

- **前端一直显示示例数据？** `config.js` 没填对，或表为空。前端有兜底：连不上数据库时用本地示例，保证不空白。打开浏览器控制台看告警。
- **后台登录报错 Invalid login credentials？** 账号没建或密码错；确认在 Authentication→Users 里存在且已 Confirm。
- **图片传不上去？** 确认 SQL 已执行（桶 `assets` 及策略已建），且当前处于登录态。
- **本地打开报跨域？** 用静态服务器访问，不要用 `file://` 双击打开。
