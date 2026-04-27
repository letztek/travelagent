# Next.js 核心邏輯與架構

本系統前端與後端採用 **Next.js (App Router)** 框架統一構建，利用最新的 React 功能（如 Server Components 與 Server Actions）來實現高效且安全的人機協作循環。

## 🗂️ 專案結構概覽 (App Router)

專案主要位於 `travelagent/app/` 目錄下：

*   `/app/(auth)` 或 `/app/login`: 登入與註冊相關頁面。
*   `/app/admin`: 系統管理員的專屬介面（邀請碼產生、Audit Logs 檢視）。
*   `/app/requirements`: 旅遊需求收集模組。
    *   `/new`: 新增需求（支援手動與上傳檔案匯入）。
    *   `/[id]/gap`: AI 需求診斷（Gap Wizard）介面。
    *   `/[id]/route`: 路線編輯與預覽頁面。
*   `/app/itineraries`: 最終生成的詳細行程清單與預覽編輯器。
*   `/app/favorites`: 顧問個人的私房最愛名單管理。

## ⚡ Server Actions 與資料流

為提升效能與安全性，系統大量使用 **Server Actions** (`"use server"`) 來處理與 Supabase 或 AI 模型的通訊，而非傳統的 API Routes。

### 大型檔案匯入的特殊處理 (`FormData`)
在 `/app/requirements/new/components/ImportWizard.tsx` 中，使用者可以上傳 PDF、圖片等檔案進行行程匯入。
**技術挑戰**：Next.js 在傳遞資料給 Server Action 時，對於大型的巢狀物件或 Base64 檔案經常會觸發序列化限制（產生 `"Only plain objects..."` 或大小限制錯誤）。
**解決方案**：我們在前端先將檔案轉為 Base64，再透過原生的 `FormData` API 打包傳送至 `parseImportData` Action，並在 Server 端手動解開。這個模式完美規避了 RSC (React Server Components) 的深度序列化問題。

## 🛡️ 資料驗證 (Zod Schema)
所有的資料結構（不論是前後端傳遞，或是 AI 生成的 JSON 回應）皆需通過 `Zod` 的嚴格檢驗。這確保了系統各處拿到的資料型別 (Types) 都是安全且一致的。

 Schema 定義統一放置於 `travelagent/schemas/` 目錄下：
*   `requirement.ts`: 定義旅遊需求單的格式。
*   `route.ts`: 定義 AI 規劃的路線結構 (Node & Edge)。
*   `itinerary.ts`: 定義最終產出的每日詳細行程與活動格式。
*   `gap-analysis.ts`: 定義 AI 診斷後回傳的缺失資訊與邏輯問題格式。