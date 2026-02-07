# Specification: 使用者認證與授權 (US-703)

## 概述
本 Track 旨在實作完整的安全認證體系，基於 Supabase Auth 與 Next.js App Router 架構。實作內容包含伺服器端 Session 管理、路由保護、資料隔離 (RLS) 以及使用者個人檔案同步。

## 業務需求 (US-703)
1.  **註冊流程 (Signup)**:
    *   欄位：Email, Password, Display Name (顯示名稱)。
    *   行為：註冊成功後自動在 `public.profiles` 建立對應資料。
2.  **登入/登出 (Login/Logout)**:
    *   支援 Email/Password 登入。
    *   登入後跳轉至 `/requirements`。
3.  **路由保護 (Route Protection)**:
    *   使用 Middleware 攔截 `/requirements` 與 `/itineraries`。
    *   未登入使用者強制導向 `/login`。
4.  **資料隔離 (Data Isolation)**:
    *   每個 `Requirement` 與 `Itinerary` 必須歸屬於特定 `user_id`。
    *   實作資料庫 RLS (Row Level Security)，確保使用者只能存取自己的資料。

## 技術規範
-   **認證工具**: `@supabase/ssr` (取代舊版 Auth Helpers)。
-   **Middleware**: 在 `middleware.ts` 實作 Session 更新與重導向邏輯。
-   **資料庫架構**:
    -   `public.profiles`: 儲存 `id` (PK, 指向 auth.users), `display_name`, `updated_at`。
    -   **Trigger**: 設定 PostgreSQL Trigger，當 `auth.users` 插入新行時，自動同步至 `public.profiles`。
    -   **Migrations**: 
        -   為 `requirements` 新增 `user_id` 欄位。
        -   為 `itineraries` 新增 `user_id` 欄位。
-   **UI 元件**:
    -   使用 Shadcn UI 實作 Login/Signup 表單。
    -   在 Header 新增使用者資訊與登出按鈕。

## 驗收標準
1.  使用者能成功註冊並設定「顯示名稱」。
2.  未登入時訪問 `/requirements` 會自動跳轉至 `/login`。
3.  使用者 A 登入後，無法透過直接修改網址 id 看到使用者 B 的需求單或行程 (由 RLS 保障)。
4.  資料庫中的密碼以加密雜湊值儲存，絕無明碼。
