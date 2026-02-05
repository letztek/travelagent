# Implementation Plan: 互動式行程細節規劃師 (Activity Planner Agent)

## Phase 1: Foundation & State Management [checkpoint: 145e279]
- [x] Task: Refactor ItineraryEditor State (6f51ab2)
    - [x] 將 `ItineraryEditor` 的內部狀態遷移至 `useHistory` hook，以支援 Undo/Redo。
    - [x] 確保現有的拖拉 (DnD) 與 CRUD 功能與新的 History State 相容。
- [x] Task: Implement Context Selection (d1ad505)
    - [x] 在 `ItineraryEditor` 新增 `selectedContext` state。
    - [x] 更新 `SortableActivityCard`, `MealsEdit`, `AccommodationEdit` 接收 `onSelect` 與 `isSelected` props。
    - [x] 實作點擊 Highlight 效果。
- [x] Task: Conductor - User Manual Verification 'Foundation' (Protocol in workflow.md) (53f7cdb)

## Phase 2: AI Server Action
- [ ] Task: Implement refineItineraryWithAI
    - [ ] 定義 `ItineraryAgentResponse` Zod Schema (含 thought, analysis, proposed_itinerary)。
    - [ ] 實作 Server Action，使用 `Gemini 3.0` 模型與 Structured Output。
    - [ ] 設計 System Prompt：強調細節規劃能力，但也允許跨城市調整。
- [ ] Task: Conductor - User Manual Verification 'AI Logic' (Protocol in workflow.md)

## Phase 3: Chat UI & Integration
- [ ] Task: Create ItineraryAgentChat
    - [ ] 建立側邊欄聊天元件，顯示當前選取的 Context Badge。
    - [ ] 實作 Proposal Mode：收到 AI 建議時，顯示預覽與 [套用]/[放棄] 按鈕。
- [ ] Task: Integrate Layout
    - [ ] 調整 `ItineraryEditor` 版面為左右分割 (Editor + Chat)。
    - [ ] 串接 Chat 的 Proposal 回呼函式至 Editor 的 `setHistory` (或臨時 Proposal State)。
- [ ] Task: Conductor - User Manual Verification 'Full Integration' (Protocol in workflow.md)

## Phase 4: Verification
- [ ] Task: Conductor - User Manual Verification 'Activity Planner' (Protocol in workflow.md)
