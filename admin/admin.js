/* ================= 管理后台逻辑 ================= */
(function(){
  "use strict";
  const $ = (id)=>document.getElementById(id);
  let editingId = null;         // 正在编辑的商品 id；null 表示新增
  let currentImageUrl = "";     // 当前商品图片 URL
  let meId = null;              // 当前登录管理员的用户 id

  /* ---------- 登录校验 ---------- */
  async function requireAuth(){
    const { data:{ session } } = await sb.auth.getSession();
    if(!session){ location.replace("login.html"); return null; }
    // 必须是管理员
    const { data:isAdmin } = await sb.rpc("is_admin");
    if(isAdmin !== true){ await sb.auth.signOut(); location.replace("login.html"); return null; }
    meId = session.user.id;
    const email = session.user.email || "admin";
    $("who").textContent = email;
    $("avatar").textContent = (email[0] || "A").toUpperCase();
    return session;
  }

  /* ---------- Toast ---------- */
  function toast(msg){
    let t = document.querySelector(".toast");
    if(!t){ t=document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2000);
  }

  /* ---------- 标签页切换 ---------- */
<<<<<<< HEAD
  const SECTIONS = { products:"tab-products", content:"tab-content", orders:"tab-orders", feedback:"tab-feedback", faqs:"tab-faqs", accounts:"tab-accounts" };
=======
  const SECTIONS = { products:"tab-products", content:"tab-content", orders:"tab-orders", accounts:"tab-accounts" };
>>>>>>> ce171bc6f927260ee23722e5b61d3817877f5ad2
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("on"));
    t.classList.add("on");
    const k = t.dataset.tab;
    $("crumb").textContent = t.dataset.crumb || "";
    Object.keys(SECTIONS).forEach(key=>{ $(SECTIONS[key]).style.display = key===k ? "" : "none"; });
    if(k==="orders") loadOrders();
<<<<<<< HEAD
    if(k==="feedback") loadFeedback();
    if(k==="faqs") loadFaqs();
=======
>>>>>>> ce171bc6f927260ee23722e5b61d3817877f5ad2
    if(k==="accounts") loadAccounts();
  }));

  /* ---------- 退出 ---------- */
  $("logout").addEventListener("click", async ()=>{
    await sb.auth.signOut();
    location.replace("login.html");
  });

  /* ================= 商品管理 ================= */
  async function loadProductList(){
    const box = $("product-list");
    const { data, error } = await sb.from("products").select("*").order("sort",{ascending:true});
    if(error){ box.innerHTML = `<div class="err">加载失败：${error.message}</div>`; return; }
    // 统计卡片
    const list = data || [];
    $("stat-total").textContent  = list.length;
    $("stat-jersey").textContent = list.filter(x=>x.cat==="jersey").length;
    $("stat-shoe").textContent   = list.filter(x=>x.cat==="shoe").length;
    if(!list.length){ box.innerHTML = `<div class="empty-state">还没有商品，点击右上角「+ 新增商品」。</div>`; return; }
    box.innerHTML = `<table><thead><tr>
      <th>商品</th><th>ID</th><th>分类</th><th>价格</th><th>标签</th><th>操作</th>
    </tr></thead><tbody>${list.map(rowHtml).join("")}</tbody></table>`;
    box.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>openEdit(list.find(x=>x.id===b.dataset.edit))));
    box.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>delProduct(b.dataset.del)));
  }

  function rowHtml(r){
    const p = { cat:r.cat, name:r.name, opts:r.opts||{}, image_url:r.image_url||"" };
    const catPill = r.cat==="jersey"
      ? `<span class="pill cat">球衣</span>`
      : `<span class="pill cat shoe">球鞋</span>`;
    const tagPill = r.tag ? `<span class="pill tag">${escapeHtml(r.tag)}</span>` : `<span style="color:#c3c8d2">—</span>`;
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:12px">
        <div class="thumb">${productMedia(p)}</div>
        <span class="pname">${escapeHtml(r.name||"")}</span>
      </div></td>
      <td><span class="pid">${escapeHtml(r.id)}</span></td>
      <td>${catPill}</td>
      <td><span class="price">¥${r.price}</span></td>
      <td>${tagPill}</td>
      <td><div class="row-actions">
        <button class="btn ghost sm" data-edit="${escapeHtml(r.id)}">编辑</button>
        <button class="btn danger sm" data-del="${escapeHtml(r.id)}">删除</button>
      </div></td>
    </tr>`;
  }

  async function delProduct(id){
    if(!confirm("确定删除该商品？此操作不可撤销。")) return;
    const { error } = await sb.from("products").delete().eq("id", id);
    if(error){ toast("删除失败：" + error.message); return; }
    toast("已删除"); loadProductList();
  }

  /* ---------- 打开弹窗 ---------- */
  function openAdd(){
    editingId = null; currentImageUrl = "";
    $("modal-title").textContent = "新增商品";
    $("f-id").disabled = false;
    setForm({ id:"", cat:"jersey", name:"", description:"", price:699, tag:"", sort:100,
      opts:{style:"stripe",primary:"#b1131a",secondary:"#0a2d5c",textColor:"#ffffff",number:"10",name:"YOU",sponsor:"HYPE"},
      image_url:"" });
    showMask(true);
  }
  function openEdit(r){
    editingId = r.id; currentImageUrl = r.image_url || "";
    $("modal-title").textContent = "编辑商品：" + r.id;
    $("f-id").disabled = true;
    setForm(r);
    showMask(true);
  }

  function setForm(r){
    $("f-id").value = r.id || "";
    $("f-cat").value = r.cat || "jersey";
    $("f-name").value = r.name || "";
    $("f-desc").value = r.description || "";
    $("f-price").value = r.price != null ? r.price : 0;
    $("f-tag").value = r.tag || "";
    $("f-sort").value = r.sort != null ? r.sort : 100;
    $("f-image").value = "";
    $("image-hint").textContent = currentImageUrl ? "当前已有上传图片，选择新文件可替换。" : "留空则前端展示由配色生成的 SVG 图。";
    const o = r.opts || {};
    // 球衣
    $("j-style").value = o.style || "stripe";
    $("j-primary").value = normColor(o.primary, "#b1131a");
    $("j-secondary").value = normColor(o.secondary, "#0a2d5c");
    $("j-textColor").value = normColor(o.textColor, "#ffffff");
    $("j-number").value = o.number || "";
    $("j-pname").value = o.name || "";
    $("j-sponsor").value = o.sponsor || "";
    // 球鞋
    $("s-body").value = normColor(o.body, "#ffffff");
    $("s-sole").value = normColor(o.sole, "#111111");
    $("s-swoosh").value = normColor(o.swoosh, "#b1131a");
    $("s-lace").value = normColor(o.lace, "#111111");
    $("s-name").value = (r.cat==="shoe" ? (o.name||"") : "");
    syncCatUI(); renderPreview();
  }

  function normColor(v, def){
    if(typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v)) return v;
    return def;
  }

  function syncCatUI(){
    const cat = $("f-cat").value;
    $("opts-jersey").style.display = cat==="jersey"?"":"none";
    $("opts-shoe").style.display   = cat==="shoe"?"":"none";
  }

  /* 从表单收集 opts */
  function collectOpts(){
    if($("f-cat").value === "jersey"){
      return { style:$("j-style").value, primary:$("j-primary").value, secondary:$("j-secondary").value,
        textColor:$("j-textColor").value, number:$("j-number").value, name:$("j-pname").value, sponsor:$("j-sponsor").value };
    }
    return { body:$("s-body").value, sole:$("s-sole").value, swoosh:$("s-swoosh").value,
      lace:$("s-lace").value, name:$("s-name").value };
  }

  function renderPreview(){
    const cat = $("f-cat").value;
    const p = { cat, opts:collectOpts(), image_url:currentImageUrl, name:$("f-name").value };
    $("preview").innerHTML = productMedia(p);
  }

  // 表单变化实时预览
  ["f-cat","j-style","j-primary","j-secondary","j-textColor","j-number","j-pname","j-sponsor",
   "s-body","s-sole","s-swoosh","s-lace","s-name"].forEach(id=>{
    $(id).addEventListener("input", ()=>{ syncCatUI(); renderPreview(); });
  });

  /* ---------- 图片上传 ---------- */
  async function uploadImageIfAny(){
    const file = $("f-image").files[0];
    if(!file) return currentImageUrl; // 未选新图，保留原图
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `products/${$("f-id").value || Date.now()}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from(SB_BUCKET).upload(path, file, { upsert:true, cacheControl:"3600" });
    if(error) throw error;
    const { data } = sb.storage.from(SB_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  /* ---------- 保存商品 ---------- */
  $("modal-save").addEventListener("click", async ()=>{
    const id = $("f-id").value.trim();
    if(!id){ toast("请填写商品 ID"); return; }
    const btn = $("modal-save"); btn.disabled = true; btn.textContent = "保存中…";
    try{
      const image_url = await uploadImageIfAny();
      const row = {
        id, cat:$("f-cat").value, name:$("f-name").value.trim(),
        description:$("f-desc").value.trim(), price:parseInt($("f-price").value,10)||0,
        tag:$("f-tag").value.trim(), sort:parseInt($("f-sort").value,10)||100,
        opts:collectOpts(), image_url
      };
      const { error } = await sb.from("products").upsert(row);
      if(error) throw error;
      toast(editingId ? "已更新" : "已新增");
      showMask(false); loadProductList();
    }catch(e){
      toast("保存失败：" + e.message);
    }finally{
      btn.disabled = false; btn.textContent = "保存";
    }
  });

  $("add-product").addEventListener("click", openAdd);
  $("modal-cancel").addEventListener("click", ()=>showMask(false));
  $("mask").addEventListener("click",(e)=>{ if(e.target.id==="mask") showMask(false); });
  function showMask(on){ $("mask").classList.toggle("show", on); }

  /* ================= 文案管理 ================= */
  const CONTENT_LABELS = {
    topbar:"顶部滚动条（支持 <b> 标签）",
    hero_kicker:"首页 Hero 小标题",
    hero_title:"首页 Hero 大标题（支持 <br> 换行）",
    hero_subtitle:"首页 Hero 描述",
    promo_kicker:"定制引导 小标题",
    promo_title:"定制引导 标题",
    promo_text:"定制引导 描述",
    footer_about:"页脚品牌简介"
  };

  async function loadContentFields(){
    const box = $("content-fields");
    const { data, error } = await sb.from("site_content").select("key,value");
    const dbMap = {};
    if(!error) (data||[]).forEach(r=>dbMap[r.key]=r.value);
    const keys = Object.keys(DEFAULT_CONTENT);
    box.innerHTML = keys.map(k=>{
      const val = dbMap[k] != null ? dbMap[k] : DEFAULT_CONTENT[k];
      const label = CONTENT_LABELS[k] || k;
      return `<div class="fld">
        <label>${escapeHtml(label)} <span style="color:#bbb">[${k}]</span></label>
        <textarea data-key="${k}">${escapeHtml(val)}</textarea>
      </div>`;
    }).join("");
  }

  $("save-content").addEventListener("click", async ()=>{
    const btn = $("save-content"); btn.disabled = true; btn.textContent = "保存中…";
    const rows = Array.from(document.querySelectorAll("#content-fields textarea"))
      .map(t=>({ key:t.dataset.key, value:t.value }));
    const { error } = await sb.from("site_content").upsert(rows);
    btn.disabled = false; btn.textContent = "保存文案";
    if(error){ toast("保存失败：" + error.message); return; }
    toast("文案已保存，刷新前端即可看到");
  });

  /* ================= 订单管理 ================= */
  const OLABEL = window.ORDER_LABEL || {pending_payment:"待付款",paid:"待发货",shipped:"已发货",completed:"已完成",cancelled:"已取消"};
  let orderFilter = "all";
  let ordersCache = [];

  document.querySelectorAll("#ord-filter .chip").forEach(c=>c.addEventListener("click",()=>{
    document.querySelectorAll("#ord-filter .chip").forEach(x=>x.classList.remove("on"));
    c.classList.add("on"); orderFilter = c.dataset.f; renderOrders();
  }));

  async function loadOrders(){
    const box = $("order-list");
    const { data, error } = await sb.from("orders").select("*").order("created_at",{ascending:false});
    if(error){ box.innerHTML = `<div class="err">加载失败：${error.message}</div>`; return; }
    ordersCache = data || [];
    $("stat-topay").textContent   = ordersCache.filter(o=>o.status==="paid").length;
    $("stat-shipped").textContent = ordersCache.filter(o=>o.status==="shipped").length;
    $("stat-orders").textContent  = ordersCache.length;
    renderOrders();
  }

  function renderOrders(){
    const box = $("order-list");
    const list = orderFilter==="all" ? ordersCache : ordersCache.filter(o=>o.status===orderFilter);
    if(!list.length){ box.innerHTML = `<div class="empty-state">暂无订单。</div>`; return; }
    box.innerHTML = `<table><thead><tr>
      <th>订单号</th><th>收货人</th><th>金额</th><th>状态</th><th>下单时间</th><th>操作</th>
    </tr></thead><tbody>${list.map(orderRow).join("")}</tbody></table>`;
    box.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>openOrder(b.dataset.view)));
  }

  function orderRow(o){
    return `<tr>
      <td><span class="pid">${escapeHtml(o.order_no)}</span></td>
      <td>${escapeHtml(o.customer_name)}<div style="color:#8a93a6;font-size:12px">${escapeHtml(o.phone)}</div></td>
      <td><span class="price">¥${o.total + o.ship_fee}</span></td>
      <td><span class="pill os-${o.status}">${OLABEL[o.status]||o.status}</span></td>
      <td style="color:#8a93a6">${new Date(o.created_at).toLocaleString()}</td>
      <td><div class="row-actions"><button class="btn ghost sm" data-view="${o.id}">查看/处理</button></div></td>
    </tr>`;
  }

  /* ---------- 订单详情 & 处理 ---------- */
  function openOrder(id){
    const o = ordersCache.find(x=>x.id===id); if(!o) return;
    const items = (o.items||[]).map(it=>`
      <div class="om-item">
        <div class="om-thumb">${it.svg||""}</div>
        <div style="flex:1"><div style="font-weight:600">${escapeHtml(it.title||"")}</div>
          <div style="color:#8a93a6;font-size:12px">${escapeHtml(it.meta||"")} ${it.size?("· 尺码 "+escapeHtml(it.size)):""}</div></div>
        <div>¥${it.price} × ${it.qty}</div>
      </div>`).join("");
    $("om-title").textContent = "订单 " + o.order_no;
    $("om-body").innerHTML = `
      <div class="om-row"><span>状态</span><b><span class="pill os-${o.status}">${OLABEL[o.status]}</span></b></div>
      <div class="om-row"><span>收货人</span><b>${escapeHtml(o.customer_name)} ${escapeHtml(o.phone)}</b></div>
      <div class="om-row"><span>地址</span><b>${escapeHtml(o.address)}</b></div>
      ${o.remark?`<div class="om-row"><span>备注</span><b>${escapeHtml(o.remark)}</b></div>`:""}
      <div class="section-sub">商品</div>${items}
      <div class="om-row" style="margin-top:10px"><span>合计</span><b>¥${o.total + o.ship_fee}（含运费 ¥${o.ship_fee}）</b></div>
      ${o.tracking_no?`<div class="om-row"><span>物流单号</span><b>${escapeHtml(o.tracking_no)}</b></div>`:""}
    `;
    const acts = [];
    if(o.status==="pending_payment") acts.push(`<button class="btn" data-do="paid">确认收款</button>`);
    if(o.status==="paid"){
      acts.push(`<input id="om-track" class="om-track" placeholder="填写物流单号（可空）">`);
      acts.push(`<button class="btn brand" data-do="shipped">确认发货</button>`);
    }
    if(o.status==="shipped") acts.push(`<button class="btn brand" data-do="completed">标记完成</button>`);
    if(o.status==="pending_payment" || o.status==="paid") acts.push(`<button class="btn danger" data-do="cancelled">取消订单</button>`);
    acts.push(`<button class="btn ghost" id="om-close">关闭</button>`);
    $("om-actions").innerHTML = acts.join("");
    $("om-actions").querySelectorAll("[data-do]").forEach(b=>b.addEventListener("click",()=>updateOrder(o.id, b.dataset.do)));
    $("om-close").addEventListener("click",()=>$("order-mask").classList.remove("show"));
    $("order-mask").classList.add("show");
  }
  $("order-mask").addEventListener("click",e=>{ if(e.target.id==="order-mask") $("order-mask").classList.remove("show"); });

  async function updateOrder(id, newStatus){
    const patch = { status:newStatus, updated_at:new Date().toISOString() };
    if(newStatus==="shipped"){ const t=$("om-track"); if(t) patch.tracking_no = t.value.trim(); }
    const { error } = await sb.from("orders").update(patch).eq("id", id);
    if(error){ toast("操作失败：" + error.message); return; }
    toast("已更新");
    $("order-mask").classList.remove("show");
    loadOrders();
  }

