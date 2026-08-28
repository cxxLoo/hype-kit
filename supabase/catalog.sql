-- =====================================================================
--  HYPE KIT · 全球时尚牛仔改版 · 商品与文案重建
--  用法：Supabase 控制台 → SQL Editor → New query → 粘贴本文件 → Run
--  说明：本脚本会清空 products 表并写入全新时尚商品（服装/鞋帽），
--        同时保留少量球衣/球鞋供「专属定制」页使用，并刷新首页文案。
-- =====================================================================

-- ---------- 1. 刷新站点文案（全球时尚牛仔风格） ----------
insert into public.site_content (key, value) values
  ('topbar',        '全球时尚上新 · 牛仔专区限时 <b>低至6折</b>，全场满 ¥499 顺丰包邮 · 30 天无忧退换'),
  ('hero_kicker',   '2026 DENIM EDIT · 全球时尚'),
  ('hero_title',    '定义你的<br>牛仔态度'),
  ('hero_subtitle', '从经典直筒到复古阔腿，精选全球时髦牛仔与百搭单品。上衣、鞋帽一站搭齐，穿出属于你的街头态度。'),
  ('promo_kicker',  'STYLE GUIDE'),
  ('promo_title',   '一条牛仔，百种穿搭'),
  ('promo_text',    '男装女装、上衣鞋帽自由组合。跟着造型指南轻松搭配，从通勤到街头，日日不重样。'),
  ('footer_about',  '全球时尚牛仔与穿搭平台。精选优质面料与设计，男装女装、鞋帽配饰一站购齐，穿出你的态度。')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ---------- 2. 清空旧商品 ----------
delete from public.products;

