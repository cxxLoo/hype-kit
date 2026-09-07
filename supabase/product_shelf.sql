-- =====================================================================
--  HYPE KIT · 商品上架 / 下架
--  用法：Supabase → SQL Editor → New query → 粘贴 → Run（可重复执行）
-- =====================================================================

-- 给商品表增加「是否上架」列，默认上架；已有商品自动视为上架
alter table public.products
  add column if not exists is_active boolean not null default true;

-- 可选：给前台查询加索引（按上架状态过滤更快）
create index if not exists products_active_idx on public.products(is_active);
