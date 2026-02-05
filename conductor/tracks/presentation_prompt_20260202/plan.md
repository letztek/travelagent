# Implementation Plan: 外部簡報工具 Prompt 生成 (US-107)

## Phase 1: Backend Logic (Prompt Engineering)
- [ ] Task: Implement generatePresentationPrompt
    - [ ] 在 `app/itineraries/actions.ts` (或專屬檔案) 中實作 Server Action。
    - [ ] 設計 System Prompt：要求輸出 Cover -> Daily -> Spotlights (All Highlights) -> Assurance 結構。
    - [ ] 實作 Image Prompt 生成邏輯 (包含在 System Prompt 中)。
- [ ] Task: Unit Test for Generator
    - [ ] 測試 AI 是否能回傳包含 Markdown 標記的字串。
    - [ ] 驗證是否包含 Image Prompt 格式。
- [ ] Task: Conductor - User Manual Verification 'Backend Logic' (Protocol in workflow.md)

## Phase 2: UI Implementation
- [ ] Task: Create PresentationPromptDialog
    - [ ] 建立彈窗元件，包含 `ScrollArea` 顯示生成的 Markdown。
    - [ ] 實作 `navigator.clipboard.writeText` 複製功能與 Toast 提示。
- [ ] Task: Integrate into ItineraryEditor
    - [ ] 在編輯器 Header 加入 [簡報 Prompt] 按鈕。
    - [ ] 串接 Server Action，處理 Loading 狀態。
- [ ] Task: Conductor - User Manual Verification 'UI Integration' (Protocol in workflow.md)

## Phase 3: Verification
- [ ] Task: Conductor - User Manual Verification 'Presentation Prompt' (Protocol in workflow.md)