-- ---------- 3. 写入时尚商品 ----------
-- cat: clothing（服装商城）| footwear（鞋帽商城）| jersey/shoe（保留供定制）
-- opts.gender: men | women | unisex ; opts.kind: jeans | top | shoe | hat
insert into public.products (id, cat, name, description, price, tag, sort, opts, image_url) values
  -- 男装牛仔裤
  ('mj1','clothing','经典直筒水洗牛仔裤','男装 · 微弹面料 · 百搭日常',399,'热销',10,
    '{"gender":"men","kind":"jeans"}','https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80'),
  ('mj2','clothing','复古做旧修身牛仔裤','男装 · 猫须做旧 · 显腿长',459,'',11,
    '{"gender":"men","kind":"jeans"}','https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80'),
  ('mj3','clothing','深蓝小脚锥形牛仔裤','男装 · 锥形剪裁 · 通勤利落',429,'新品',12,
    '{"gender":"men","kind":"jeans"}','https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=700&q=80'),
  ('mj4','clothing','宽松阔腿工装牛仔裤','男装 · 街头廓形 · 慵懒随性',489,'',13,
    '{"gender":"men","kind":"jeans"}','https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=700&q=80'),
  -- 女装牛仔裤
  ('wj1','clothing','高腰显瘦直筒牛仔裤','女装 · 高腰 · 遮肉显腿长',419,'热销',20,
    '{"gender":"women","kind":"jeans"}','https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80'),
  ('wj2','clothing','浅蓝阔腿垂感牛仔裤','女装 · 垂坠阔腿 · 慵懒时髦',459,'',21,
    '{"gender":"women","kind":"jeans"}','https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=700&q=80'),
  ('wj3','clothing','复古妈妈裤 Mom Jeans','女装 · 高腰锥形 · 复古慵懒',439,'新品',22,
    '{"gender":"women","kind":"jeans"}','https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=700&q=80'),
  ('wj4','clothing','微喇拖地牛仔裤','女装 · 微喇拉长比例 · 气场全开',479,'',23,
    '{"gender":"women","kind":"jeans"}','https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80'),
  -- 男装上衣
  ('mt1','clothing','纯棉基础款白T','男装 · 厚磅纯棉 · 牛仔绝配',159,'',30,
    '{"gender":"men","kind":"top"}','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'),
  ('mt2','clothing','重磅落肩连帽卫衣','男装 · 落肩廓形 · 街头百搭',329,'热销',31,
    '{"gender":"men","kind":"top"}','https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80'),
  ('mt3','clothing','经典牛仔外套 Trucker','男装 · 硬挺水洗 · 叠穿神器',559,'限量',32,
    '{"gender":"men","kind":"top"}','https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80'),
  -- 女装上衣
  ('wt1','clothing','法式方领短款针织衫','女装 · 修身短款 · 高腰绝配',269,'',40,
    '{"gender":"women","kind":"top"}','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=80'),
  ('wt2','clothing','oversize 牛仔衬衫','女装 · 慵懒廓形 · 内搭叠穿',299,'新品',41,
    '{"gender":"women","kind":"top"}','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80'),
  ('wt3','clothing','简约白色露肩上衣','女装 · 清爽百搭 · 甜酷平衡',239,'',42,
    '{"gender":"women","kind":"top"}','https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=700&q=80'),
  -- 鞋子
  ('sh1','footwear','经典帆布小白鞋','鞋子 · 百搭基础 · 牛仔必备',359,'热销',50,
    '{"gender":"unisex","kind":"shoe"}','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80'),
  ('sh2','footwear','复古厚底老爹鞋','鞋子 · 增高显腿长 · 街头潮流',499,'',51,
    '{"gender":"unisex","kind":"shoe"}','https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80'),
  ('sh3','footwear','高帮马丁靴','鞋子 · 酷感十足 · 秋冬叠穿',629,'新品',52,
    '{"gender":"unisex","kind":"shoe"}','https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80'),
  ('sh4','footwear','复古跑步运动鞋','鞋子 · 复古配色 · 舒适百搭',539,'',53,
    '{"gender":"unisex","kind":"shoe"}','https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80'),
  ('sh5','footwear','极简乐福鞋','鞋子 · 通勤优雅 · 牛仔亦可',579,'',54,
    '{"gender":"unisex","kind":"shoe"}','https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80'),
  ('sh6','footwear','厚底切尔西靴','鞋子 · 一脚蹬 · 帅气利落',659,'限量',55,
    '{"gender":"unisex","kind":"shoe"}','https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=700&q=80'),
  -- 帽子
  ('ht1','footwear','经典棒球帽','帽子 · 遮阳百搭 · 街头点睛',139,'热销',60,
    '{"gender":"unisex","kind":"hat"}','https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=700&q=80'),
  ('ht2','footwear','复古水洗渔夫帽','帽子 · 慵懒随性 · 牛仔绝配',129,'',61,
    '{"gender":"unisex","kind":"hat"}','https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=700&q=80'),
  ('ht3','footwear','羊毛针织冷帽','帽子 · 秋冬保暖 · 显脸小',119,'新品',62,
    '{"gender":"unisex","kind":"hat"}','https://images.unsplash.com/photo-1517941823-815bea90d291?auto=format&fit=crop&w=700&q=80'),
  ('ht4','footwear','宽檐羊毛毡帽','帽子 · 复古优雅 · 气场担当',199,'',63,
    '{"gender":"unisex","kind":"hat"}','https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=700&q=80'),
  -- 保留：球衣 / 球鞋（供「专属定制」页使用，不在商城展示）
  ('j1','jersey','红蓝主场竞技球衣','经典竖条纹 · DRI-FIT 速干',699,'',200,
    '{"style":"stripe","primary":"#b1131a","secondary":"#0a2d5c","number":"10","name":"MESSI","sponsor":"MIDEA","textColor":"#ffffff"}',''),
  ('j2','jersey','深蓝客场球迷版球衣','斜纹撞色 · 透气网眼',599,'',201,
    '{"style":"sash","primary":"#0a2d5c","secondary":"#f5c518","number":"7","name":"VINI","sponsor":"FLY","textColor":"#ffffff"}',''),
  ('j3','jersey','纯白极简训练球衣','纯色简约 · 轻量科技',459,'',202,
    '{"style":"solid","primary":"#f2f2f2","secondary":"#111111","number":"9","name":"HAALAND","sponsor":"ETIHAD","textColor":"#111111"}',''),
  ('s1','shoe','Mercurial 定制足球鞋','轻量鞋面 · 精准触球',1299,'',210,
    '{"body":"#ffffff","sole":"#111111","swoosh":"#b1131a","lace":"#111111","name":"HYPE"}',''),
  ('s2','shoe','Phantom 黑金战靴','贴合包裹 · 强力射门',1499,'',211,
    '{"body":"#111111","sole":"#c9a24a","swoosh":"#c9a24a","lace":"#c9a24a","name":"GOLD"}','');
