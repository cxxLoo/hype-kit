-- =====================================================================
--  HYPE KIT · 订单模块（订单表 + 权限 + 游客 RPC）
--  用法：Supabase → SQL Editor → New query → 粘贴本文件 → Run
--  （本文件独立于 schema.sql，可单独执行）
-- =====================================================================

-- ---------- 1. 订单表 ----------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      text unique not null,                 -- 人类可读订单号 HK+日期+随机
  token         text not null,                        -- 游客认领/操作凭证（随机串）
  customer_name text not null,
  phone         text not null,
  address       text not null,
  remark        text default '',
  items         jsonb not null default '[]'::jsonb,   -- [{title,price,qty,size,meta,svg}]
  total         integer not null default 0,           -- 商品小计
  ship_fee      integer not null default 0,           -- 运费
  status        text not null default 'pending_payment',
                -- pending_payment 待付款 | paid 待发货 | shipped 已发货 | completed 已完成 | cancelled 已取消
  tracking_no   text default '',                      -- 物流单号
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_token_idx   on public.orders(token);

-- ---------- 2. RLS：只有登录管理员能直接读写；游客一律走 RPC ----------
alter table public.orders enable row level security;

drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders
  for all to authenticated using (true) with check (true);
-- 不给 anon 任何表级策略，游客无法直接读到别人订单，隐私安全

-- ---------- 3. 工具函数：生成订单号 / token ----------
create or replace function public.gen_order_no()
returns text language sql volatile as $$
  select 'HK' || to_char(now(),'YYYYMMDD')
       || lpad((floor(random()*1000000))::int::text, 6, '0');
$$;

-- ---------- 4. 下单（游客可调用，绕过 RLS 安全写入）----------
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

  insert into orders(order_no, token, customer_name, phone, address, remark,
                     items, total, ship_fee, status)
  values (v_no, v_token, trim(p_name), trim(p_phone), trim(p_address), coalesce(p_remark,''),
          p_items, coalesce(p_total,0), coalesce(p_ship_fee,0), 'pending_payment');

  return query select v_no, v_token;
end;
$$;

-- ---------- 5. 按 token 批量查询「我的订单」----------
create or replace function public.get_my_orders(p_tokens text[])
returns setof public.orders
language sql security definer set search_path = public as $$
  select * from orders
  where p_tokens is not null and token = any(p_tokens)
  order by created_at desc;
$$;

-- ---------- 6. 游客操作：支付 / 确认收货 / 取消 ----------
create or replace function public.guest_order_action(p_token text, p_action text)
returns public.orders
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from orders where token = p_token;
  if not found then raise exception '订单不存在'; end if;

  if p_action = 'pay' and o.status = 'pending_payment' then
    update orders set status='paid',      updated_at=now() where id=o.id returning * into o;
  elsif p_action = 'confirm' and o.status = 'shipped' then
    update orders set status='completed', updated_at=now() where id=o.id returning * into o;
  elsif p_action = 'cancel' and o.status in ('pending_payment','paid') then
    update orders set status='cancelled', updated_at=now() where id=o.id returning * into o;
  else
    raise exception '当前状态(%）不允许该操作(%)', o.status, p_action;
  end if;

  return o;
end;
$$;

-- ---------- 7. 授权：游客(anon)与管理员(authenticated)均可调用上述 RPC ----------
grant execute on function public.place_order(text,text,text,text,jsonb,integer,integer) to anon, authenticated;
grant execute on function public.get_my_orders(text[])                                   to anon, authenticated;
grant execute on function public.guest_order_action(text,text)                            to anon, authenticated;
