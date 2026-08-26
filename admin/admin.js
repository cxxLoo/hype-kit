/* ================= 管理后台逻辑 ================= */
(function(){
  "use strict";
  const $ = (id)=>document.getElementById(id);
  let editingId = null;         // 正在编辑的商品 id；null 表示新增
  let currentImageUrl = "";     // 当前商品图片 URL

  /* ---------- 登录校验 ---------- */
  async function requireAuth(){
    const { data:{ session } } = await sb.auth.getSession();
    if(!session){ location.replace("login.html"); return null; }
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
  const SECTIONS = { products:"tab-products", content:"tab-content", orders:"tab-orders" };
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("on"));
    t.classList.add("on");
    const k = t.dataset.tab;
    $("crumb").textContent = t.dataset.crumb || "";
    Object.keys(SECTIONS).forEach(key=>{ $(SECTIONS[key]).style.display = key===k ? "" : "none"; });
    if(k==="orders") loadOrders();
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

  /* ================= 启动 ================= */
  (async function init(){
    const session = await requireAuth();
    if(!session) return;
    loadProductList();
    loadContentFields();
    loadOrders();
  })();
})();
