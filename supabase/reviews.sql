-- =====================================================================
--  HYPE KIT · 买家评论模块（评论表 + 权限 + 游客提交 RPC）
--  作用：买家在「我的订单」里对已购商品评价，评论展示在前台商品视频弹窗下方
--  用法：Supabase → SQL Editor → New query → 粘贴本文件 → Run
--  （本文件独立，可单独执行；依赖 orders 表用于校验订单 token）
-- =====================================================================

-- ---------- 1. 评论表 ----------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,                       -- 对应 products.id / 订单条目 sku
  order_token text default '',                     -- 下单凭证，用于防止重复评价 & 校验
  author      text default '',                     -- 买家昵称（选填）
  rating      integer not null default 5,          -- 1–5 星
  content     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_token_idx   on public.reviews(order_token);

-- 同一订单同一商品仅一条评价（可更新）
create unique index if not exists reviews_token_product_uk
  on public.reviews(order_token, product_id) where order_token <> '';

-- ---------- 2. RLS：任何人可读（前台展示），写入仅通过 RPC ----------
alter table public.reviews enable row level security;

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews
  for select using (true);

-- 管理员可删除违规评论
drop policy if exists "admin delete reviews" on public.reviews;
create policy "admin delete reviews" on public.reviews
  for delete using (public.is_admin());

-- ---------- 3. 提交评论（游客可调用，凭订单 token 校验，绕过 RLS 安全写入）----------
create or replace function public.add_review(
  p_token      text,
  p_product_id text,
  p_rating     integer,
  p_content    text,
  p_author     text
)
returns public.reviews
language plpgsql security definer set search_path = public as $$
declare
  v_row public.reviews;
  v_ok  boolean;
begin
  if coalesce(trim(p_product_id),'') = '' then
    raise exception '缺少商品标识';
  end if;
  if coalesce(trim(p_content),'') = '' then
    raise exception '评价内容不能为空';
  end if;

  -- 校验订单 token 真实存在（防止随意灌水）
  select exists(select 1 from orders where token = p_token) into v_ok;
  if not v_ok then
    raise exception '订单凭证无效，无法评价';
  end if;

  insert into reviews(product_id, order_token, author, rating, content)
  values (
    p_product_id,
    coalesce(p_token,''),
    coalesce(nullif(trim(p_author),''),'匿名买家'),
    greatest(1, least(5, coalesce(p_rating,5))),
    trim(p_content)
  )
  on conflict (order_token, product_id) where order_token <> ''
  do update set author = excluded.author,
                rating = excluded.rating,
                content = excluded.content,
                created_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------- 4. 授权：游客(anon) 与 登录用户(authenticated) 均可提交评论 ----------
grant execute on function public.add_review(text,text,integer,text,text) to anon, authenticated;
