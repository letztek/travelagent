# Implementation Plan: 實作行程編輯與 Word 匯出 (US-105)

## Phase 1: 行程編輯功能
- [ ] Task: 實作更新行程的 Server Action
    - [ ] 在 `app/itineraries/actions.ts` 加入 `updateItinerary`。
    - [ ] 撰寫測試驗證更新邏輯。
- [ ] Task: 建立行程編輯 UI
    - [ ] 在 `/itineraries/[id]` 加入切換「編輯模式」的功能。
    - [ ] 使用 Shadcn UI 元件實作欄位編輯（活動、食宿）。
    - [ ] 實作「儲存變更」按鈕並整合 Server Action。

## Phase 2: Word 匯出實作
- [ ] Task: 安裝與配置 `docx` 庫
    - [ ] 執行 `npm install docx lucide-react`。
- [ ] Task: 實作 Word 生成工具函式
    - [ ] 在 `lib/utils/export-word.ts` 實作將行程 JSON 轉為 `docx` Table 的邏輯。
    - [ ] 撰寫單元測試驗證生成結構。
- [ ] Task: 整合匯出按鈕
    - [ ] 在 `/itineraries/[id]` 加入「匯出 Word」按鈕。
    - [ ] 實作客戶端下載邏輯。

## Phase 3: 驗收與格式優化
- [ ] Task: 優化 Word 文件排版
    - [ ] 加入頁首頁尾、公司名稱占位符、樣式設定。
- [ ] Task: 手動驗證完整編輯與匯出流程。
