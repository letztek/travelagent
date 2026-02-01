# Implementation Plan: 實作 AI 結構化行程生成 (US-104)

## Phase 1: AI 核心邏輯與 Prompt 設計
- [x] Task: 定義行程 JSON Schema (Zod) 6460f8f
    - [x] 在 `schemas/itinerary.ts` 定義結構。
- [x] Task: 建立 AI 行程生成 Skill 7ceaacb
    - [x] 使用 `skill-creator` 定義 `itinerary-generator` skill。
    - [x] 設計系統提示語與 Output Schema 約束。
- [x] Task: 實作 AI 生成工作流與驗證機制 (Server Action) 4ceda76
    - [x] 安裝並配置 Google Generative AI SDK。
    - [x] 實作「Skill 調用 -> JSON 解析 -> Zod 驗證」的完整 Pipeline。
    - [x] 實作錯誤處理與重試機制（若 Zod 驗證失敗，記錄錯誤並回傳結構化錯誤）。
    - [x] 撰寫 `actions/generate-itinerary.ts` 整合上述邏輯。

## Phase 2: 資料持久化
- [x] Task: 建立 `itineraries` 資料表
    - [x] 在 Supabase 建立資料表並配置 RLS。
- [x] Task: 實作儲存與讀取邏輯 29dfb33
    - [x] 在 Server Action 中加入資料庫寫入操作。

## Phase 3: 前端展示 UI
- [ ] Task: 需求列表頁功能擴充
    - [ ] 在 `/requirements` 頁面加入「生成行程」按鈕。
- [ ] Task: 建立行程檢視頁面
    - [ ] 建立 `/itineraries/[id]` 頁面。
    - [ ] 以表格 (Table) 形式展示 AI 生成的每日行程內容。

## Phase 4: 驗收與優化
- [ ] Task: 測試不同天數的需求生成效果
- [ ] Task: 優化 Prompt 以提升地理合理性
