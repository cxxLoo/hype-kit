-- =====================================================================
--  HYPE KIT · 收货地址管理 + 收款码（支付管理）
--  用法：Supabase → SQL Editor → New query → 粘贴本文件 → Run
--  （本文件独立、可重复执行；不影响已有数据）
-- =====================================================================

-- ---------- 1. 收货地址表 ----------
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  recipient  text not null,                    -- 收货人
  phone      text not null,                    -- 手机号
  address    text not null,                    -- 省市区 + 详细地址
  is_default boolean not null default false,   -- 是否默认地址
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id);

-- ---------- 2. RLS：每个人只能读写自己的地址 ----------
alter table public.addresses enable row level security;

drop policy if exists "own addresses select" on public.addresses;
create policy "own addresses select" on public.addresses
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "own addresses insert" on public.addresses;
create policy "own addresses insert" on public.addresses
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "own addresses update" on public.addresses;
create policy "own addresses update" on public.addresses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own addresses delete" on public.addresses;
create policy "own addresses delete" on public.addresses
  for delete to authenticated using (user_id = auth.uid());

-- ---------- 3. 收款码：存于 site_content（前台公开可读，管理员可写） ----------
--  key = pay_qr_url  收款码图片地址（上传到 Storage 后写入）
--  key = pay_note    收款说明文字（如「支付后请把订单号发给客服」）
insert into public.site_content (key, value) values
  ('pay_qr_url', ''),
  ('pay_note',   '请使用微信 / 支付宝扫码支付，支付完成后点击「我已完成支付」。')
on conflict (key) do nothing;
