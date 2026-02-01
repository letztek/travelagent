# Specification: 實作 AI 結構化行程生成 (US-104)

## 概述
本 Track 的目標是實作系統的核心生成邏輯：根據已儲存的客戶需求，透過 AI (Gemini/OpenAI) 產生結構化的每日行程，並將其儲存在資料庫中供後續編輯與匯出。

## 業務需求 (US-104)
- **觸發機制**：使用者在需求列表頁點擊「生成行程」。
- **AI 處理**：
  - 讀取資料庫中的 Requirement JSON。
  - 使用精心設計的 Prompt 調用 LLM。
  - AI 必須回傳符合特定 JSON Schema 的行程資料。
- **行程結構**：
  - 每日資訊 (Date, Day Count)
  - 時段資訊 (Morning, Afternoon, Evening)
  - 活動名稱與簡短說明 (Activity, Description)
  - 飲食建議 (Breakfast, Lunch, Dinner)
  - 住宿建議 (Accommodation)
- **地理邏輯**：行程需符合基本的地理流向（不走回頭路）。

## 技術規範
- **AI SDK**: Google Generative AI SDK (Gemini) 或 OpenAI SDK。
- **後端**: Next.js Server Actions。
- **AI 輸出控制**: 使用自定義 Skill (透過 `skill-creator` 建立) 來封裝 Prompt 邏輯並強制執行 JSON Schema 驗證，確保 AI 回應嚴格遵守資料欄位要求。
- **驗證**: 使用 Zod 驗證 AI 回傳的 JSON 結構。
- **資料庫**: Supabase `itineraries` 資料表。

## 資料模型 (Schema 草案)
- **Itineraries 表**:
  - `id`: uuid (PK)
  - `requirement_id`: uuid (FK to requirements)
  - `content`: jsonb (儲存完整的每日行程 JSON)
  - `created_at`: timestamp
