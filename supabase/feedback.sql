-- =====================================================================
--  HYPE KIT · 用户反馈模块
--  作用：存储客服对话记录与留言反馈；游客可提交，仅管理员可查看/处理
--  依赖：需先执行 accounts.sql（本文件用到其中的 public.is_admin()）
--  用法：Supabase → SQL Editor → New query → 粘贴本文件 → Run
-- =====================================================================

-- ---------- 1. 反馈表 ----------
create table if not exists public.feedbacks (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text default '',                 -- 称呼（选填）
  contact    text default '',                 -- 联系方式（选填）
  category   text not null default '咨询',     -- 咨询 / 售后 / 投诉 / 建议 / 其他
  message    text not null,                   -- 用户问题 / 反馈内容
  reply      text default '',                 -- AI 当时的回复（聊天记录）
  source     text not null default 'chat',    -- chat 在线客服 | form 留言反馈
  status     text not null default 'new',     -- new 待处理 | resolved 已处理
  session_id text default ''                  -- 同一次会话分组
);

create index if not exists feedbacks_created_idx  on public.feedbacks(created_at desc);
create index if not exists feedbacks_status_idx   on public.feedbacks(status);
create index if not exists feedbacks_category_idx on public.feedbacks(category);

-- ---------- 2. 开启 RLS ----------
alter table public.feedbacks enable row level security;

-- ---------- 3. 权限策略 ----------
-- 任何人（含未登录游客）都可以提交反馈
drop policy if exists "anyone insert feedback" on public.feedbacks;
create policy "anyone insert feedback" on public.feedbacks
  for insert to anon, authenticated with check (true);

-- 仅管理员可查看
drop policy if exists "admin read feedback" on public.feedbacks;
create policy "admin read feedback" on public.feedbacks
  for select using (public.is_admin());

-- 仅管理员可更新状态（标记已处理）
drop policy if exists "admin update feedback" on public.feedbacks;
create policy "admin update feedback" on public.feedbacks
  for update using (public.is_admin()) with check (public.is_admin());

-- 仅管理员可删除
drop policy if exists "admin delete feedback" on public.feedbacks;
create policy "admin delete feedback" on public.feedbacks
  for delete using (public.is_admin());
