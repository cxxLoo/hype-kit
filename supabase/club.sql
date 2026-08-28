-- =====================================================================
--  HYPE KIT · 球迷俱乐部（小红书式分享社区）
--  作用：帖子分享（生活 / 穿搭）+ 评论 + 点赞；游客可看可发可评可赞
--  依赖：需先执行 accounts.sql（用到 public.is_admin()）
--  用法：Supabase → SQL Editor → New query → 粘贴本文件 → Run
-- =====================================================================

-- ---------- 1. 帖子表 ----------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid references auth.users(id) on delete set null, -- 登录用户为其 id，种子/游客为 null
  author_name   text not null default '匿名球迷',
  avatar_color  text not null default '#7a3ff2',   -- 头像圆底色
  title         text not null default '',
  body          text not null default '',
  image_url     text not null default '',          -- 可选真实图片（留空则用渐变封面）
  cover_color   text not null default '#efe8ff',   -- 无图时的渐变封面主色
  emoji         text not null default '👕',         -- 无图封面上的装饰表情
  tags          text not null default '',          -- 逗号分隔标签
  likes         integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists posts_likes_idx   on public.posts(likes desc);

-- ---------- 2. 评论表 ----------
create table if not exists public.post_comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  author_id    uuid references auth.users(id) on delete set null,
  author_name  text not null default '匿名球迷',
  avatar_color text not null default '#1f6fe0',
  body         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists comments_post_idx on public.post_comments(post_id, created_at);

-- ---------- 3. 评论数自动维护 ----------
create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;$$;

drop trigger if exists post_comments_count on public.post_comments;
create trigger post_comments_count
  after insert or delete on public.post_comments
  for each row execute function public.bump_comment_count();

-- ---------- 4. 点赞 / 取消赞（SECURITY DEFINER 绕过 RLS，游客也能点）----------
create or replace function public.like_post(p_id uuid)
returns integer language sql security definer set search_path = public as $$
  update public.posts set likes = likes + 1 where id = p_id returning likes;
$$;
grant execute on function public.like_post(uuid) to anon, authenticated;

create or replace function public.unlike_post(p_id uuid)
returns integer language sql security definer set search_path = public as $$
  update public.posts set likes = greatest(likes - 1, 0) where id = p_id returning likes;
$$;
grant execute on function public.unlike_post(uuid) to anon, authenticated;

-- ---------- 5. RLS ----------
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;

-- 帖子：公开可读
drop policy if exists "public read posts" on public.posts;
create policy "public read posts" on public.posts for select using (true);

-- 帖子：任何人可发（游客 author_id 为空；登录用户须为本人）
drop policy if exists "anyone insert posts" on public.posts;
create policy "anyone insert posts" on public.posts
  for insert to anon, authenticated
  with check (author_id is null or author_id = auth.uid());

-- 帖子：作者本人或管理员可删（点赞数改动只走 RPC）
drop policy if exists "author or admin delete posts" on public.posts;
create policy "author or admin delete posts" on public.posts
  for delete using (public.is_admin() or (author_id is not null and author_id = auth.uid()));

-- 帖子：仅管理员可直接改（如置顶/编辑）
drop policy if exists "admin update posts" on public.posts;
create policy "admin update posts" on public.posts
  for update using (public.is_admin()) with check (public.is_admin());

-- 评论：公开可读
drop policy if exists "public read comments" on public.post_comments;
create policy "public read comments" on public.post_comments for select using (true);

-- 评论：任何人可评
drop policy if exists "anyone insert comments" on public.post_comments;
create policy "anyone insert comments" on public.post_comments
  for insert to anon, authenticated
  with check (author_id is null or author_id = auth.uid());

-- 评论：作者本人或管理员可删
drop policy if exists "author or admin delete comments" on public.post_comments;
create policy "author or admin delete comments" on public.post_comments
  for delete using (public.is_admin() or (author_id is not null and author_id = auth.uid()));

-- =====================================================================
--  6. 种子数据：一批"已有用户"分享的优质帖子 + 评论
--     （author_id 为 null，代表社区历史用户，不占用真实账号）
-- =====================================================================
insert into public.posts (author_name, avatar_color, title, body, cover_color, emoji, tags, likes, created_at) values
('球场追风少年', '#b1131a',
 '入手红蓝主场球衣！这配色也太顶了吧🔥',
 '等了半个月终于到货～经典竖条纹配色一上身气场直接拉满，速干面料踢球一点不闷汗。印了自己的号码10号，仪式感满满，队友都问我在哪买的😎 强烈安利给同样爱球的兄弟！',
 '#ffe3e3', '⚽', '主场球衣,红蓝配色,开箱',
 328, now() - interval '2 hours'),

('穿搭研究所Ida', '#e8467c',
 '球衣也能很时髦｜三套街头运动风穿搭分享',
 '谁说球衣只能踢球穿🙅‍♀️ 分享我的私藏搭配：\n1️⃣ 白球衣 + 阔腿牛仔裤 + 老爹鞋，休闲又清爽\n2️⃣ 黑金球员版 + 皮衣外套，酷感拉满\n3️⃣ 复古绿球衣 + 工装短裤，元气满满\n重点是把球衣当 oversize 上衣叠穿，超显高！',
 '#fde8f1', '👕', '穿搭,街头风,球衣改造',
 512, now() - interval '5 hours'),

