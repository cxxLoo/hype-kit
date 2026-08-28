-- =====================================================================
--  HYPE KIT · 跨设备同步：收藏 / 购物袋 / 订单归属
--  用法：Supabase → SQL Editor → New query → 粘贴本文件 → Run
--  说明：登录用户的收藏、购物袋、订单都存数据库，换设备登录同一账号可见。
--        未登录访客仍使用浏览器本地存储；登录后自动迁移到账号。
-- =====================================================================

-- ---------- 1. 收藏表（商品 + 帖子） ----------
create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_type  text not null,               -- 'product' | 'post'
  item_id    text not null,               -- 商品编号 或 帖子 uuid（统一存 text）
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);
alter table public.favorites enable row level security;

drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 2. 购物袋表 ----------
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  sku        text default '',
  title      text not null default '',
  price      integer not null default 0,
  size       text default '',
  meta       text default '',
  svg        text default '',             -- 缩略图（SVG 源码 或 <img> 片段）
  qty        integer not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists cart_user_idx on public.cart_items(user_id, created_at);
alter table public.cart_items enable row level security;

drop policy if exists "own cart" on public.cart_items;
create policy "own cart" on public.cart_items
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 3. 订单归属：登录下单自动关联账号 ----------
alter table public.orders add column if not exists user_id uuid references auth.users(id);
create index if not exists orders_user_idx on public.orders(user_id);

-- 重建下单函数：登录用户自动写入 user_id（auth.uid()），游客为 null
create or replace function public.place_order(
  p_name    text,
  p_phone   text,
  p_address text,
  p_remark  text,
  p_items   jsonb,
  p_total   integer,
  p_ship_fee integer
)
returns table(order_no text, token text)
language plpgsql security definer set search_path = public as $$
declare
  v_no    text := gen_order_no();
  v_token text := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
begin
  if coalesce(trim(p_name),'')='' or coalesce(trim(p_phone),'')='' or coalesce(trim(p_address),'')='' then
    raise exception '收货人、手机号、地址不能为空';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception '订单商品不能为空';
  end if;

  insert into orders(order_no, token, user_id, customer_name, phone, address, remark,
                     items, total, ship_fee, status)
  values (v_no, v_token, auth.uid(), trim(p_name), trim(p_phone), trim(p_address), coalesce(p_remark,''),
          p_items, coalesce(p_total,0), coalesce(p_ship_fee,0), 'pending_payment');

  return query select v_no, v_token;
end;
$$;

-- 按登录账号查询订单（跨设备）
create or replace function public.get_user_orders()
returns setof public.orders
language sql security definer set search_path = public as $$
  select * from orders
  where user_id is not null and user_id = auth.uid()
  order by created_at desc;
$$;

grant execute on function public.place_order(text,text,text,text,jsonb,integer,integer) to anon, authenticated;
grant execute on function public.get_user_orders() to authenticated;
