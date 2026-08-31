/* ================= 共享逻辑:SVG 生成 · 购物车 · 组件 ================= */
(function(){
  "use strict";
  const LS_KEY = "jd_cart_v1";

  /* ---------- SVG 图形 ---------- */
  // 球衣:支持 纯色/竖条纹/斜纹 三种版式,双色,含号码/姓名/胸前广告
  window.jerseySVG = function(o){
    o = o || {};
    const p = o.primary || "#b1131a";
    const s = o.secondary || "#0a2d5c";
    const style = o.style || "stripe";     // solid | stripe | sash
    const name = (o.name || "").toUpperCase();
    const num = o.number != null ? String(o.number) : "10";
    const sponsor = o.sponsor || "";
    const txt = o.textColor || "#ffffff";
    let body;
    if(style === "solid"){
      body = `<path d="M60 70 L110 40 L150 60 Q160 30 200 30 Q240 30 250 60 L290 40 L340 70
        L315 130 L285 115 L285 360 Q200 375 115 360 L115 115 L85 130 Z" fill="${p}"/>`;
    } else if(style === "sash"){
      body = `<path d="M60 70 L110 40 L150 60 Q160 30 200 30 Q240 30 250 60 L290 40 L340 70
        L315 130 L285 115 L285 360 Q200 375 115 360 L115 115 L85 130 Z" fill="${p}"/>
        <path d="M115 360 L285 115 L285 175 L150 360 Z" fill="${s}"/>`;
    } else { // stripe
      body = `<path d="M60 70 L110 40 L150 60 Q160 30 200 30 Q240 30 250 60 L290 40 L340 70
        L315 130 L285 115 L285 360 Q200 375 115 360 L115 115 L85 130 Z" fill="${p}"/>
        <g>
        <rect x="145" y="45" width="24" height="320" fill="${s}"/>
        <rect x="188" y="35" width="24" height="330" fill="${s}"/>
        <rect x="231" y="45" width="24" height="320" fill="${s}"/>
        </g>`;
    }
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="jclip"><path d="M60 70 L110 40 L150 60 Q160 30 200 30 Q240 30 250 60 L290 40 L340 70
        L315 130 L285 115 L285 360 Q200 375 115 360 L115 115 L85 130 Z"/></clipPath></defs>
      ${style!=="solid" ? `<g clip-path="url(#jclip)">${body}</g>` : body}
      <path d="M60 70 L110 40 L150 60 Q160 30 200 30 Q240 30 250 60 L290 40 L340 70
        L315 130 L285 115 L285 360 Q200 375 115 360 L115 115 L85 130 Z"
        fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
      <path d="M150 60 Q200 92 250 60 L245 78 Q200 105 155 78 Z" fill="${s}" opacity=".85"/>
      <text x="200" y="150" text-anchor="middle" font-size="20" font-weight="700"
        fill="${txt}" font-family="Arial" opacity=".95">${escapeHtml(sponsor)}</text>
      <text x="200" y="270" text-anchor="middle" font-size="120" font-weight="800"
        fill="${txt}" font-family="Arial">${escapeHtml(num)}</text>
      <text x="200" y="330" text-anchor="middle" font-size="26" font-weight="700"
        letter-spacing="2" fill="${txt}" font-family="Arial">${escapeHtml(name)}</text>
    </svg>`;
  };

  // 球鞋:鞋身/鞋底/勾勾 三区域可分别配色
  window.shoeSVG = function(o){
    o = o || {};
    const body = o.body || "#ffffff";
    const sole = o.sole || "#111111";
    const swoosh = o.swoosh || "#b1131a";
    const lace = o.lace || "#111111";
    const name = (o.name || "").toUpperCase();
    return `<svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 170 Q40 120 90 110 L150 95 Q190 70 250 78 Q330 88 380 140
        Q398 152 395 172 L392 190 Q388 200 375 200 L60 200 Q34 198 30 178 Z"
        fill="${body}" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
      <path d="M235 92 Q300 96 355 135 Q300 120 250 120 Q235 108 235 92 Z" fill="${swoosh}"/>
      <path d="M120 120 Q135 112 150 118 M140 132 Q155 124 170 130 M160 144 Q175 136 190 142"
        stroke="${lace}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M30 178 Q34 198 60 200 L375 200 Q388 200 392 190 L395 210
        Q393 226 372 228 L64 228 Q36 226 30 206 Z" fill="${sole}"/>
      <rect x="70" y="205" width="290" height="6" rx="3" fill="rgba(255,255,255,.25)"/>
      <text x="210" y="252" text-anchor="middle" font-size="18" font-weight="700"
        fill="#111" font-family="Arial" letter-spacing="1">${escapeHtml(name)}</text>
    </svg>`;
  };

  function escapeHtml(s){return String(s).replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));}
  window.escapeHtml = escapeHtml;

  /* 牛仔穿搭（上衣 + 牛仔裤）：版型/水洗色/上衣色/做旧/绣字可定制 */
  window.denimSVG = function(o){
    o = o || {};
    const wash = o.wash || "#31538a";
    const top  = o.top  || "#efe9e0";
    const fit  = o.fit  || "straight";
    const dis  = o.distress || "none";
    const txt  = (o.text || "").toUpperCase();
    const st   = "#e6b25e"; // 金色车缝线
    const waistY = 158, crotchY = 252, kneeY = 336, ankleY = 436;
    const FITS = {
      straight:{ko:118, ao:122, ai:178},
      tapered: {ko:128, ao:150, ai:184},
      wide:    {ko:110, ao:92,  ai:166},
      flare:   {ko:136, ao:90,  ai:174}
    };
    const f = FITS[fit] || FITS.straight;
    const mir = x => 400 - x;
    const legL = `M118 ${waistY} Q114 ${(waistY+kneeY)/2} ${f.ko} ${kneeY}`
      + ` Q${(f.ko+f.ao)/2} ${(kneeY+ankleY)/2+8} ${f.ao} ${ankleY}`
      + ` L${f.ai} ${ankleY} Q${(f.ai+196)/2} ${(ankleY+crotchY)/2} 196 ${crotchY} L196 ${waistY} Z`;
    const legR = `M${mir(118)} ${waistY} Q${mir(114)} ${(waistY+kneeY)/2} ${mir(f.ko)} ${kneeY}`
      + ` Q${mir((f.ko+f.ao)/2)} ${(kneeY+ankleY)/2+8} ${mir(f.ao)} ${ankleY}`
      + ` L${mir(f.ai)} ${ankleY} Q${mir((f.ai+196)/2)} ${(ankleY+crotchY)/2} ${mir(196)} ${crotchY} L${mir(196)} ${waistY} Z`;
    let dz = "";
    if(dis === "whisker"){
      dz = `<g stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none" stroke-linecap="round">
        <path d="M150 208 q18 8 30 4 M148 222 q22 8 36 3 M250 208 q-18 8 -30 4 M252 222 q-22 8 -36 3"/></g>`;
    } else if(dis === "ripped"){
      dz = `<g fill="rgba(255,255,255,.85)"><rect x="120" y="322" width="34" height="15" rx="3"/><rect x="246" y="322" width="34" height="15" rx="3"/></g>
        <g stroke="rgba(0,0,0,.14)" stroke-width="1"><path d="M122 330h30 M248 330h30"/></g>`;
    }
    const tee = `<g><path d="M150 58 L120 78 L108 120 L134 132 L140 108 L140 168 L260 168 L260 108 L266 132 L292 120 L280 78 L250 58 Q225 84 175 58 Z"
        fill="${top}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>
      <path d="M175 58 Q200 82 225 58 L220 74 Q200 92 180 74 Z" fill="rgba(0,0,0,.08)"/></g>`;
    const pocketTxt = txt
      ? `<text x="150" y="212" text-anchor="middle" font-size="14" font-weight="700" fill="${st}" font-family="Arial" letter-spacing="1">${escapeHtml(txt)}</text>` : "";
    return `<svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="dwash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(255,255,255,.14)"/><stop offset=".5" stop-color="rgba(255,255,255,0)"/>
        <stop offset="1" stop-color="rgba(0,0,0,.2)"/></linearGradient></defs>
      ${tee}
      <path d="${legL}" fill="${wash}"/><path d="${legR}" fill="${wash}"/>
      <path d="${legL}" fill="url(#dwash)"/><path d="${legR}" fill="url(#dwash)"/>
      <path d="M114 ${waistY} L286 ${waistY} L286 ${waistY-24} Q200 ${waistY-40} 114 ${waistY-24} Z" fill="${wash}"/>
      <path d="M114 ${waistY} L286 ${waistY} L286 ${waistY-24} Q200 ${waistY-40} 114 ${waistY-24} Z" fill="url(#dwash)"/>
      <g fill="${wash}" stroke="rgba(0,0,0,.15)" stroke-width="1">
        <rect x="128" y="${waistY-26}" width="8" height="20" rx="2"/><rect x="196" y="${waistY-30}" width="8" height="22" rx="2"/><rect x="264" y="${waistY-26}" width="8" height="20" rx="2"/></g>
      <g stroke="${st}" stroke-width="2" fill="none" stroke-dasharray="5 4" stroke-linecap="round">
        <path d="M114 ${waistY-22} Q200 ${waistY-36} 286 ${waistY-22}"/><path d="M114 ${waistY-4} L286 ${waistY-4}"/>
        <path d="M200 ${waistY} L200 ${crotchY-2}"/><path d="M150 ${waistY+6} q-14 22 -6 46"/><path d="M250 ${waistY+6} q14 22 6 46"/>
        <path d="M138 ${waistY+4} q-16 6 -20 34"/><path d="M262 ${waistY+4} q16 6 20 34"/></g>
      <circle cx="200" cy="${waistY-2}" r="5" fill="${st}"/>
      ${dz}${pocketTxt}
      <g fill="none" stroke="rgba(0,0,0,.2)" stroke-width="2"><path d="${legL}"/><path d="${legR}"/></g>
    </svg>`;
  };

  /* 饰品（帽子）：帽型/主色/滚边配色/刺绣文字可定制 */
  window.accessorySVG = function(o){
    o = o || {};
    const type = o.type || "cap";
    const c    = o.color || "#1f3a63";
    const ac   = o.accent || "#e6b25e";
    const txt  = (o.text || "").toUpperCase();
    const label = t => txt ? `<text x="210" y="${t}" text-anchor="middle" font-size="20" font-weight="800" fill="${ac}" font-family="Arial" letter-spacing="1">${escapeHtml(txt)}</text>` : "";
    let body;
    if(type === "bucket"){
      body = `<path d="M126 152 L152 92 L268 92 L294 152 Z" fill="${c}"/>
        <path d="M126 152 L152 92 L268 92 L294 152 Z" fill="url(#hsh)"/>
        <path d="M92 150 Q210 136 328 150 Q302 194 210 198 Q118 194 92 150 Z" fill="${c}"/>
        <path d="M92 150 Q210 136 328 150 Q302 194 210 198 Q118 194 92 150 Z" fill="url(#hsh)"/>
        <path d="M150 132 Q210 122 270 132" stroke="${ac}" stroke-width="5" fill="none"/>
        ${label(126)}`;
    } else if(type === "fedora"){
      body = `<ellipse cx="210" cy="170" rx="154" ry="28" fill="${c}"/>
        <ellipse cx="210" cy="170" rx="154" ry="28" fill="url(#hsh)"/>
        <path d="M140 170 Q140 78 210 74 Q280 78 280 170 Z" fill="${c}"/>
        <path d="M140 170 Q140 78 210 74 Q280 78 280 170 Z" fill="url(#hsh)"/>
        <path d="M150 90 Q210 108 270 90" stroke="rgba(0,0,0,.18)" stroke-width="6" fill="none"/>
        <path d="M140 150 L280 150 L280 168 L140 168 Z" fill="${ac}"/>
        ${label(140)}`;
    } else if(type === "beanie"){
      body = `<path d="M130 178 Q130 82 210 80 Q290 82 290 178 Z" fill="${c}"/>
        <path d="M130 178 Q130 82 210 80 Q290 82 290 178 Z" fill="url(#hsh)"/>
        <g stroke="rgba(0,0,0,.12)" stroke-width="3" fill="none">
          <path d="M158 96 L158 172 M186 86 L186 178 M214 82 L214 180 M242 86 L242 178 M270 96 L270 172"/></g>
        <rect x="120" y="168" width="180" height="34" rx="16" fill="${ac}"/>
        ${txt?`<text x="210" y="192" text-anchor="middle" font-size="18" font-weight="800" fill="${c}" font-family="Arial" letter-spacing="1">${escapeHtml(txt)}</text>`:""}`;
    } else { // cap 棒球帽
      body = `<path d="M118 176 Q120 96 214 92 Q312 96 320 176 Q220 162 118 176 Z" fill="${c}"/>
        <path d="M118 176 Q120 96 214 92 Q312 96 320 176 Q220 162 118 176 Z" fill="url(#hsh)"/>
        <path d="M118 176 Q62 176 58 200 Q150 216 220 202 Q168 184 118 176 Z" fill="${ac}"/>
        <path d="M118 176 Q62 176 58 200 Q150 216 220 202 Q168 184 118 176 Z" fill="url(#hsh)"/>
        <g stroke="rgba(0,0,0,.12)" stroke-width="2" fill="none">
          <path d="M214 92 L180 168 M214 92 L214 166 M214 92 L250 168"/></g>
        <circle cx="214" cy="96" r="6" fill="${ac}"/>
        ${label(150)}`;
    }
    return `<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="hsh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(255,255,255,.18)"/><stop offset=".55" stop-color="rgba(255,255,255,0)"/>
        <stop offset="1" stop-color="rgba(0,0,0,.16)"/></linearGradient></defs>
      ${body}
      <g fill="none" stroke="rgba(0,0,0,.16)" stroke-width="2"></g>
    </svg>`;
  };

  /* 商品展示图：优先用真实图片（时尚模特图），加载失败自动回退到备用图；
     球衣/球鞋（保留供定制）无图片时用 SVG 生成图 */
  window.productMedia = function(p){
    if(p && p.image_url){
      const seed = encodeURIComponent((p && p.id) || "hk");
      const fb = "https://picsum.photos/seed/" + seed + "/500/620";
      return `<img class="pm-img" src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name||"")}" loading="lazy" decoding="async" data-fb="${fb}" onload="this.classList.add('is-loaded')" onerror="window.__imgFallback&&window.__imgFallback(this)">`;
    }
    return p && p.cat === "shoe" ? shoeSVG(p.opts) : jerseySVG(p ? p.opts : {});
  };

  /* ---------- 图片守护：慢/失败自动降级，避免「几分钟白图」 ---------- */
  window.__imgFallback = function(img){
    const tries = +(img.dataset.fbtry || 0);
    if(tries >= 1){ img.classList.add("is-loaded","is-error"); return; }  // 二次失败：停手，显示占位底
    img.dataset.fbtry = tries + 1;
    const fb = img.dataset.fb;
    if(fb){ img.src = fb; } else { img.classList.add("is-loaded","is-error"); }
  };
  (function watchImages(){
    const TIMEOUT = 6000;
    function arm(img){
      if(img.dataset.hkw) return; img.dataset.hkw = "1";
      if(img.complete && img.naturalWidth > 0){ img.classList.add("is-loaded"); return; }
      const t = setTimeout(()=>{
        if(!(img.complete && img.naturalWidth > 0)) window.__imgFallback(img);  // 超时未加载 → 降级
      }, TIMEOUT);
      img.addEventListener("load", ()=>{ clearTimeout(t); img.classList.add("is-loaded"); }, { once:true });
    }
    function scan(root){ (root.querySelectorAll ? root.querySelectorAll("img.pm-img") : []).forEach(arm); }
    const start = ()=>{
      scan(document);
      new MutationObserver(muts=>{
        muts.forEach(m=> m.addedNodes && m.addedNodes.forEach(n=>{
          if(n.nodeType!==1) return;
          if(n.matches && n.matches("img.pm-img")) arm(n);
          else scan(n);
        }));
      }).observe(document.body, { childList:true, subtree:true });
    };
    if(document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();

  /* ================= 用户数据同步：收藏 + 购物袋 =================
     登录用户 → 存 Supabase（跨设备）；游客 → 存浏览器本地；
     登录后首次加载会把本地数据迁移到账号，再清空本地。 */
  const FAV_KEYS = { product:"hk_fav_products_v1", post:"hk_fav_posts_v1" };
  let CURRENT_USER = null;
  let __fav  = { product:[], post:[] };
  let __cart = [];
  let _userDataPromise = null;

  function readLS(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } }
  function writeLS(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

  async function migrateGuestData(){
    const lp = readLS(FAV_KEYS.product), lpp = readLS(FAV_KEYS.post), lc = readLS(LS_KEY);
    if(!lp.length && !lpp.length && !lc.length) return;
    let ok = true;
    const rows = [];
    lp.forEach(id => rows.push({ user_id:CURRENT_USER, item_type:"product", item_id:String(id) }));
    lpp.forEach(id => rows.push({ user_id:CURRENT_USER, item_type:"post", item_id:String(id) }));
    if(rows.length){
      const { error } = await sb.from("favorites").upsert(rows, { onConflict:"user_id,item_type,item_id", ignoreDuplicates:true });
      if(error) ok = false;
    }
    if(lc.length){
      const crows = lc.map(it => ({ user_id:CURRENT_USER, sku:it.sku||"", title:it.title||"",
        price:it.price||0, size:it.size||"", meta:it.meta||"", svg:it.svg||"", qty:it.qty||1 }));
      const { error } = await sb.from("cart_items").insert(crows);
      if(error) ok = false;
    }
    if(ok){
      localStorage.removeItem(FAV_KEYS.product);
      localStorage.removeItem(FAV_KEYS.post);
      localStorage.removeItem(LS_KEY);
    }
  }

  async function _loadUserData(){
    try{
      const { data:{ session } } = await sb.auth.getSession();
      CURRENT_USER = session && session.user ? session.user.id : null;
    }catch(e){ CURRENT_USER = null; }

    if(CURRENT_USER){
      try{ await migrateGuestData(); }catch(e){}
      __fav = { product:[], post:[] };
      try{
        const { data } = await sb.from("favorites").select("item_type,item_id")
          .eq("user_id", CURRENT_USER).order("created_at", { ascending:false });
        (data||[]).forEach(f => { if(__fav[f.item_type]) __fav[f.item_type].push(f.item_id); });
      }catch(e){}
      try{
        const { data } = await sb.from("cart_items").select("*")
          .eq("user_id", CURRENT_USER).order("created_at", { ascending:true });
        __cart = (data||[]).map(r => ({ id:r.id, sku:r.sku, title:r.title, price:r.price,
          size:r.size, meta:r.meta, svg:r.svg, qty:r.qty }));
      }catch(e){}
    }else{
      __fav = { product: readLS(FAV_KEYS.product), post: readLS(FAV_KEYS.post) };
      __cart = readLS(LS_KEY);
    }
    updateBadge(); updateFavBadge();
    try{ document.dispatchEvent(new Event("hk:userdata")); }catch(e){}
  }
  // 幂等：同一次页面加载只真正拉取一次
  window.loadUserData = function(force){
    if(_userDataPromise && !force) return _userDataPromise;
    _userDataPromise = _loadUserData();
    return _userDataPromise;
  };
  window.currentUserId = () => CURRENT_USER;

  /* ---------- 购物袋 ---------- */
  window.Cart = {
    all(){ return __cart.slice(); },
    save(list){
      __cart = (list||[]).slice();
      if(CURRENT_USER){
        if(!__cart.length){ sb.from("cart_items").delete().eq("user_id", CURRENT_USER).then(()=>{}, ()=>{}); }
      }else{
        writeLS(LS_KEY, __cart);
      }
      updateBadge();
    },
    add(item){
      item.qty = item.qty || 1;
      if(CURRENT_USER){
        const rec = { sku:item.sku||"", title:item.title||"", price:item.price||0,
          size:item.size||"", meta:item.meta||"", svg:item.svg||"", qty:item.qty };
        const tmp = "tmp"+Date.now()+Math.floor(Math.random()*1000);
        __cart.push(Object.assign({ id:tmp }, rec));
        updateBadge();
        sb.from("cart_items").insert(Object.assign({ user_id:CURRENT_USER }, rec)).select("id").single()
          .then(({ data })=>{ const it = __cart.find(x=>x.id===tmp); if(it && data) it.id = data.id; }, ()=>{});
      }else{
        item.id = item.id || ("i"+Date.now()+Math.floor(Math.random()*1000));
        __cart.push(item); writeLS(LS_KEY, __cart); updateBadge();
      }
    },
    remove(id){
      __cart = __cart.filter(x=>x.id!==id);
      if(CURRENT_USER){ sb.from("cart_items").delete().eq("id", id).then(()=>{}, ()=>{}); }
      else{ writeLS(LS_KEY, __cart); }
      updateBadge();
    },
    setQty(id,q){
      const it = __cart.find(x=>x.id===id); if(!it) return;
      it.qty = Math.max(1,q);
      if(CURRENT_USER){ sb.from("cart_items").update({ qty:it.qty }).eq("id", id).then(()=>{}, ()=>{}); }
      else{ writeLS(LS_KEY, __cart); }
      updateBadge();
    },
    count(){ return __cart.reduce((n,x)=>n+x.qty,0); },
    total(){ return __cart.reduce((n,x)=>n+x.price*x.qty,0); }
  };
  function updateBadge(){
    document.querySelectorAll(".cart-count").forEach(el=>{
      const c = window.Cart.count();
      el.textContent = c; el.style.display = c ? "flex" : "none";
    });
  }
  window.updateCartBadge = updateBadge;

  /* ---------- 收藏（商品 + 帖子） ---------- */
  window.Favs = {
    KEYS: FAV_KEYS,
    list(type){ return (__fav[type] || []).slice(); },
    has(type, id){ return (__fav[type] || []).includes(id); },
    toggle(type, id){
      const arr = __fav[type] || (__fav[type] = []);
      const i = arr.indexOf(id);
      const nowOn = i < 0;
      if(nowOn) arr.unshift(id); else arr.splice(i,1);
      if(CURRENT_USER){
        if(nowOn){
          sb.from("favorites").upsert({ user_id:CURRENT_USER, item_type:type, item_id:String(id) },
            { onConflict:"user_id,item_type,item_id", ignoreDuplicates:true }).then(()=>{}, ()=>{});
        }else{
          sb.from("favorites").delete().eq("user_id", CURRENT_USER)
            .eq("item_type", type).eq("item_id", String(id)).then(()=>{}, ()=>{});
        }
      }else{
        writeLS(FAV_KEYS[type], __fav[type]);
      }
      updateFavBadge();
      return nowOn; // true = 现在已收藏
    },
    count(){ return (__fav.product||[]).length + (__fav.post||[]).length; }
  };
  function updateFavBadge(){
    document.querySelectorAll(".fav-count").forEach(el=>{
      const c = window.Favs.count();
      el.textContent = c; el.style.display = c ? "flex" : "none";
    });
  }
  window.updateFavBadge = updateFavBadge;

  /* ---------- 订单：状态定义 + 本地凭证 ---------- */
  window.ORDER_FLOW  = ["pending_payment","paid","shipped","completed"];
  window.ORDER_LABEL = {
    pending_payment:"待付款", paid:"待发货", shipped:"已发货",
    completed:"已完成", cancelled:"已取消"
  };
  // 记录本机下过的订单 token，用于「我的订单」查询
  window.MyOrders = {
    KEY:"hk_order_tokens_v1",
    tokens(){ try{ return JSON.parse(localStorage.getItem(this.KEY)) || []; }catch(e){ return []; } },
    add(t){ const l=this.tokens(); if(t && !l.includes(t)){ l.unshift(t); localStorage.setItem(this.KEY, JSON.stringify(l)); } }
  };

  /* ---------- Toast ---------- */
  window.toast = function(msg){
    let t = document.querySelector(".toast");
    if(!t){ t=document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1800);
  };

  /* ---------- 公共导航 / 页脚 ---------- */
  const NIKE_LOGO = `<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" aria-label="logo">
    <path d="M40 150 C60 60 200 -10 620 20 C300 60 180 120 120 150 C90 165 55 165 40 150 Z" fill="#111"/></svg>`;

  window.mountChrome = function(active){
    const C = window.SITE || window.DEFAULT_CONTENT || {};
    const nav = document.getElementById("nav-slot");
    if(nav){
      nav.innerHTML = `
      <div class="topbar container-wide">${C.topbar || ""}</div>
      <div class="nav"><div class="container"><div class="nav-inner">
        <a class="logo" href="index.html">${NIKE_LOGO}<span class="brand">HYPE&nbsp;KIT</span></a>
        <div class="menu">
          <a href="index.html" data-k="home">首页</a>
          <a href="clothing.html" data-k="clothing">服装商城</a>
          <a href="footwear.html" data-k="footwear">鞋帽商城</a>
          <a href="customize.html" data-k="custom">专属定制</a>
          <a href="service.html" data-k="service">客服中心</a>
          <a href="orders.html" data-k="orders">我的订单</a>
          <a href="club.html" data-k="club">俱乐部</a>
        </div>
        <div class="nav-right">
          <div class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#111" stroke-width="2"/><path d="M20 20l-3-3" stroke="#111" stroke-width="2"/></svg><input placeholder="搜索牛仔裤、鞋帽"></div>
          <a class="icon-btn cart-link" href="favorites.html" title="我的收藏">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20.5S3.5 15 3.5 8.9C3.5 6.1 5.7 4 8.3 4c1.7 0 3 .9 3.7 2 .7-1.1 2-2 3.7-2 2.6 0 4.8 2.1 4.8 4.9C20.5 15 12 20.5 12 20.5z" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>
            <span class="fav-count">0</span>
          </a>
          <a class="icon-btn cart-link" href="cart.html" title="购物袋">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 7h12l-1 13H7L6 7z" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M9 7a3 3 0 0 1 6 0" stroke="#111" stroke-width="2"/></svg>
            <span class="cart-count">0</span>
          </a>
          <div class="acct" id="acct">
            <a class="nav-account" href="account.html">登录 / 注册</a>
          </div>
        </div>
      </div></div></div>`;
      const cur = nav.querySelector(`.menu a[data-k="${active}"]`);
      if(cur) cur.classList.add("active");
    }
    const foot = document.getElementById("footer-slot");
    if(foot){
      foot.innerHTML = `<footer><div class="container">
        <div class="foot-grid">
          <div><div class="logo" style="margin-bottom:14px">${NIKE_LOGO}<span class="brand" style="color:#fff">HYPE KIT</span></div>
            <p style="color:#aaa;font-size:14px;max-width:320px">${C.footer_about || ""}</p></div>
          <div><h5>选购</h5><a href="clothing.html">服装商城</a><a href="footwear.html">鞋帽商城</a><a href="customize.html">专属定制</a><a href="clothing.html">新品上市</a></div>
          <div><h5>帮助</h5><a href="#">配送与退换</a><a href="#">尺码指南</a><a href="#">定制说明</a><a href="service.html">联系客服</a></div>
          <div><h5>关于</h5><a href="#">品牌故事</a><a href="#">俱乐部合作</a><a href="#">加入我们</a><a href="#">隐私政策</a></div>
        </div>
        <div class="foot-bottom"><span>© 2026 HYPE KIT 全球时尚牛仔. 本站为演示 Demo,非真实交易。</span><span>中国大陆 · 简体中文</span></div>
      </div></footer>`;
    }
    updateBadge();
    updateFavBadge();
    refreshAccount();
    if(window.loadUserData) window.loadUserData();
  };

  function avatarInner(name, url){
    if(url) return `<img src="${escapeHtml(url)}" alt="">`;
    return escapeHtml(((name||"U").trim()[0]||"U").toUpperCase());
  }
  function avatarColor(name){
    const pool = ["#b1131a","#0a2d5c","#e8467c","#c9a24a","#0a7a3f","#ff6a00","#1f6fe0","#7a3ff2"];
    let h=0; for(const c of String(name||"")) h=(h*31+c.charCodeAt(0))>>>0;
    return pool[h % pool.length];
  }

  async function refreshAccount(){
    const box = document.getElementById("acct");
    if(!box || !window.sb) return;
    let user=null, name="", email="", isAdmin=false, avatar="";
    try{
      const { data:{ session } } = await sb.auth.getSession();
      user = session && session.user;
      if(user){
        email = user.email || "";
        name = (user.user_metadata && user.user_metadata.display_name) || email.split("@")[0];
        try{
          const { data } = await sb.from("profiles").select("display_name,is_admin,avatar_url").eq("id", user.id).single();
          if(data){ name = data.display_name || name; isAdmin = !!data.is_admin; avatar = data.avatar_url || ""; }
        }catch(e){}
      }
    }catch(e){}

    if(!user){
      box.innerHTML = `<a class="nav-account" href="account.html">登录 / 注册</a>`;
      return;
    }

    const col = avatarColor(name);
    box.innerHTML = `
      <button class="acct-btn" id="acct-btn" aria-haspopup="true">
        <span class="acct-ava" style="background:${col}">${avatarInner(name, avatar)}</span>
        <span class="acct-name">${escapeHtml(name)}</span>
        <svg class="acct-caret" width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="acct-menu" id="acct-menu">
        <div class="acct-head">
          <span class="acct-ava lg" style="background:${col}">${avatarInner(name, avatar)}</span>
          <div class="acct-meta"><b>${escapeHtml(name)}</b><span>${escapeHtml(email)}</span></div>
        </div>
        <a href="profile.html">个人信息</a>
        <a href="profile.html#password">密码修改</a>
        <a href="orders.html">我的订单</a>
        <a href="favorites.html">我的收藏</a>
        ${isAdmin ? `<a href="admin/index.html">管理后台</a>` : ``}
        <button type="button" id="acct-logout">退出登录</button>
      </div>`;

    const btn = document.getElementById("acct-btn");
    const menu = document.getElementById("acct-menu");
    btn.addEventListener("click", (e)=>{ e.stopPropagation(); box.classList.toggle("open"); });
    document.addEventListener("click", (e)=>{ if(!box.contains(e.target)) box.classList.remove("open"); });
    document.getElementById("acct-logout").addEventListener("click", async ()=>{
      await sb.auth.signOut(); location.href = "index.html";
    });
  }
  window.refreshAccount = refreshAccount;
})();
