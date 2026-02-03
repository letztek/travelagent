# 技術堆疊 (Technology Stack)

## 前端與應用框架 (Frontend & Application Framework)
- **框架：** Next.js (App Router)
  - *原由：* 統一前後端邏輯，簡化「人機協作」循環與部署流程。
- **語言：** TypeScript
  - *原由：* 對於維持全站型別安全至關重要，特別是前端、資料庫與 AI 回應之間共享的資料模型。
- **樣式：** Tailwind CSS
  - *原由：* 結合 `ui-ux-pro-max` 指南，能快速開發具備專業視覺效果的 UI。
- **互動庫：** @dnd-kit
  - *原由：* 提供現代化且無障礙的 Drag & Drop 體驗，用於路線編輯器。

## 後端與資料 (Backend & Data)
- **資料庫：** Supabase (PostgreSQL)
  - *原由：* 提供強大的關聯式資料庫並支援 JSONB，非常適合儲存結構化的行程資料與使用者設定。
- **儲存：** Supabase Storage
  - *原由：* 用於管理產出的資產或上傳的參考文件。

## AI 與邏輯 (AI & Logic)
- **AI 整合：** Google Gemini SDK (支援 Structured Output)
- **結構驗證：** Zod
  - *原由：* **關鍵技術需求。** 用於對 AI 輸出進行執行期驗證，確保在應用程式處理前，AI 回傳的內容嚴格符合預定義的 JSON Schema。
- **文件生成：** docx.js
  - *原由：* 在用戶端生成 Word 文件，實現即時下載，無需沈重的伺服器端處理。

## AI 輸出完整性策略 (AI Output Integrity Strategy)
- **防護軌道 (Guardrails)：** 自定義 Skills 與系統提示 (System Prompts)。
- **驗證層：** 所有 AI 生成的 JSON（例如：行程表）都必須通過 Zod Schema 驗證。驗證失敗時需觸發重試或降級 (Fallback) 機制。
