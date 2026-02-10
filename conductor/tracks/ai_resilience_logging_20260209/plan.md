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
- [x] Task: 實作 `ai_audit` 資料庫記錄邏輯 12ac3e0
    - [ ] 在 `travelagent/lib/supabase/audit.ts` 建立非阻塞的日誌寫入函數
- [x] Task: Conductor - User Manual Verification 'Phase 1: 基礎設施建立' (Protocol in workflow.md)

## Phase 2: AI 韌性核心 (Resilience Core)
本階段實作自動重試邏輯。

- [x] Task: 建立 `withRetry` 高階函數 5f118b2
    - [x] 建立 `travelagent/lib/utils/ai-retry.ts`
    - [x] 實作指數退避 (Exponential Backoff) 邏輯
    - [x] 針對 503, 429 等特定錯誤代碼進行重試判斷
- [x] Task: 撰寫 `withRetry` 單元測試 5f118b2
    - [x] 模擬 API 失敗與成功場景，驗證重試次數與延遲時間
- [x] Task: Conductor - User Manual Verification 'Phase 2: AI 韌性核心' (Protocol in workflow.md)

## Phase 3: 系統整合 (Integration)
將重試與日誌邏誌整合進現有的 AI Skills。

- [x] Task: 整合 `itinerary-generator` Skill 6b396d2
    - [x] 加入 `withRetry` 包裝 AI 呼叫
    - [x] 加入 `ai_audit` 紀錄每次生成內容與耗時
- [x] Task: 整合 `gap-analyzer` 與其他 AI Skills 6b396d2
    - [x] 統一所有 AI 呼叫點的重試與日誌邏輯
- [x] Task: 驗證整合後的系統行為 6b396d2
    - [x] 確保現有功能在正常情況下不受影響，且日誌能正確寫入 Supabase
- [x] Task: Conductor - User Manual Verification 'Phase 3: 系統整合' (Protocol in workflow.md)

## Phase 4: UI 強化 (UI Enhancements)
實作手動重試與重新產生功能。

- [x] Task: 建立通用的 `AIErrorFallback` 元件 be89b12
    - [x] 當 AI 發生最終失敗時，顯示友善訊息與「重試」按鈕
- [x] Task: 在行程編輯器加入「重新產生」功能 be89b12
    - [x] 允許使用者針對特定天數或整個行程要求 AI 重新規劃
- [x] Task: 串接前端重試邏輯至 Server Actions be89b12
- [x] Task: Conductor - User Manual Verification 'Phase 4: UI 強化' (Protocol in workflow.md) be89b12

## Phase 5: Agent 對話重試優化 (Agent-level Iterative Retry)
本階段實作使用者針對 AI Agent 建議內容不滿意時的重新產生功能。

- [x] Task: 整合 `itinerary-agent` 與 `route-agent` 核心 04525e6
    - [x] 加入 `withRetry` 與 `logAiAudit` 至 `itinerary-agent.ts`
    - [x] 加入 `withRetry` 與 `logAiAudit` 至 `route-agent.ts`
- [x] Task: 實作 Agent 對話重試 UI 04525e6
    - [x] 在 `ItineraryAgentChat` 對話視窗最後一則 AI 回應加入「重新生成」按鈕
    - [x] 當點擊重新生成時，發送與上一次相同的指令與上下文，但不記錄為新的對話歷史
- [x] Task: 驗證局部重試邏輯 04525e6
    - [x] 模擬 AI 建議不佳的情境，手動觸發重新生成並驗證結果
- [x] Task: Conductor - User Manual Verification 'Phase 5: Agent 對話重試優化' (Protocol in workflow.md) 04525e6

