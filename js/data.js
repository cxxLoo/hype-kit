/* ================= 数据层：从 Supabase 读取，失败时回退本地示例 ================= */

/* 时尚图片工具：Unsplash 主图，若失效由 productMedia 自动回退到备用图 */
const U = id => "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=700&q=80";

/* 兜底商品数据：Supabase 未配置或表为空时使用，保证页面永不空白
 * cat: clothing(服装商城) | footwear(鞋帽商城) | jersey/shoe(保留，供「专属定制」使用)
 * opts.gender: men | women | unisex ; opts.kind: jeans | top | shoe | hat
 */
window.FALLBACK_PRODUCTS = [
  /* ===== 服装 · 男装牛仔裤 ===== */
  {id:"mj1", cat:"clothing", name:"经典直筒水洗牛仔裤", desc:"男装 · 微弹面料 · 百搭日常", price:399, tag:"热销", image_url:U("1542272604-787c3835535d"),
    opts:{gender:"men", kind:"jeans"}},
  {id:"mj2", cat:"clothing", name:"复古做旧修身牛仔裤", desc:"男装 · 猫须做旧 · 显腿长", price:459, tag:"", image_url:U("1541099649105-f69ad21f3246"),
    opts:{gender:"men", kind:"jeans"}},
  {id:"mj3", cat:"clothing", name:"深蓝小脚锥形牛仔裤", desc:"男装 · 锥形剪裁 · 通勤利落", price:429, tag:"新品", image_url:U("1604176354204-9268737828e4"),
    opts:{gender:"men", kind:"jeans"}},
  {id:"mj4", cat:"clothing", name:"宽松阔腿工装牛仔裤", desc:"男装 · 街头廓形 · 慵懒随性", price:489, tag:"", image_url:U("1598554747436-c9293d6a588f"),
    opts:{gender:"men", kind:"jeans"}},

  /* ===== 服装 · 女装牛仔裤 ===== */
  {id:"wj1", cat:"clothing", name:"高腰显瘦直筒牛仔裤", desc:"女装 · 高腰 · 遮肉显腿长", price:419, tag:"热销", image_url:U("1591195853828-11db59a44f6b"),
    opts:{gender:"women", kind:"jeans"}},
  {id:"wj2", cat:"clothing", name:"浅蓝阔腿垂感牛仔裤", desc:"女装 · 垂坠阔腿 · 慵懒时髦", price:459, tag:"", image_url:U("1584370848010-d7fe6bc767ec"),
    opts:{gender:"women", kind:"jeans"}},
  {id:"wj3", cat:"clothing", name:"复古妈妈裤 Mom Jeans", desc:"女装 · 高腰锥形 · 复古慵懒", price:439, tag:"新品", image_url:U("1582418702059-97ebafb35d09"),
    opts:{gender:"women", kind:"jeans"}},
  {id:"wj4", cat:"clothing", name:"微喇拖地牛仔裤", desc:"女装 · 微喇拉长比例 · 气场全开", price:479, tag:"", image_url:U("1595777457583-95e059d581b8"),
    opts:{gender:"women", kind:"jeans"}},

  /* ===== 服装 · 男装上衣 ===== */
  {id:"mt1", cat:"clothing", name:"纯棉基础款白T", desc:"男装 · 厚磅纯棉 · 牛仔绝配", price:159, tag:"", image_url:U("1521572163474-6864f9cf17ab"),
    opts:{gender:"men", kind:"top"}},
  {id:"mt2", cat:"clothing", name:"重磅落肩连帽卫衣", desc:"男装 · 落肩廓形 · 街头百搭", price:329, tag:"热销", image_url:U("1556821840-3a63f95609a7"),
    opts:{gender:"men", kind:"top"}},
  {id:"mt3", cat:"clothing", name:"经典牛仔外套 Trucker", desc:"男装 · 硬挺水洗 · 叠穿神器", price:559, tag:"限量", image_url:U("1620799140408-edc6dcb6d633"),
    opts:{gender:"men", kind:"top"}},

  /* ===== 服装 · 女装上衣 ===== */
  {id:"wt1", cat:"clothing", name:"法式方领短款针织衫", desc:"女装 · 修身短款 · 高腰绝配", price:269, tag:"", image_url:U("1434389677669-e08b4cac3105"),
    opts:{gender:"women", kind:"top"}},
  {id:"wt2", cat:"clothing", name:"oversize 牛仔衬衫", desc:"女装 · 慵懒廓形 · 内搭叠穿", price:299, tag:"新品", image_url:U("1503342217505-b0a15ec3261c"),
    opts:{gender:"women", kind:"top"}},
  {id:"wt3", cat:"clothing", name:"简约白色露肩上衣", desc:"女装 · 清爽百搭 · 甜酷平衡", price:239, tag:"", image_url:U("1485462537746-965f33f7f6a7"),
    opts:{gender:"women", kind:"top"}},

  /* ===== 鞋帽 · 鞋子 ===== */
  {id:"sh1", cat:"footwear", name:"经典帆布小白鞋", desc:"鞋子 · 百搭基础 · 牛仔必备", price:359, tag:"热销", image_url:U("1595950653106-6c9ebd614d3a"),
    opts:{gender:"unisex", kind:"shoe"}},
  {id:"sh2", cat:"footwear", name:"复古厚底老爹鞋", desc:"鞋子 · 增高显腿长 · 街头潮流", price:499, tag:"", image_url:U("1549298916-b41d501d3772"),
    opts:{gender:"unisex", kind:"shoe"}},
  {id:"sh3", cat:"footwear", name:"高帮马丁靴", desc:"鞋子 · 酷感十足 · 秋冬叠穿", price:629, tag:"新品", image_url:U("1608231387042-66d1773070a5"),
    opts:{gender:"unisex", kind:"shoe"}},
  {id:"sh4", cat:"footwear", name:"复古跑步运动鞋", desc:"鞋子 · 复古配色 · 舒适百搭", price:539, tag:"", image_url:U("1600185365483-26d7a4cc7519"),
    opts:{gender:"unisex", kind:"shoe"}},
  {id:"sh5", cat:"footwear", name:"极简乐福鞋", desc:"鞋子 · 通勤优雅 · 牛仔亦可", price:579, tag:"", image_url:U("1552346154-21d32810aba3"),
    opts:{gender:"unisex", kind:"shoe"}},
  {id:"sh6", cat:"footwear", name:"厚底切尔西靴", desc:"鞋子 · 一脚蹬 · 帅气利落", price:659, tag:"限量", image_url:U("1460353581641-37baddab0fa2"),
    opts:{gender:"unisex", kind:"shoe"}},

  /* ===== 鞋帽 · 帽子 ===== */
  {id:"ht1", cat:"footwear", name:"经典棒球帽", desc:"帽子 · 遮阳百搭 · 街头点睛", price:139, tag:"热销", image_url:U("1521369909029-2afed882baee"),
    opts:{gender:"unisex", kind:"hat"}},
  {id:"ht2", cat:"footwear", name:"复古水洗渔夫帽", desc:"帽子 · 慵懒随性 · 牛仔绝配", price:129, tag:"", image_url:U("1534215754734-18e55d13e346"),
    opts:{gender:"unisex", kind:"hat"}},
  {id:"ht3", cat:"footwear", name:"羊毛针织冷帽", desc:"帽子 · 秋冬保暖 · 显脸小", price:119, tag:"新品", image_url:U("1517941823-815bea90d291"),
    opts:{gender:"unisex", kind:"hat"}},
  {id:"ht4", cat:"footwear", name:"宽檐羊毛毡帽", desc:"帽子 · 复古优雅 · 气场担当", price:199, tag:"", image_url:U("1575428652377-a2d80e2277fc"),
    opts:{gender:"unisex", kind:"hat"}},

  /* ===== 保留：球衣 / 球鞋（供「专属定制」页使用，不在商城展示） ===== */
  {id:"j1", cat:"jersey", name:"红蓝主场竞技球衣", desc:"经典竖条纹 · DRI-FIT 速干", price:699, tag:"", image_url:"",
    opts:{style:"stripe", primary:"#b1131a", secondary:"#0a2d5c", number:"10", name:"MESSI", sponsor:"MIDEA", textColor:"#ffffff"}},
  {id:"j2", cat:"jersey", name:"深蓝客场球迷版球衣", desc:"斜纹撞色 · 透气网眼", price:599, tag:"", image_url:"",
    opts:{style:"sash", primary:"#0a2d5c", secondary:"#f5c518", number:"7", name:"VINI", sponsor:"FLY", textColor:"#ffffff"}},
  {id:"j3", cat:"jersey", name:"纯白极简训练球衣", desc:"纯色简约 · 轻量科技", price:459, tag:"", image_url:"",
    opts:{style:"solid", primary:"#f2f2f2", secondary:"#111111", number:"9", name:"HAALAND", sponsor:"ETIHAD", textColor:"#111111"}},
  {id:"s1", cat:"shoe", name:"Mercurial 定制足球鞋", desc:"轻量鞋面 · 精准触球", price:1299, tag:"", image_url:"",
    opts:{body:"#ffffff", sole:"#111111", swoosh:"#b1131a", lace:"#111111", name:"HYPE"}},
  {id:"s2", cat:"shoe", name:"Phantom 黑金战靴", desc:"贴合包裹 · 强力射门", price:1499, tag:"", image_url:"",
    opts:{body:"#111111", sole:"#c9a24a", swoosh:"#c9a24a", lace:"#c9a24a", name:"GOLD"}}
];

