# Implementation Plan: 互動式路線規劃編輯器 (US-103-2)

## Phase 1: 重構路線預覽 UI [checkpoint: 8c970c8]
- [x] Task: 轉換為 Client Component (732af68)
    - [x] `RoutePreviewPage` 目前是 Server Component，需將主要邏輯移至新的 Client Component `RouteEditor`。
    - [x] 將 `RouteFlow` 的顯示邏輯整合進 `RouteEditor`。
- [x] Task: 整合 Dnd-kit (225f502)
    - [x] 在 `RouteEditor` 中設定 `DndContext` 與 `SortableContext`。
    - [x] 實作 `SortableRouteNode` 元件。

## Phase 2: 實作編輯功能 [checkpoint: 398be79]

- [x] Task: 實作拖拉排序邏輯 (225f502)

    - [x] 處理 `onDragEnd` 事件，更新 `nodes` 陣列順序。

    - [x] 自動更新 `day` 欄位（Day 1, Day 2...）以符合新順序。

- [x] Task: 實作刪除與新增功能 (058d770)

    - [x] 在節點旁加入「刪除」按鈕。

    - [x] 在列表底部加入「新增節點」按鈕（Dialog 或 Inline Input）。


## Phase 2.5: AI 對話輔助整合 (Route Architect Agent)
- [x] Task: 設定 AI Server Action (Gemini Structured Output) (240b433)
    - [x] 定義 Zod Schema for AI Response (`thought`, `analysis`, `proposed_route`).
    - [x] 實作 `refineRouteWithAI`，使用 Gemini SDK 的 `responseSchema` 模式。
    - [x] 設計 System Prompt：設定為「路線架構師」，強調邏輯檢查。
- [x] Task: 實作狀態管理 (History & Proposal) (deb3168)
    - [x] 在 `RouteEditor` 實作 `useHistory` hook (Undo/Redo)。
    - [x] 實作 `proposal` state，用於暫存 AI 的建議。
- [x] Task: 實作 Chat 與 Feedback UI (deb3168)
    - [x] 建立 `RouteAgentChat` 元件：顯示對話與 AI 的 "Thinking"。
    - [x] 建立 `TrafficLightStatus` 元件：顯示紅/綠燈與分析訊息。
    - [x] 實作 [Accept] / [Reject] 按鈕邏輯。
    - [x] 串接前後端：在 Client 端呼叫 Action，接收回傳的 updated `RouteConcept`。
    - [x] 更新 `RouteEditor` 的 React State 以反映 AI 的修改。

## Phase 3: 整合與提交
- [x] Task: 更新確認按鈕邏輯 (deb3168)
    - [x] 確保 `ConfirmRouteButton` 使用的是編輯後的最新 `nodes` 資料。
    - [x] 呼叫 `generateItinerary`。

## Phase 4: 驗收
- [ ] Task: 手動驗證排序、新增、刪除功能是否正常。
