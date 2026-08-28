-- =====================================================================
--  HYPE KIT · 用户头像字段
--  作用：为 profiles 增加 avatar_url，支持用户上传头像
--  依赖：需先执行 accounts.sql
--  用法：Supabase → SQL Editor → New query → 粘贴 → Run
-- =====================================================================

alter table public.profiles add column if not exists avatar_url text not null default '';

-- 说明：本人可更新自己的资料（含 avatar_url / display_name），
-- 该权限已由 accounts.sql 的 "update own profile" 策略覆盖，无需额外策略。
