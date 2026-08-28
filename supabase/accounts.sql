-- =====================================================================
--  HYPE KIT · 账号 & 角色体系
--  作用：引入 profiles(用户资料 + is_admin)，把写权限收紧为"仅管理员"
--  用法：Supabase → SQL Editor → 粘贴 → Run
--  ⚠️ 执行后，请务必看文件末尾「第 7 节」把你的管理员账号设为 is_admin
-- =====================================================================

-- ---------- 1. 用户资料表 ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------- 2. 管理员判定函数（SECURITY DEFINER，绕过 RLS 避免递归）----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- 3. 注册时自动建资料 ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, display_name)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 4. 把已存在的用户补进 profiles（历史账号）----------
insert into public.profiles(id, email, display_name)
select id, email, coalesce(raw_user_meta_data->>'display_name', split_part(email,'@',1))
from auth.users
on conflict (id) do nothing;

-- ---------- 5. profiles 的 RLS ----------
-- 本人可看自己的资料；管理员可看全部
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles" on public.profiles
  for select using (public.is_admin());

-- 本人可改自己昵称（但不能自己给自己升管理员——见下方触发器保护）
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 管理员可改任何人（包括授予/取消 is_admin）
drop policy if exists "admin update profiles" on public.profiles;
create policy "admin update profiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- 防止普通用户通过"改自己资料"把自己升成管理员
-- （auth.uid() 为空表示在 SQL 控制台/服务角色下操作，放行，用于初始化管理员）
create or replace function public.guard_is_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception '无权修改管理员身份';
  end if;
  return new;
end;$$;
drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.guard_is_admin();

-- ---------- 6. 收紧写权限：products / site_content / orders 仅管理员可写 ----------
-- 商品：公开可读，仅管理员可写
drop policy if exists "auth write products" on public.products;
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- 文案：公开可读，仅管理员可写
drop policy if exists "auth write content" on public.site_content;
drop policy if exists "admin write content" on public.site_content;
create policy "admin write content" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- 订单：仅管理员可直接读写（游客仍走 place_order/get_my_orders/guest_order_action 这些 RPC）
drop policy if exists "admin all orders" on public.orders;
drop policy if exists "auth all orders" on public.orders;
create policy "admin all orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
--  第 7 节（必做）：把你的管理员账号设为 is_admin = true
--  把下面邮箱换成你后台登录用的邮箱，执行一次即可
-- =====================================================================
update public.profiles set is_admin = true
where email = '1049564540@qq.com';
