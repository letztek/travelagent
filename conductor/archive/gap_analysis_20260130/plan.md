# Implementation Plan: 實作 AI 資訊缺口偵測 (US-102)

## Phase 1: AI 核心邏輯與 Skill 定義
- [x] Task: 定義 Gap Analysis JSON Schema
    - [x] 在 `schemas/gap-analysis.ts` 定義結構。
- [x] Task: 建立 `gap-analyzer` Skill 44f9039
    - [x] 使用 `skill-creator` 定義 skill。
    - [x] 設計 System Prompt 進行邏輯偵測與建議生成。
- [x] Task: 實作診斷 Server Action
    - [x] 撰寫 `actions/analyze-gaps.ts`。
    - [x] 整合 Skill 讀取與 AI 呼叫。

## Phase 2: 前端 UI 實作
- [x] Task: 建立診斷結果展示組件
    - [x] 使用 Shadcn UI 實作 `GapChecklist` 元件。
- [x] Task: 整合至需求流程
    - [x] 在 `/requirements/new` 提交後導向至診斷頁面（或彈窗）。
    - [x] 提供「忽略並生成行程」與「返回修改」按鈕。

## Phase 3: 驗收與優化
- [~] Task: 撰寫測試案例驗證 AI 診斷準確性
    - [ ] 測試情境：有長輩、去極地、預算過低等。
- [ ] Task: 優化建議文字的口吻
