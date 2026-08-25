/* ================= 数据层：从 Supabase 读取，失败时回退本地示例 ================= */

/* 兜底商品数据：Supabase 未配置或表为空时使用，保证页面永不空白 */
window.FALLBACK_PRODUCTS = [
  {id:"j1", cat:"jersey", name:"红蓝主场竞技球衣 26/27", desc:"经典竖条纹 · DRI-FIT 速干", price:699, tag:"新品", image_url:"",
    opts:{style:"stripe", primary:"#b1131a", secondary:"#0a2d5c", number:"10", name:"MESSI", sponsor:"MIDEA", textColor:"#ffffff"}},
  {id:"j2", cat:"jersey", name:"深蓝客场球迷版球衣", desc:"斜纹撞色 · 透气网眼", price:599, tag:"", image_url:"",
    opts:{style:"sash", primary:"#0a2d5c", secondary:"#f5c518", number:"7", name:"VINI", sponsor:"FLY", textColor:"#ffffff"}},
  {id:"j3", cat:"jersey", name:"纯白极简训练球衣", desc:"纯色简约 · 轻量科技", price:459, tag:"", image_url:"",
    opts:{style:"solid", primary:"#f2f2f2", secondary:"#111111", number:"9", name:"HAALAND", sponsor:"ETIHAD", textColor:"#111111"}},
  {id:"j4", cat:"jersey", name:"黑金限定球员版", desc:"暗夜黑金 · 球员剪裁", price:899, tag:"限量", image_url:"",
    opts:{style:"stripe", primary:"#111111", secondary:"#c9a24a", number:"11", name:"NEYMAR", sponsor:"QA", textColor:"#c9a24a"}},
  {id:"j5", cat:"jersey", name:"翠绿复古经典球衣", desc:"复古版型 · 纪念配色", price:549, tag:"", image_url:"",
    opts:{style:"solid", primary:"#0a7a3f", secondary:"#ffffff", number:"8", name:"KANTE", sponsor:"AIA", textColor:"#ffffff"}},
  {id:"j6", cat:"jersey", name:"橙黑活力街头球衣", desc:"高饱和撞色 · 街头潮流", price:499, tag:"热销", image_url:"",
    opts:{style:"sash", primary:"#ff6a00", secondary:"#111111", number:"23", name:"JAMES", sponsor:"KIA", textColor:"#111111"}},
  {id:"s1", cat:"shoe", name:"Mercurial 定制足球鞋", desc:"轻量鞋面 · 精准触球", price:1299, tag:"新品", image_url:"",
    opts:{body:"#ffffff", sole:"#111111", swoosh:"#b1131a", lace:"#111111", name:"HYPE"}},
  {id:"s2", cat:"shoe", name:"Phantom 黑金战靴", desc:"贴合包裹 · 强力射门", price:1499, tag:"限量", image_url:"",
    opts:{body:"#111111", sole:"#c9a24a", swoosh:"#c9a24a", lace:"#c9a24a", name:"GOLD"}},
  {id:"s3", cat:"shoe", name:"Tiempo 蓝调经典", desc:"真皮质感 · 舒适脚感", price:1099, tag:"", image_url:"",
    opts:{body:"#1f6fe0", sole:"#ffffff", swoosh:"#ffffff", lace:"#ffffff", name:"BLUE"}},
  {id:"s4", cat:"shoe", name:"Vapor 荧光竞速", desc:"极致轻量 · 爆发加速", price:1399, tag:"热销", image_url:"",
    opts:{body:"#c8ff00", sole:"#111111", swoosh:"#111111", lace:"#111111", name:"VOLT"}}
];

/* 兜底文案：与原网站保持一致 */
window.DEFAULT_CONTENT = {
  topbar: '夏日焕新 · 定制专区限时 <b>低至6折</b>，支持一件起做 · 全场满¥499包邮',
  hero_kicker: '2026/27 赛季 · 主场系列',
  hero_title: '设计属于你的<br>专属战袍',
  hero_subtitle: '红蓝主场经典配色，一件起做。自由定制号码、姓名、胸前广告与版式，球场之上，由你定义。',
  promo_kicker: 'BY YOU',
  promo_title: '从零打造你的队服',
  promo_text: '选择版式与配色，加上你的号码和名字，实时预览成衣效果。球鞋同样支持三区域自由配色。',
  footer_about: '专业球衣与球鞋定制平台。设计属于你的队服，一件起做，全球配送。'
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
};
