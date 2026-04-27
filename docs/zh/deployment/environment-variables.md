# 環境變數說明

本系統依賴多個外部服務 (Supabase, Google Gemini, Google Places)，因此正確設定環境變數是系統能正常運作的關鍵。

專案中提供了一份 `.env.example` 檔案，在本地開發時，請將其複製並重新命名為 `.env.local`。**切記絕對不要將 `.env.local` 提交 (Commit) 到版控系統中**。

以下是各項環境變數的詳細說明：

## 🗄️ Supabase 設定 (資料庫與身分驗證)
用於讓前端與伺服器端能夠存取您的 Supabase 專案。

*   `NEXT_PUBLIC_SUPABASE_URL`
    *   **說明**: 您的 Supabase 專案網址。
    *   **取得方式**: Supabase Dashboard -> Project Settings -> API -> Project URL。
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   **說明**: 專案的公開 API 金鑰，用於客戶端 (瀏覽器) 呼叫。受限於 Row Level Security (RLS) 的保護。
    *   **取得方式**: Supabase Dashboard -> Project Settings -> API -> Project API Keys (anon public)。
*   `SUPABASE_SERVICE_ROLE_KEY`
    *   **說明**: 具有繞過 RLS 超級權限的私密金鑰，僅限在伺服器端 (Server Actions / API Routes) 使用。**絕對不可外洩**。
    *   **取得方式**: Supabase Dashboard -> Project Settings -> API -> Project API Keys (service_role secret)。

## 🧠 AI 與地圖服務設定
用於生成行程與查詢實際地點資訊。

*   `GEMINI_API_KEY`
    *   **說明**: 主應用程式呼叫 Google Gemini 模型所使用的 API 金鑰。
    *   **取得方式**: [Google AI Studio](https://aistudio.google.com/app/apikey)。
*   `GOOGLE_GENERATIVE_AI_API_KEY`
    *   **說明**: 部分內部腳本或舊版相容性所使用的 API 金鑰（通常與 `GEMINI_API_KEY` 填入相同的值即可）。
*   `GEMINI_PRIMARY_MODEL`
    *   **說明**: 系統預設調用的主要模型。
    *   **預設值**: `gemini-3-flash-preview` 或 `gemini-2.5-flash`。
*   `GEMINI_FALLBACK_MODEL`
    *   **說明**: 當主模型過載或發生錯誤時的降級備用模型。
    *   **預設值**: `gemini-2.5-flash`。
*   `GOOGLE_PLACES_API_KEY`
    *   **說明**: 用於在路線規劃與行程生成時，驗證景點真實性與抓取營業時間、經緯度等資訊的 Google Maps API 金鑰。
    *   **取得方式**: Google Cloud Console -> 啟用 Places API (New) 並建立憑證。

## ⚙️ 應用程式設定
*   `NEXT_PUBLIC_SITE_URL`
    *   **說明**: 網站的主網址。用於 Email 邀請連結、登入跳轉等。
    *   **預設值**: 本地開發時填 `http://localhost:3000`。正式上線時請填寫您的實際網域（如 `https://travelagent.yourdomain.com`）。