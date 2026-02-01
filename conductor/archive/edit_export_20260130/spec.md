# Specification: 實作行程編輯與 Word 匯出 (US-105)

## 概述
本 Track 旨在讓使用者能微調 AI 生成的行程內容，並將最終結果匯出為專業的 Word 文件 (.docx)。

## 業務需求 (US-105)
- **行程編輯**：
  - 在 `/itineraries/[id]` 頁面提供「編輯模式」。
  - 使用者可以修改活動名稱、描述、交通時段以及食宿資訊。
  - **拖拉排序 (Drag & Drop)**：支援拖拉調整「每日活動」的順序，以及「跨天」移動活動。
  - 修改後的內容應能儲存回資料庫。
- **Word 匯出**：
  - 在行程頁面提供「匯出 Word」按鈕。
  - 生成的文件需包含：行程名稱、每日表格（日期、活動、食宿）。
  - 排版需整齊美觀，適合直接交付給客戶。

## 技術規範
- **前端編輯**: React Hook Form + Shadcn UI (Dialog 或 Inline Edit)。
- **拖拉套件**: `@dnd-kit/core` (推薦) 或 `react-beautiful-dnd`。
- **UI/UX 指引**: 必須使用 `ui-ux-pro-max` Skill 查詢「複雜表格編輯」與「拖拉排序」的最佳實踐，確保操作直覺。
- **資料持久化**: 擴充 `itineraries` 的 Server Actions 以支援 UPDATE。
- **文件生成**: 使用 `docx` (npm package) 在客戶端生成文件。
- **儲存**: 更新 Supabase 中的 `content` jsonb 欄位。

## 使用者流程
1. 進入行程詳情頁。
2. 點擊「編輯」修改特定天的活動。
3. 點擊「儲存」同步至雲端。
4. 點擊「匯出 Word」下載實體文件。
