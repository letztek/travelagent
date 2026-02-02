# Implementation Plan: 需求欄位擴充與對話式 AI 補全

## Phase 1: 資料結構與 Backend 擴充
- [ ] Task: 執行資料庫 Migration
    - [ ] 為 `requirements` 資料表新增 `origin` 與 `destinations` 欄位。
- [ ] Task: 更新 Zod Schemas
    - [ ] 修改 `schemas/requirement.ts` 包含新欄位。
    - [ ] 修改 `schemas/gap-analysis.ts` 以支援對話式狀態（若需要）。
- [ ] Task: 更新 Server Actions
    - [ ] 修改 `createRequirement` 以處理新欄位。

## Phase 2: 前端 UI 欄位擴充
- [ ] Task: 修改 `/requirements/new` 表單
    - [ ] 加入「出發地」與「目的地」輸入框（建議使用多選標籤）。
    - [ ] 更新測試案例。

## Phase 3: 對話式診斷 (Interactive Wizard)
- [ ] Task: 重構診斷 Dialog
    - [ ] 將 `GapChecklist` 改為 `GapWizard`。
    - [ ] 實作逐條顯示缺口問題並收集答案的邏輯。
- [ ] Task: 實作自動補全 (Auto-filling)
    - [ ] 將使用者在對話框中的答案自動整合回 `Requirement` 物件。

## Phase 4: 驗收與優化
- [ ] Task: 手動測試完整對話流程
- [ ] Task: 驗證目的地欄位對於後續 AI 生成行程的正面影響
