# Implementation Plan: US-604 AI 韌性與日誌系統整合

本計畫旨在實作 AI 自動重試機制與混合式日誌系統，包含資料庫 schema 建立、核心工具開發、以及 UI 整合。

## Phase 1: 基礎設施建立 (Infrastructure)
本階段目標是準備好日誌儲存空間與核心類別。

- [x] Task: 建立 Supabase `ai_audit_logs` 資料表 e75bbe8
    - [ ] 撰寫 SQL 遷移檔案，建立包含 `id`, `user_id`, `prompt`, `response`, `model`, `duration_ms`, `error_code`, `created_at` 的資料表
    - [ ] 執行遷移並驗證資料表結構
- [x] Task: 實作核心 `Logger` 工具 f22ead6
    - [ ] 建立 `travelagent/lib/utils/logger.ts`
    - [ ] 支援 `info`, `warn`, `error`, `debug` 級別，區分開發與生產環境輸出
- [ ] Task: 實作 `ai_audit` 資料庫記錄邏輯
    - [ ] 在 `travelagent/lib/supabase/audit.ts` 建立非阻塞的日誌寫入函數
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 基礎設施建立' (Protocol in workflow.md)

## Phase 2: AI 韌性核心 (Resilience Core)
本階段實作自動重試邏輯。

- [ ] Task: 建立 `withRetry` 高階函數
    - [ ] 建立 `travelagent/lib/utils/ai-retry.ts`
    - [ ] 實作指數退避 (Exponential Backoff) 邏輯
    - [ ] 針對 503, 429 等特定錯誤代碼進行重試判斷
- [ ] Task: 撰寫 `withRetry` 單元測試
    - [ ] 模擬 API 失敗與成功場景，驗證重試次數與延遲時間
- [ ] Task: Conductor - User Manual Verification 'Phase 2: AI 韌性核心' (Protocol in workflow.md)

## Phase 3: 系統整合 (Integration)
將重試與日誌邏輯整合進現有的 AI Skills。

- [ ] Task: 整合 `itinerary-generator` Skill
    - [ ] 加入 `withRetry` 包裝 AI 呼叫
    - [ ] 加入 `ai_audit` 紀錄每次生成內容與耗時
- [ ] Task: 整合 `gap-analyzer` 與其他 AI Skills
    - [ ] 統一所有 AI 呼叫點的重試與日誌邏輯
- [ ] Task: 驗證整合後的系統行為
    - [ ] 確保現有功能在正常情況下不受影響，且日誌能正確寫入 Supabase
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 系統整合' (Protocol in workflow.md)

## Phase 4: UI 強化 (UI Enhancements)
實作手動重試與重新產生功能。

- [ ] Task: 建立通用的 `AIErrorFallback` 元件
    - [ ] 當 AI 發生最終失敗時，顯示友善訊息與「重試」按鈕
- [ ] Task: 在行程編輯器加入「重新產生」功能
    - [ ] 允許使用者針對特定天數或整個行程要求 AI 重新規劃
- [ ] Task: 串接前端重試邏輯至 Server Actions
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI 強化' (Protocol in workflow.md)