<<<<<<< HEAD
  /* ================= 用户反馈 ================= */
  const FB_CAT_CLASS = { "咨询":"fb-ask","售后":"fb-after","投诉":"fb-complain","建议":"fb-suggest","其他":"fb-other" };
  const FB_CAT_COLOR = { "咨询":"#3b6fe0","售后":"#e07b00","投诉":"#e0342b","建议":"#16a34a","其他":"#8a93a6" };
  const FB_CATS = ["咨询","售后","投诉","建议","其他"];
  let fbCache = [];
  let fbFilter = "all";
  let fbSearch = "";

  document.querySelectorAll("#fb-filter .chip").forEach(c=>c.addEventListener("click",()=>{
    document.querySelectorAll("#fb-filter .chip").forEach(x=>x.classList.remove("on"));
    c.classList.add("on"); fbFilter = c.dataset.f; renderFeedback();
  }));
  $("fb-search").addEventListener("input", (e)=>{ fbSearch = e.target.value.trim().toLowerCase(); renderFeedback(); });
  $("fb-refresh").addEventListener("click", loadFeedback);

  async function loadFeedback(){
    const box = $("feedback-list");
    const { data, error } = await sb.from("feedbacks").select("*").order("created_at",{ascending:false}).limit(1000);
    if(error){ box.innerHTML = `<div class="err">加载失败：${error.message}</div>`; return; }
    fbCache = data || [];
    renderFeedbackStats();
    renderTrend();
    renderCats();
    renderFeedback();
  }

  function isToday(ts){
    const d = new Date(ts), n = new Date();
    return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate();
  }

  function renderFeedbackStats(){
    $("fb-total").textContent    = fbCache.length;
    $("fb-today").textContent    = fbCache.filter(f=>isToday(f.created_at)).length;
    $("fb-pending").textContent  = fbCache.filter(f=>f.status==="new").length;
    $("fb-resolved").textContent = fbCache.filter(f=>f.status==="resolved").length;
  }

  function renderTrend(){
    const days = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for(let i=6;i>=0;i--){
      const d = new Date(today); d.setDate(d.getDate()-i);
      days.push({ label:(d.getMonth()+1)+"/"+d.getDate(), start:d.getTime(), end:d.getTime()+86400000, count:0 });
    }
    fbCache.forEach(f=>{
      const t = new Date(f.created_at).getTime();
      const day = days.find(x=>t>=x.start && t<x.end);
      if(day) day.count++;
    });
    const max = Math.max(1, ...days.map(d=>d.count));
    $("fb-trend").innerHTML = days.map(d=>{
      const h = Math.round(d.count/max*140);
      return `<div class="tbar"><div class="v">${d.count}</div>
        <div class="bar" style="height:${Math.max(4,h)}px"></div>
        <div class="d">${d.label}</div></div>`;
    }).join("");
  }

  function renderCats(){
    const counts = {}; FB_CATS.forEach(c=>counts[c]=0);
    fbCache.forEach(f=>{ const c = FB_CATS.includes(f.category)?f.category:"其他"; counts[c]++; });
    const max = Math.max(1, ...FB_CATS.map(c=>counts[c]));
    $("fb-cats").innerHTML = FB_CATS.map(c=>{
      const w = Math.round(counts[c]/max*100);
      return `<div class="cat-row">
        <span class="nm">${c}</span>
        <span class="track"><span class="fill" style="width:${w}%;background:${FB_CAT_COLOR[c]}"></span></span>
        <span class="ct">${counts[c]}</span>
      </div>`;
    }).join("");
  }

  function fbFiltered(){
    let list = fbCache.slice();
    if(fbFilter==="new" || fbFilter==="resolved") list = list.filter(f=>f.status===fbFilter);
    else if(fbFilter==="chat" || fbFilter==="form") list = list.filter(f=>f.source===fbFilter);
    if(fbSearch){
      list = list.filter(f=>
        (f.message||"").toLowerCase().includes(fbSearch) ||
        (f.contact||"").toLowerCase().includes(fbSearch) ||
        (f.name||"").toLowerCase().includes(fbSearch));
    }
    return list;
  }

  function renderFeedback(){
    const box = $("feedback-list");
    const list = fbFiltered();
    if(!list.length){ box.innerHTML = `<div class="empty-state">暂无反馈记录。</div>`; return; }
    box.innerHTML = `<table><thead><tr>
      <th>时间</th><th>来源</th><th>类型</th><th>用户</th><th>内容</th><th>状态</th><th>操作</th>
    </tr></thead><tbody>${list.map(fbRow).join("")}</tbody></table>`;
    box.querySelectorAll("[data-fbview]").forEach(b=>b.addEventListener("click",()=>openFeedback(b.dataset.fbview)));
  }

  function fbRow(f){
    const catCls = FB_CAT_CLASS[f.category] || "fb-other";
    const srcCls = f.source==="form" ? "src-form" : "src-chat";
    const srcTxt = f.source==="form" ? "留言" : "客服";
    const stCls  = f.status==="resolved" ? "st-resolved" : "st-new";
    const stTxt  = f.status==="resolved" ? "已处理" : "待处理";
    const who = escapeHtml(f.name||"") + (f.contact?`<div style="color:#8a93a6;font-size:12px">${escapeHtml(f.contact)}</div>`:"");
    return `<tr>
      <td style="color:#8a93a6;white-space:nowrap">${new Date(f.created_at).toLocaleString()}</td>
      <td><span class="pill ${srcCls}">${srcTxt}</span></td>
      <td><span class="pill ${catCls}">${escapeHtml(f.category||"其他")}</span></td>
      <td>${who || '<span style="color:#c3c8d2">匿名</span>'}</td>
      <td><div class="fb-msg">${escapeHtml(f.message||"")}</div></td>
      <td><span class="pill ${stCls}">${stTxt}</span></td>
      <td><div class="row-actions"><button class="btn ghost sm" data-fbview="${f.id}">查看</button></div></td>
    </tr>`;
  }

  function openFeedback(id){
    const f = fbCache.find(x=>x.id===id); if(!f) return;
    $("fb-title").textContent = "反馈详情";
    $("fb-body").innerHTML = `
      <div class="om-row"><span>时间</span><b>${new Date(f.created_at).toLocaleString()}</b></div>
      <div class="om-row"><span>来源</span><b>${f.source==="form"?"留言反馈":"在线客服"}</b></div>
      <div class="om-row"><span>类型</span><b>${escapeHtml(f.category||"其他")}</b></div>
      <div class="om-row"><span>称呼</span><b>${escapeHtml(f.name||"匿名")}</b></div>
      <div class="om-row"><span>联系</span><b>${escapeHtml(f.contact||"—")}</b></div>
      <div class="section-sub">用户内容</div>
      <div style="background:#f7f8fa;border-radius:10px;padding:12px 14px;font-size:14px;white-space:pre-wrap;line-height:1.6">${escapeHtml(f.message||"")}</div>
      ${f.reply?`<div class="section-sub">当时 AI 回复</div>
        <div style="background:#eef7f0;border-radius:10px;padding:12px 14px;font-size:14px;white-space:pre-wrap;line-height:1.6">${escapeHtml(f.reply)}</div>`:""}
    `;
    const acts = [];
    if(f.status==="new") acts.push(`<button class="btn brand" data-fbdo="resolved">标记已处理</button>`);
    else acts.push(`<button class="btn ghost" data-fbdo="new">恢复待处理</button>`);
    acts.push(`<button class="btn danger" data-fbdo="delete">删除</button>`);
    acts.push(`<button class="btn ghost" id="fb-close">关闭</button>`);
    $("fb-actions").innerHTML = acts.join("");
    $("fb-actions").querySelectorAll("[data-fbdo]").forEach(b=>b.addEventListener("click",()=>fbAction(f.id, b.dataset.fbdo)));
    $("fb-close").addEventListener("click",()=>$("fb-mask").classList.remove("show"));
    $("fb-mask").classList.add("show");
  }
  $("fb-mask").addEventListener("click",e=>{ if(e.target.id==="fb-mask") $("fb-mask").classList.remove("show"); });

  async function fbAction(id, action){
    if(action==="delete"){
      if(!confirm("确定删除该反馈？此操作不可撤销。")) return;
      const { error } = await sb.from("feedbacks").delete().eq("id", id);
      if(error){ toast("删除失败：" + error.message); return; }
      toast("已删除");
    }else{
      const { error } = await sb.from("feedbacks").update({ status:action }).eq("id", id);
      if(error){ toast("操作失败：" + error.message); return; }
      toast(action==="resolved" ? "已标记为已处理" : "已恢复待处理");
    }
    $("fb-mask").classList.remove("show");
    loadFeedback();
  }

  /* ================= 客服知识库 ================= */
  let faqEditingId = null;

  async function loadFaqs(){
    const box = $("faq-list");
    const { data, error } = await sb.from("faqs").select("*").order("sort",{ascending:true});
    if(error){ box.innerHTML = `<div class="err">加载失败：${error.message}</div>`; return; }
    const list = data || [];
    if(!list.length){ box.innerHTML = `<div class="empty-state">还没有问答，点击右上角「+ 新增问答」。</div>`; return; }
    box.innerHTML = `<table><thead><tr>
      <th>触发关键词</th><th>回复内容</th><th>分类</th><th>状态</th><th>排序</th><th>操作</th>
    </tr></thead><tbody>${list.map(faqRow).join("")}</tbody></table>`;
    box.querySelectorAll("[data-faqedit]").forEach(b=>b.addEventListener("click",()=>openFaq(list.find(x=>x.id===b.dataset.faqedit))));
    box.querySelectorAll("[data-faqdel]").forEach(b=>b.addEventListener("click",()=>delFaq(b.dataset.faqdel)));
  }

  function faqRow(r){
    const st = r.enabled ? `<span class="pill st-resolved">启用</span>` : `<span class="pill">停用</span>`;
    return `<tr>
      <td><div class="fb-msg">${escapeHtml(r.keywords||"")}</div></td>
      <td><div class="fb-msg">${escapeHtml(r.answer||"")}</div></td>
      <td><span class="pill fb-ask">${escapeHtml(r.category||"咨询")}</span></td>
      <td>${st}</td>
      <td>${r.sort}</td>
      <td><div class="row-actions">
        <button class="btn ghost sm" data-faqedit="${r.id}">编辑</button>
        <button class="btn danger sm" data-faqdel="${r.id}">删除</button>
      </div></td>
    </tr>`;
  }

  function setFaq(r){
    $("faq-keywords").value = r.keywords || "";
    $("faq-answer").value   = r.answer || "";
    $("faq-category").value = r.category || "咨询";
    $("faq-sort").value     = r.sort != null ? r.sort : 100;
    $("faq-enabled").checked = r.enabled !== false;
  }
  function openFaqAdd(){
    faqEditingId = null;
    $("faq-title").textContent = "新增问答";
    setFaq({ keywords:"", answer:"", category:"咨询", sort:100, enabled:true });
    $("faq-mask").classList.add("show");
  }
  function openFaq(r){
    faqEditingId = r.id;
    $("faq-title").textContent = "编辑问答";
    setFaq(r);
    $("faq-mask").classList.add("show");
  }

  $("add-faq").addEventListener("click", openFaqAdd);
  $("faq-cancel").addEventListener("click", ()=>$("faq-mask").classList.remove("show"));
  $("faq-mask").addEventListener("click", e=>{ if(e.target.id==="faq-mask") $("faq-mask").classList.remove("show"); });

  $("faq-save").addEventListener("click", async ()=>{
    const keywords = $("faq-keywords").value.trim();
    const answer   = $("faq-answer").value.trim();
    if(!keywords){ toast("请填写触发关键词"); return; }
    if(!answer){ toast("请填写回复内容"); return; }
    const btn = $("faq-save"); btn.disabled = true; btn.textContent = "保存中…";
    const row = {
      keywords, answer,
      category: $("faq-category").value,
      sort: parseInt($("faq-sort").value,10) || 100,
      enabled: $("faq-enabled").checked
    };
    let res;
    if(faqEditingId) res = await sb.from("faqs").update(row).eq("id", faqEditingId);
    else            res = await sb.from("faqs").insert(row);
    btn.disabled = false; btn.textContent = "保存";
    if(res.error){ toast("保存失败：" + res.error.message); return; }
    toast(faqEditingId ? "已更新" : "已新增");
    $("faq-mask").classList.remove("show");
    loadFaqs();
  });

  async function delFaq(id){
    if(!confirm("确定删除该问答？删除后前台客服将不再使用此话术。")) return;
    const { error } = await sb.from("faqs").delete().eq("id", id);
    if(error){ toast("删除失败：" + error.message); return; }
    toast("已删除"); loadFaqs();
  }

