# Implementation Plan: 初步行程概念與路線預覽 (US-103)

## Phase 1: AI 核心邏輯 (Route Planner)
- [x] Task: 定義 Route Concept JSON Schema
    - [x] 在 `schemas/route.ts` 定義結構 (nodes, rationale, transport)。
- [x] Task: 建立 `route-planner` Skill f8d2089
    - [x] 使用 `skill-creator` 定義 skill。
    - [x] 設計 System Prompt 強調地理效率與高層次規劃。
- [x] Task: 實作路線規劃 Server Action
    - [x] 撰寫 `actions/plan-route.ts`。

## Phase 2: 前端預覽 UI
- [~] Task: 建立路線預覽組件
    - [ ] 實作 `RouteFlow` 元件（時間軸或流程圖樣式）。
    - [ ] 展示規劃理由 (Rationale)。
- [ ] Task: 建立路線預覽頁面
    - [ ] `/requirements/[id]/route` 頁面。

## Phase 3: 流程整合 (The Big Loop)
- [ ] Task: 串接 Gap Wizard 至 Route Preview
    - [ ] 當對話補全完成後，自動導向至路線預覽頁。
- [ ] Task: 修改詳細行程生成按鈕
    - [ ] 將原本列表頁的「生成行程」改為先進入「預覽路線」。
    - [ ] 在路線預覽頁提供「確認並生成詳細行程」按鈕。

## Phase 4: 驗收與優化
- [ ] Task: 測試多目的地情境的路線合理性
- [ ] Task: 優化 UI 互動（例如：點擊節點顯示簡單摘要）
