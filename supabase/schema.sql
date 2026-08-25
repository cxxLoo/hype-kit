-- =====================================================================
--  HYPE KIT · Supabase 数据库结构 / 权限 / 初始数据
--  用法：Supabase 控制台 → SQL Editor → New query → 粘贴本文件 → Run
-- =====================================================================

-- ---------- 1. 商品表 ----------
create table if not exists public.products (
  id          text primary key,                 -- 商品唯一编号，如 j1 / s3
  cat         text not null default 'jersey',    -- jersey（球衣）| shoe（球鞋）
  name        text not null default '',
  description text default '',
  price       integer not null default 0,
  tag         text default '',                   -- 角标：新品 / 限量 / 热销
  opts        jsonb not null default '{}'::jsonb,-- SVG 配色参数
  image_url   text default '',                   -- 上传的真实图片（优先展示）
  sort        integer not null default 100,      -- 排序，越小越靠前
  created_at  timestamptz not null default now()
);

-- ---------- 2. 站点文案表（键值对）----------
create table if not exists public.site_content (
  key        text primary key,
  value      text default '',
  updated_at timestamptz not null default now()
);

-- ---------- 3. 开启 RLS ----------
alter table public.products    enable row level security;
alter table public.site_content enable row level security;

-- ---------- 4. 权限策略 ----------
-- 所有人（含未登录访客）可读
drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select using (true);

drop policy if exists "public read content" on public.site_content;
create policy "public read content"
  on public.site_content for select using (true);

-- 仅登录用户（管理员）可增删改
drop policy if exists "auth write products" on public.products;
create policy "auth write products"
  on public.products for all
  to authenticated using (true) with check (true);

drop policy if exists "auth write content" on public.site_content;
create policy "auth write content"
  on public.site_content for all
  to authenticated using (true) with check (true);

-- ---------- 5. 图片存储桶 ----------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- 图片公开可读
drop policy if exists "public read assets" on storage.objects;
create policy "public read assets"
  on storage.objects for select
  using (bucket_id = 'assets');

-- 仅登录用户可上传/更新/删除图片
drop policy if exists "auth upload assets" on storage.objects;
create policy "auth upload assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'assets');

drop policy if exists "auth update assets" on storage.objects;
create policy "auth update assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'assets');

drop policy if exists "auth delete assets" on storage.objects;
create policy "auth delete assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'assets');

-- ---------- 6. 初始文案 ----------
insert into public.site_content (key, value) values
  ('topbar',        '夏日焕新 · 定制专区限时 <b>低至6折</b>，支持一件起做 · 全场满¥499包邮'),
  ('hero_kicker',   '2026/27 赛季 · 主场系列'),
  ('hero_title',    '设计属于你的<br>专属战袍'),
  ('hero_subtitle', '红蓝主场经典配色，一件起做。自由定制号码、姓名、胸前广告与版式，球场之上，由你定义。'),
  ('promo_kicker',  'BY YOU'),
  ('promo_title',   '从零打造你的队服'),
  ('promo_text',    '选择版式与配色，加上你的号码和名字，实时预览成衣效果。球鞋同样支持三区域自由配色。'),
  ('footer_about',  '专业球衣与球鞋定制平台。设计属于你的队服，一件起做，全球配送。')
on conflict (key) do nothing;

-- ---------- 7. 初始商品 ----------
insert into public.products (id, cat, name, description, price, tag, sort, opts) values
  ('j1','jersey','红蓝主场竞技球衣 26/27','经典竖条纹 · DRI-FIT 速干',699,'新品',10,
    '{"style":"stripe","primary":"#b1131a","secondary":"#0a2d5c","number":"10","name":"MESSI","sponsor":"MIDEA","textColor":"#ffffff"}'),
  ('j2','jersey','深蓝客场球迷版球衣','斜纹撞色 · 透气网眼',599,'',20,
    '{"style":"sash","primary":"#0a2d5c","secondary":"#f5c518","number":"7","name":"VINI","sponsor":"FLY","textColor":"#ffffff"}'),
  ('j3','jersey','纯白极简训练球衣','纯色简约 · 轻量科技',459,'',30,
    '{"style":"solid","primary":"#f2f2f2","secondary":"#111111","number":"9","name":"HAALAND","sponsor":"ETIHAD","textColor":"#111111"}'),
  ('j4','jersey','黑金限定球员版','暗夜黑金 · 球员剪裁',899,'限量',40,
    '{"style":"stripe","primary":"#111111","secondary":"#c9a24a","number":"11","name":"NEYMAR","sponsor":"QA","textColor":"#c9a24a"}'),
  ('j5','jersey','翠绿复古经典球衣','复古版型 · 纪念配色',549,'',50,
    '{"style":"solid","primary":"#0a7a3f","secondary":"#ffffff","number":"8","name":"KANTE","sponsor":"AIA","textColor":"#ffffff"}'),
  ('j6','jersey','橙黑活力街头球衣','高饱和撞色 · 街头潮流',499,'热销',60,
    '{"style":"sash","primary":"#ff6a00","secondary":"#111111","number":"23","name":"JAMES","sponsor":"KIA","textColor":"#111111"}'),
  ('s1','shoe','Mercurial 定制足球鞋','轻量鞋面 · 精准触球',1299,'新品',70,
    '{"body":"#ffffff","sole":"#111111","swoosh":"#b1131a","lace":"#111111","name":"HYPE"}'),
  ('s2','shoe','Phantom 黑金战靴','贴合包裹 · 强力射门',1499,'限量',80,
    '{"body":"#111111","sole":"#c9a24a","swoosh":"#c9a24a","lace":"#c9a24a","name":"GOLD"}'),
  ('s3','shoe','Tiempo 蓝调经典','真皮质感 · 舒适脚感',1099,'',90,
    '{"body":"#1f6fe0","sole":"#ffffff","swoosh":"#ffffff","lace":"#ffffff","name":"BLUE"}'),
  ('s4','shoe','Vapor 荧光竞速','极致轻量 · 爆发加速',1399,'热销',100,
    '{"body":"#c8ff00","sole":"#111111","swoosh":"#111111","lace":"#111111","name":"VOLT"}')
on conflict (id) do nothing;