/* 兜底文案：全球时尚牛仔风格 */
window.DEFAULT_CONTENT = {
  topbar: '全球时尚上新 · 牛仔专区限时 <b>低至6折</b>，全场满 ¥499 顺丰包邮 · 30 天无忧退换',
  hero_kicker: '2026 DENIM EDIT · 全球时尚',
  hero_title: '定义你的<br>牛仔态度',
  hero_subtitle: '从经典直筒到复古阔腿，精选全球时髦牛仔与百搭单品。上衣、鞋帽一站搭齐，穿出属于你的街头态度。',
  promo_kicker: 'STYLE GUIDE',
  promo_title: '一条牛仔，百种穿搭',
  promo_text: '男装女装、上衣鞋帽自由组合。跟着造型指南轻松搭配，从通勤到街头，日日不重样。',
  footer_about: '全球时尚牛仔与穿搭平台。精选优质面料与设计，男装女装、鞋帽配饰一站购齐，穿出你的态度。'
};

/* 运行时数据（页面脚本读取这两个全局变量） */
window.PRODUCTS = [];
window.SITE = Object.assign({}, window.DEFAULT_CONTENT);

/* 从数据库行 → 前端商品对象 */
function rowToProduct(r){
  return {
    id: r.id, cat: r.cat, name: r.name, desc: r.description || "",
    price: r.price, tag: r.tag || "", image_url: r.image_url || "",
    opts: r.opts || {}
  };
}

