# Implementation Plan: 實作行程編輯與 Word 匯出 (US-105)

## Phase 1: 行程編輯功能
- [x] Task: UI/UX 研究與設計 (Decided on Edit Mode toggle + Drag Handle + Sheet for details)
    - [x] 使用 `ui-ux-pro-max` 查詢 "table editing drag and drop" 最佳實踐。
    - [x] 決定編輯模式的互動設計 (Inline vs Modal)。
- [x] Task: 實作更新行程的 Server Action
    - [x] 在 `app/itineraries/actions.ts` 加入 `updateItinerary`。
    - [x] 撰寫測試驗證更新邏輯。
- [x] Task: 建立行程編輯 UI (基礎)
    - [x] 在 `/itineraries/[id]` 加入切換「編輯模式」的功能。
    - [x] 使用 Shadcn UI 元件實作欄位編輯。
- [x] Task: 實作拖拉排序 (Drag & Drop)
    - [x] 安裝 `@dnd-kit/core` @dnd-kit/sortable`。
    - [x] 實作活動項目的拖拉排序邏輯。
    - [x] 整合排序結果與 Server Action。

## Phase 2: Word 匯出實作
- [x] Task: 安裝與配置 `docx` 庫
    - [x] 執行 `npm install docx lucide-react`。
- [x] Task: 實作 Word 生成工具函式
    - [x] 在 `lib/utils/export-word.ts` 實作將行程 JSON 轉為 `docx` Table 的邏輯。
    - [x] 撰寫單元測試驗證生成結構。
- [x] Task: 整合匯出按鈕
    - [x] 在 `/itineraries/[id]` 加入「匯出 Word」按鈕。
    - [x] 實作客戶端下載邏輯。

## Phase 3: 驗收與格式優化
- [x] Task: 優化 Word 文件排版
    - [x] 加入頁首頁尾、公司名稱占位符、樣式設定 (Implemented table layout).
- [~] Task: 手動驗證完整編輯與匯出流程。

## Phase 4: UI/UX 增強與功能補完
- [x] Task: 實作跨時段與跨日拖拉 (Cross-Day DnD)
    - [x] 重構 UI：按時段 (Morning/Afternoon/Evening) 分組顯示。
    - [x] 實作跨容器拖拉：拖拉時自動更新 `time_slot` 與 `day`。
- [x] Task: 補完遺漏欄位 UI
    - [x] 加入「餐食」編輯 UI。
    - [x] 加入「住宿」編輯 UI。
- [x] Task: 實作「新增活動」功能
    - [x] 允許使用者在特定時段添加新活動。
