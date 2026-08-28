/* ================= Supabase 配置 =================
 * 把下面两个值换成你自己 Supabase 项目里的值：
 *   Project Settings → API → Project URL / anon public key
 * anon key 是「公开密钥」，可以安全地放在前端代码里，
 * 真正的数据安全由数据库 RLS 策略保护（见 supabase/schema.sql）。
 * ================================================= */
window.SUPABASE_URL = "https://wfiwveummxixqvyjdymb.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmaXd2ZXVtbXhpeHF2eWpkeW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTY1MTMsImV4cCI6MjEwMjg3MjUxM30.cN4yu-Zkdwf07VR6UlMMZ_A8X5401opsjDijdefhpRw";

// 依赖页面里先通过 CDN 引入 @supabase/supabase-js（UMD），全局名为 supabase
// 只取协议+域名，自动去掉误粘的路径或结尾斜杠（避免 Invalid path 报错）
window.SUPABASE_URL = window.SUPABASE_URL.replace(/\/+$/, "").replace(/(\.supabase\.co).*/, "$1");
window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// 上传图片用的 Storage 桶名（需在 Supabase 里创建，见部署教程）
window.SB_BUCKET = "assets";

/* ===== 预留：生成式 AI 试穿接口（第二期）=====
 * 留空 = 使用前端合成试穿（默认，零成本）。
 * 接入真·AI 试穿时：部署一个 Supabase Edge Function 代理第三方 AI 模型（把 API Key 藏在函数里），
 * 然后把它的 URL 填到这里即可自动启用，例如：
 *   window.AI_TRYON_ENDPOINT = "https://<项目>.functions.supabase.co/ai-tryon";
 * 该函数约定：POST { photo, product } → 返回 { image: "<结果图 dataURL 或 https 链接>" }
 */
window.AI_TRYON_ENDPOINT = "";