=======
>>>>>>> ce171bc6f927260ee23722e5b61d3817877f5ad2
  /* ================= 账号管理 ================= */
  async function loadAccounts(){
    const box = $("account-list");
    const { data, error } = await sb.from("profiles")
      .select("id,email,display_name,is_admin,created_at")
      .order("created_at",{ascending:true});
    if(error){ box.innerHTML = `<div class="err">加载失败：${error.message}</div>`; return; }
    if(!data || !data.length){ box.innerHTML = `<div class="empty-state">暂无账号。</div>`; return; }
    box.innerHTML = `<table><thead><tr>
      <th>用户</th><th>邮箱</th><th>身份</th><th>注册时间</th><th>操作</th>
    </tr></thead><tbody>${data.map(accRow).join("")}</tbody></table>`;
    box.querySelectorAll("[data-toggle]").forEach(b=>b.addEventListener("click",()=>toggleAdmin(b.dataset.toggle, b.dataset.to==="1")));
  }

  function accRow(u){
    const isMe = u.id===meId;
    const badge = u.is_admin ? `<span class="pill tag">管理员</span>` : `<span class="pill">普通用户</span>`;
    let action;
    if(isMe){
      action = `<span style="color:#8a93a6;font-size:13px">当前登录账号</span>`;
    }else if(u.is_admin){
      action = `<button class="btn danger sm" data-toggle="${u.id}" data-to="0">取消管理员</button>`;
    }else{
      action = `<button class="btn brand sm" data-toggle="${u.id}" data-to="1">设为管理员</button>`;
    }
    return `<tr>
      <td class="pname">${escapeHtml(u.display_name||"—")}</td>
      <td><span class="pid">${escapeHtml(u.email||"")}</span></td>
      <td>${badge}</td>
      <td style="color:#8a93a6">${u.created_at?new Date(u.created_at).toLocaleString():"—"}</td>
      <td><div class="row-actions">${action}</div></td>
    </tr>`;
  }

  async function toggleAdmin(id, makeAdmin){
    if(!confirm(makeAdmin ? "确定授予该账号管理员权限？" : "确定取消该账号的管理员权限？")) return;
    const { error } = await sb.from("profiles").update({ is_admin: makeAdmin }).eq("id", id);
    if(error){ toast("操作失败：" + error.message); return; }
    toast(makeAdmin ? "已设为管理员" : "已取消管理员");
    loadAccounts();
  }

  $("refresh-accounts").addEventListener("click", loadAccounts);

  /* ================= 启动 ================= */
  (async function init(){
    const session = await requireAuth();
    if(!session) return;
    loadProductList();
    loadContentFields();
    loadOrders();
    loadFeedback();
    loadFaqs();
  })();
})();