/* 加载商品；失败或为空 → 回退示例数据 */
window.loadProducts = async function(){
  try{
    const { data, error } = await window.sb
      .from("products").select("*").order("sort", { ascending: true });
    if(error) throw error;
    window.PRODUCTS = (data && data.length) ? data.map(rowToProduct) : window.FALLBACK_PRODUCTS.slice();
  }catch(e){
    console.warn("[data] 商品加载失败，使用本地示例：", e.message);
    window.PRODUCTS = window.FALLBACK_PRODUCTS.slice();
  }
  return window.PRODUCTS;
};

/* 加载站点文案；缺失的键用默认值补齐 */
window.loadContent = async function(){
  try{
    const { data, error } = await window.sb.from("site_content").select("key,value");
    if(error) throw error;
    const map = Object.assign({}, window.DEFAULT_CONTENT);
    (data || []).forEach(r => { if(r.value != null && r.value !== "") map[r.key] = r.value; });
    window.SITE = map;
  }catch(e){
    console.warn("[data] 文案加载失败，使用默认文案：", e.message);
    window.SITE = Object.assign({}, window.DEFAULT_CONTENT);
  }
  return window.SITE;
};

/* 一次性加载前端所需全部数据 */
window.loadSiteData = async function(){
  await Promise.all([window.loadContent(), window.loadProducts()]);
  if(window.loadUserData) await window.loadUserData();
};
