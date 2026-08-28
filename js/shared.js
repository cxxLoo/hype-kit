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

  /* 商品展示图：优先用后台上传的真实图片，否则用 SVG 生成图 */
  window.productMedia = function(p){
    if(p && p.image_url){
      return `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name||"")}" style="width:82%;height:82%;object-fit:contain">`;
    }
    return p && p.cat === "shoe" ? shoeSVG(p.opts) : jerseySVG(p ? p.opts : {});
  };

  /* ---------- 购物车 ---------- */
  window.Cart = {
    all(){ try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch(e){return[]} },
    save(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); updateBadge(); },
    add(item){
      const list = this.all();
      item.id = item.id || ("i"+Date.now()+Math.floor(Math.random()*1000));
      item.qty = item.qty || 1;
      list.push(item); this.save(list);
    },
    remove(id){ this.save(this.all().filter(x=>x.id!==id)); },
    setQty(id,q){ const l=this.all(); const it=l.find(x=>x.id===id); if(it){it.qty=Math.max(1,q); this.save(l);} },
    count(){ return this.all().reduce((n,x)=>n+x.qty,0); },
    total(){ return this.all().reduce((n,x)=>n+x.price*x.qty,0); }
  };
  function updateBadge(){
    document.querySelectorAll(".cart-count").forEach(el=>{
      const c = window.Cart.count();
      el.textContent = c; el.style.display = c ? "flex" : "none";
    });
  }
  window.updateCartBadge = updateBadge;

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
          <a href="jerseys.html" data-k="jerseys">球衣商城</a>
          <a href="shoes.html" data-k="shoes">球鞋商城</a>
          <a href="customize.html" data-k="custom">专属定制</a>
          <a href="service.html" data-k="service">客服中心</a>
          <a href="orders.html" data-k="orders">我的订单</a>
          <a href="club.html" data-k="club">俱乐部</a>
        </div>
        <div class="nav-right">
          <div class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#111" stroke-width="2"/><path d="M20 20l-3-3" stroke="#111" stroke-width="2"/></svg><input placeholder="搜索球衣、球鞋"></div>
          <a class="icon-btn" href="customize.html" title="定制">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="#111" stroke-width="2" stroke-linecap="round"/><path d="M16 3l5 5L8 21H3v-5L16 3z" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>
          </a>
          <a class="icon-btn cart-link" href="cart.html" title="购物袋">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 7h12l-1 13H7L6 7z" stroke="#111" stroke-width="2" stroke-linejoin="round"/><path d="M9 7a3 3 0 0 1 6 0" stroke="#111" stroke-width="2"/></svg>
            <span class="cart-count">0</span>
          </a>
          <a class="nav-account" id="nav-account" href="account.html">登录/注册</a>
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
          <div><h5>选购</h5><a href="jerseys.html">球衣商城</a><a href="shoes.html">球鞋商城</a><a href="customize.html">专属定制</a><a href="jerseys.html">新品上市</a></div>
          <div><h5>帮助</h5><a href="#">配送与退换</a><a href="#">尺码指南</a><a href="#">定制说明</a><a href="service.html">联系客服</a></div>
          <div><h5>关于</h5><a href="#">品牌故事</a><a href="#">俱乐部合作</a><a href="#">加入我们</a><a href="#">隐私政策</a></div>
        </div>
        <div class="foot-bottom"><span>© 2026 HYPE KIT 球衣定制. 本站为演示 Demo,非真实交易。</span><span>中国大陆 · 简体中文</span></div>
      </div></footer>`;
    }
    updateBadge();
    refreshAccount();
  };

  async function refreshAccount(){
    const el = document.getElementById("nav-account");
    if(!el || !window.sb) return;
    try{
      const { data:{ session } } = await sb.auth.getSession();
      const user = session && session.user;
      if(user){
        const name = (user.user_metadata && user.user_metadata.display_name) || user.email.split("@")[0];
        el.textContent = "我的 · " + name;
      }else{
        el.textContent = "登录/注册";
      }
    }catch(e){}
  }
})();
