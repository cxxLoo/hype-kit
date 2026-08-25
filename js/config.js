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
