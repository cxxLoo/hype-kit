/* ================= HYPE KIT · 智能客服悬浮窗 =================
 * 全站悬浮的会动小智能体，点击展开对话框，接入 HypeBot 知识库。
 * 纯前端、零依赖、永不报错。若页面未引入 chat.js 也能用内置兜底话术。
 * ============================================================ */
(function(){
  "use strict";
  if(window.__hkWidget) return;      // 防止重复初始化
  window.__hkWidget = true;

  function esc(s){
    if(window.escapeHtml) return window.escapeHtml(s);
    return String(s==null?"":s).replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  }

  // 兜底 Bot（页面未引入 chat.js 时）
  const Bot = window.HypeBot || {
    greeting(){ return "您好呀，欢迎来到 HYPE KIT～😊 我是您的智能助手，关于商品、尺码、配送、支付、退换货都可以问我。"; },
    suggestions: ["有哪些尺码？","多久发货？包邮吗？","支持退换货吗？","怎么下单支付？"],
    answer(t){ return { text:"这个问题我记录下来啦～您也可以到「客服中心」页面留言，我们会尽快回复您😊", category:"咨询" }; },
    loadFAQs(){ return Promise.resolve(); }
  };

  const ROBOT = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="hkw-den" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f6fb0"/><stop offset="1" stop-color="#284b82"/></linearGradient></defs>
    <line x1="32" y1="7" x2="32" y2="15" stroke="#dfe7f5" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="32" cy="6" r="3" fill="#8fd0ff"/>
    <rect x="12" y="15" width="40" height="34" rx="12" fill="url(#hkw-den)" stroke="#f1a765" stroke-width="1.4" stroke-dasharray="3 2"/>
    <rect x="18" y="22" width="28" height="18" rx="8" fill="#0e1c33"/>
    <circle class="hkw-eye" cx="26" cy="31" r="3.4" fill="#8fd0ff"/>
    <circle class="hkw-eye" cx="38" cy="31" r="3.4" fill="#8fd0ff"/>
    <path d="M27 36 Q32 40 37 36" stroke="#8fd0ff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="6" y="27" width="6" height="12" rx="3" fill="#dfe7f5"/>
    <rect x="52" y="27" width="6" height="12" rx="3" fill="#dfe7f5"/>
  </svg>`;

  const style = document.createElement("style");
  style.textContent = `
  .hkw-fab{position:fixed;right:22px;bottom:22px;z-index:1300;width:64px;height:64px;border-radius:50%;
    border:none;cursor:pointer;background:linear-gradient(150deg,#3f6fb0,#22406f);box-shadow:0 10px 26px rgba(20,45,90,.45);
    display:flex;align-items:center;justify-content:center;animation:hkw-bob 2.6s ease-in-out infinite;transition:transform .18s}
  .hkw-fab:hover{transform:scale(1.08)}
  .hkw-fab svg{width:42px;height:42px}
  .hkw-fab::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(63,111,176,.5);
    animation:hkw-ring 2.2s ease-out infinite}
  .hkw-eye{animation:hkw-blink 3.4s infinite}
  @keyframes hkw-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes hkw-ring{0%{transform:scale(.85);opacity:.7}100%{transform:scale(1.35);opacity:0}}
  @keyframes hkw-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}
  .hkw-fab .hkw-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;
    background:#22c55e;border:2px solid #fff}
  .hkw-tip{position:fixed;right:96px;bottom:40px;z-index:1300;background:#fff;color:#111;font-size:13px;
    padding:10px 14px;border-radius:14px 14px 2px 14px;box-shadow:0 8px 24px rgba(0,0,0,.16);max-width:200px;
    opacity:0;transform:translateY(8px);transition:.25s;pointer-events:none}
  .hkw-tip.show{opacity:1;transform:translateY(0)}
  .hkw-panel{position:fixed;right:22px;bottom:98px;z-index:1300;width:360px;max-width:calc(100vw - 32px);
    height:520px;max-height:calc(100vh - 130px);background:#fff;border-radius:18px;overflow:hidden;
    box-shadow:0 24px 60px rgba(0,0,0,.28);display:none;flex-direction:column;transform-origin:bottom right}
  .hkw-panel.show{display:flex;animation:hkw-in .22s ease}
  @keyframes hkw-in{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .hkw-head{background:linear-gradient(135deg,#2e5c8a,#22406f);color:#fff;padding:15px 16px;display:flex;align-items:center;gap:11px}
  .hkw-head .av{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
  .hkw-head .av svg{width:30px;height:30px}
  .hkw-head .info b{display:block;font-size:15px;font-weight:700}
  .hkw-head .info span{font-size:12px;opacity:.9;display:flex;align-items:center;gap:5px}
  .hkw-head .info i{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block}
  .hkw-head .x{margin-left:auto;background:none;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer;opacity:.85;width:30px;height:30px}
  .hkw-head .x:hover{opacity:1}
  .hkw-body{flex:1;overflow-y:auto;padding:16px;background:#f6f8fb;display:flex;flex-direction:column;gap:12px}
  .hkw-row{display:flex;gap:8px;align-items:flex-end;max-width:86%}
  .hkw-row.me{margin-left:auto;flex-direction:row-reverse}
  .hkw-mini{width:28px;height:28px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:15px;background:#e6edf7}
  .hkw-row.me .hkw-mini{background:#111;color:#fff}
  .hkw-bubble{background:#fff;border-radius:14px;padding:10px 13px;font-size:14px;line-height:1.6;color:#222;
    box-shadow:0 2px 8px rgba(0,0,0,.05);white-space:pre-wrap;word-break:break-word}
  .hkw-row.me .hkw-bubble{background:#111;color:#fff}
  .hkw-typing{display:flex;gap:4px;padding:13px}
  .hkw-typing span{width:7px;height:7px;border-radius:50%;background:#b9c2d0;animation:hkw-ty 1s infinite}
  .hkw-typing span:nth-child(2){animation-delay:.15s}
  .hkw-typing span:nth-child(3){animation-delay:.3s}
  @keyframes hkw-ty{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  .hkw-quick{display:flex;gap:7px;flex-wrap:wrap;padding:10px 12px;border-top:1px solid #eef1f5;background:#fff}
  .hkw-chip{border:1px solid #d7dde8;background:#fff;border-radius:16px;padding:6px 12px;font-size:12.5px;color:#33517d;cursor:pointer;transition:.12s}
  .hkw-chip:hover{background:#eef3fb;border-color:#9db6dd}
  .hkw-input{display:flex;gap:8px;padding:12px;border-top:1px solid #eef1f5;background:#fff}
  .hkw-input input{flex:1;border:1px solid #d7dde8;border-radius:22px;padding:11px 15px;font-size:14px;outline:none;font-family:inherit}
  .hkw-input input:focus{border-color:#2e5c8a}
  .hkw-input button{flex:0 0 auto;background:#2e5c8a;color:#fff;border:none;border-radius:22px;padding:0 18px;font-size:14px;font-weight:600;cursor:pointer}
  .hkw-input button:disabled{opacity:.5;cursor:not-allowed}
  html.senior .hkw-bubble,html.senior .hkw-input input{font-size:16px}
  html.senior .hkw-panel{width:400px;height:560px}
  @media(max-width:480px){
    .hkw-panel{right:12px;left:12px;width:auto;bottom:90px}
    .hkw-fab{right:16px;bottom:16px}
    .hkw-tip{display:none}
  }`;

  function mount(){
    if(document.querySelector(".hkw-fab")) return;
    document.head.appendChild(style);

    const fab = document.createElement("button");
    fab.className = "hkw-fab";
    fab.type = "button";
    fab.setAttribute("aria-label","智能客服");
    fab.innerHTML = ROBOT + `<span class="hkw-dot"></span>`;

    const tip = document.createElement("div");
    tip.className = "hkw-tip";
    tip.textContent = "有问题？点我问问～";

    const panel = document.createElement("div");
    panel.className = "hkw-panel";
    panel.innerHTML = `
      <div class="hkw-head">
        <span class="av">${ROBOT}</span>
        <div class="info"><b>HYPE 智能客服</b><span><i></i> 在线 · 秒回</span></div>
        <button class="x" type="button" aria-label="关闭">&times;</button>
      </div>
      <div class="hkw-body" id="hkw-body"></div>
      <div class="hkw-quick" id="hkw-quick"></div>
      <form class="hkw-input" id="hkw-form">
        <input id="hkw-text" autocomplete="off" placeholder="输入您的问题…">
        <button type="submit" id="hkw-send">发送</button>
      </form>`;

    document.body.appendChild(fab);
    document.body.appendChild(tip);
    document.body.appendChild(panel);

    const body = panel.querySelector("#hkw-body");
    const input = panel.querySelector("#hkw-text");
    const sendBtn = panel.querySelector("#hkw-send");
    const quick = panel.querySelector("#hkw-quick");
    const SESSION = "w_" + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    let opened = false, greeted = false;

    function now(){ return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
    function addMsg(text, who){
      const row = document.createElement("div");
      row.className = "hkw-row " + (who==="me" ? "me" : "bot");
      const mini = who==="me" ? "🙂" : "🤖";
      row.innerHTML = `<div class="hkw-mini">${mini}</div><div class="hkw-bubble">${esc(text).replace(/\n/g,"<br>")}</div>`;
      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
    }
    function showTyping(){
      const row = document.createElement("div");
      row.className = "hkw-row bot"; row.id = "hkw-typing";
      row.innerHTML = `<div class="hkw-mini">🤖</div><div class="hkw-bubble hkw-typing"><span></span><span></span><span></span></div>`;
      body.appendChild(row); body.scrollTop = body.scrollHeight;
    }
    function hideTyping(){ const t = panel.querySelector("#hkw-typing"); if(t) t.remove(); }

    async function logFeedback(row){
      try{ if(window.sb){ const { error } = await sb.from("feedbacks").insert(row); if(error) console.warn("[widget] 记录失败", error.message); } }catch(e){}
    }

    async function handleUser(text){
      text = (text||"").trim();
      if(!text) return;
      addMsg(text, "me");
      input.value = "";
      sendBtn.disabled = true;
      showTyping();
      let res;
      try{ res = Bot.answer(text); }catch(e){ res = { text:"抱歉，我这边出了点小状况，请稍后再试～", category:"其他" }; }
      await new Promise(r=>setTimeout(r, 450 + Math.random()*450));
      hideTyping();
      addMsg(res.text, "bot");
      sendBtn.disabled = false;
      input.focus();
      logFeedback({ message:text, reply:res.text, category:res.category||"咨询", source:"chat", session_id:SESSION });
    }

    function renderQuick(){
      const sugs = (Bot.suggestions || []).slice(0,5);
      quick.innerHTML = sugs.map(s=>`<button type="button" class="hkw-chip">${esc(s)}</button>`).join("");
      quick.querySelectorAll(".hkw-chip").forEach(c=>c.addEventListener("click",()=>handleUser(c.textContent)));
    }

    async function openPanel(){
      panel.classList.add("show");
      tip.classList.remove("show");
      fab.style.display = "none";
      if(!opened){
        opened = true;
        try{ if(Bot.loadFAQs) await Bot.loadFAQs(); }catch(e){}
        renderQuick();
      }
      if(!greeted){ greeted = true; addMsg(Bot.greeting(), "bot"); }
      setTimeout(()=>input.focus(), 120);
    }
    function closePanel(){ panel.classList.remove("show"); fab.style.display = "flex"; }

    fab.addEventListener("click", openPanel);
    panel.querySelector(".x").addEventListener("click", closePanel);
    panel.querySelector("#hkw-form").addEventListener("submit", e=>{ e.preventDefault(); handleUser(input.value); });

    // 首次进入几秒后弹出小气泡吸引点击
    setTimeout(()=>{ if(!panel.classList.contains("show")) tip.classList.add("show"); }, 2600);
    setTimeout(()=>{ tip.classList.remove("show"); }, 9000);
    tip.addEventListener("click", openPanel);
  }

  if(document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