('金靴收藏家', '#c9a24a',
 '定制黑金战靴到货开箱，这质感绝了✨',
 '鞋身、鞋底、勾勾、鞋带四个区域全部自己配色，黑金真的太高级了。鞋侧还刻了我的名字，独一无二的感觉谁懂啊😭 触球脚感很扎实，实战党闭眼入！',
 '#1a1a1a', '👟', '定制球鞋,黑金战靴,开箱',
 276, now() - interval '9 hours'),

('周末野球场', '#0a7a3f',
 '我们球队全员定制队服，battle 全场最靓✌️',
 '这周组织了一场友谊赛，全队统一做了绿色复古款队服，印上各自的号码和名字，往场上一站气势就赢了一半哈哈哈。踢完还一起拍了合照，太有归属感了！团队定制真的强推～',
 '#e3f7ec', '🏟️', '球队定制,野球场,兄弟情',
 189, now() - interval '1 day'),

('极简主义者阿White', '#111111',
 '纯白训练球衣｜低调但很耐看',
 '不喜欢太花的配色，就选了纯白极简款，简简单单反而百搭。日常出门套件外套就能穿，训练日单穿也清爽。轻量科技面料真的很透气，夏天福音🤍',
 '#f2f2f2', '🎽', '极简,纯白,训练日',
 143, now() - interval '1 day'),

('荧光跑者小K', '#c8ff00',
 'Vapor 荧光竞速开箱｜球场上最靓的仔',
 '荧光绿真的太吸睛了，穿上它跑起来感觉自己快得飞起⚡ 极致轻量，爆发加速很跟脚。晚上灯光下反光效果绝美，颜值实力双在线！',
 '#f4ffcc', '⚡', '荧光,竞速,球鞋',
 231, now() - interval '2 days'),

('足球妈妈日记', '#ff6a00',
 '给儿子定制了人生第一件球衣，感动到哭🥹',
 '娃说想要一件印自己名字的球衣，就带他一起在定制页面设计了半天，选了他最爱的橙黑撞色。收到那天他开心得抱着不撒手，说要穿去学校运动会。这份仪式感值了❤️',
 '#ffece0', '🧡', '亲子,定制球衣,记录',
 407, now() - interval '3 days'),

('复古球衣控', '#0a2d5c',
 '复古配色永不过时｜我的珍藏分享',
 '入了翠绿复古经典款，版型很正，配色致敬经典赛季。挂在房间里当装饰都好看，球迷 DNA 动了😍 喜欢复古风的姐妹别错过～',
 '#e5edf7', '🏆', '复古,珍藏,球衣',
 168, now() - interval '4 days'),

('健身房搬砖工', '#1f6fe0',
 '球衣当健身服穿，透气又显身材💪',
 '发现速干球衣拿来撸铁也很香，排汗快、不黏身，深蓝客场款配黑色运动裤，练背的时候倒三角更明显了哈哈。运动人狂喜！',
 '#e5f0ff', '💪', '健身,运动穿搭,速干',
 154, now() - interval '5 days'),

('校园足球社', '#7a3ff2',
 '社团招新啦｜定制社服真的太出片了📸',
 '新赛季社服到货，蓝金撞色配上社团 logo，全员上身拍了组照片直接刷屏朋友圈。招新摊位靠这身衣服吸引了一大波新生，颜值即正义！',
 '#efe8ff', '📸', '校园,社团,团队定制',
 198, now() - interval '6 days');

-- 给热门帖子补几条评论（用 title 关联，避免手写 uuid）
insert into public.post_comments (post_id, author_name, avatar_color, body, created_at)
select id, '路过的邻家哥', '#0a7a3f', '同款！这配色真的百看不腻，已入😎', created_at + interval '20 min'
from public.posts where title like '入手红蓝主场球衣%' limit 1;

insert into public.post_comments (post_id, author_name, avatar_color, body, created_at)
select id, '想踢球的猫', '#e8467c', '求链接求链接，我也想给自己印个号码🥰', created_at + interval '40 min'
from public.posts where title like '入手红蓝主场球衣%' limit 1;

insert into public.post_comments (post_id, author_name, avatar_color, body, created_at)
select id, '搭配小白', '#ff6a00', '第二套黑金皮衣那套太酷了，学到了！', created_at + interval '1 hour'
from public.posts where title like '球衣也能很时髦%' limit 1;

insert into public.post_comments (post_id, author_name, avatar_color, body, created_at)
select id, '实战党老张', '#111111', '脚感真的重要，这双看着就很稳，考虑入一双', created_at + interval '2 hour'
from public.posts where title like '定制黑金战靴%' limit 1;

insert into public.post_comments (post_id, author_name, avatar_color, body, created_at)
select id, '暖心网友', '#b1131a', '好有爱的一家人，小朋友一定超开心❤️', created_at + interval '3 hour'
from public.posts where title like '给儿子定制了人生第一件球衣%' limit 1;
