# Supabase 資料庫與權限設計

TravelAgent 採用 Supabase 作為全端 Backend-as-a-Service (BaaS) 解決方案。我們深入利用了 Supabase 的 Auth、PostgreSQL 資料庫，以及最核心的 Row Level Security (RLS) 來實作 B2B 等級的安全防護。

## 🗄️ 核心資料表 (Database Schema)

所有資料表的變更歷程都記錄在 `travelagent/supabase/migrations/` 目錄下。以下為核心資料表概覽：

1.  **`users` (使用者)**
    *   **用途**：擴充 Supabase 內建 `auth.users` 的設定，主要用來儲存使用者的角色與額外設定。
    *   **核心欄位**：`id` (關聯 auth.users), `role` (角色：user, admin, agent), `name`。
2.  **`requirements` (旅遊需求單)**
    *   **用途**：儲存顧問填寫或從 PDF/文字匯入的初始需求。
    *   **核心欄位**：`user_id`, `origin`, `destinations` (陣列), `travel_dates` (JSON), `travelers` (JSON), `budget_range`, `preferences` (JSON), `notes`。
3.  **`itineraries` (生成的行程)**
    *   **用途**：儲存由 AI 生成的最終結構化行程。
    *   **核心欄位**：`requirement_id` (關聯需求單), `content` (存放完整天數與活動的 JSON 結構), `user_id`。
4.  **`user_favorites` (私房最愛名單)**
    *   **用途**：讓每位顧問建立專屬的口袋名單 (景點、餐廳、住宿)，供未來 AI 規劃時優先取用。
    *   **核心欄位**：`user_id`, `type` (spot/food/accommodation), `name`, `description`, `tags` (陣列), `location_data` (存放 Google Places 解析結果)。
5.  **`ai_audit_logs` (AI 操作稽核紀錄)**
    *   **用途**：紀錄每次呼叫 Gemini AI 的耗時、Token 用量與原始請求/回應，便於除錯與成本分析。
    *   **核心欄位**：`user_id`, `action_type`, `prompt_tokens`, `completion_tokens`, `duration_ms`。
6.  **`place_cache` (地點快取)**
    *   **用途**：快取 Google Places API 的查詢結果，減少重複呼叫的成本，TTL 預設為 7 天。

---

## 🔐 認證與權限控管 (Auth & RLS)

本系統採 **「私人邀請制」**，也就是**關閉了公開註冊功能**。
所有的新帳號都必須由 `admin` (管理員) 透過後台產生邀請連結發送給使用者，使用者才能設定密碼並開通帳號。

### Row Level Security (RLS) 政策
我們對每一張資料表都啟用了 RLS，確保「自己的資料只有自己能看」。

以 `requirements` 表為例，其 RLS 規則為：
*   **SELECT / UPDATE / DELETE**: `auth.uid() = user_id` (只能操作屬於自己的資料)
*   **INSERT**: 只能寫入 `user_id` 為自己的紀錄。

### 角色管理 (RBAC)
我們透過自訂的 Postgres Function (`get_my_role()`) 與 `users` 表結合，實作了基於角色的存取控制 (Role-Based Access Control)：
1.  **`admin` (管理員)**：可以存取全站資料，並有權限操作邀請功能與查閱 `ai_audit_logs`。
2.  **`user` (一般顧問)**：預設角色，僅能存取與操作自己建立的需求、行程與最愛名單。
3.  **`agent` (系統服務)**：系統內部保留角色，擁有部分跨用戶寫入的權限。

### 伺服器端的權限例外 (Service Role)
在 Next.js 的 Server Actions 中，若遇到需要跨越 RLS 限制的操作（例如：Admin 產生新的邀請連結並寫入資料庫，或是 AI Agent 記錄 Audit Log 時），我們會使用 `SUPABASE_SERVICE_ROLE_KEY` 建立一個具備超級管理員權限的 Client 進行操作。**此金鑰絕對禁止在前端元件中使用**。