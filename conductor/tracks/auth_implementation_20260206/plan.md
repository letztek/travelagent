# Implementation Plan: 使用者認證與授權 (US-703)

## Phase 1: Database & SSR Setup
- [x] Task: Install and Config @supabase/ssr (fd6e3ed)
    - [x] 安裝 `@supabase/ssr` 並移除舊版不需要的套件。
    - [x] 實作 `lib/supabase/server.ts` 與 `lib/supabase/client.ts` 輔助函數。
- [ ] Task: Database Schema & Migrations
    - [ ] 建立 `public.profiles` 資料表。
    - [ ] 實作 Database Trigger 同步帳號至個人檔案。
    - [ ] 執行 Migration：為 `requirements` 與 `itineraries` 新增 `user_id` 欄位並設定 FK。
- [ ] Task: Apply RLS Policies
    - [ ] 為所有表 (Profiles, Requirements, Itineraries) 開啟 RLS。
    - [ ] 設定 `auth.uid() = user_id` 的存取政策。
- [ ] Task: Conductor - User Manual Verification 'DB & Setup'

## Phase 2: Auth Logic & Middleware
- [ ] Task: Implement Middleware Protection
    - [ ] 建立 `middleware.ts` 攔截受保護路徑。
    - [ ] 實作 Session 更新機制。
- [ ] Task: Auth Server Actions
    - [ ] 實作 `signIn`, `signUp`, `signOut` 的 Server Actions。
    - [ ] 在 `signUp` 中處理 `display_name` 的 metadata 寫入。
- [ ] Task: Conductor - User Manual Verification 'Auth Logic'

## Phase 3: UI Implementation
- [ ] Task: Create Login & Signup Pages
    - [ ] 使用 Shadcn 實作美觀的登入與註冊頁面。
    - [ ] 實作表單驗證 (Zod)。
- [ ] Task: Global User UI Components
    - [ ] 在 Header 顯示當前使用者名稱。
    - [ ] 實作登出按鈕。
- [ ] Task: Conductor - User Manual Verification 'UI & E2E'

## Phase 4: Final Verification
- [ ] Task: Conductor - User Manual Verification 'Auth System'
