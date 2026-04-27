# 測試與驗證

為確保系統功能穩定，本專案導入了 **Test-Driven Development (TDD)** 流程，並使用 **Vitest** 作為單元測試與整合測試的框架。

我們強烈建議開發者在提交任何程式碼或功能修改前，確保所有自動化測試皆能順利通過。

## 執行自動化測試
請確保您位於 `travelagent` 目錄下，然後可以使用以下指令來執行測試：

### 1. 執行所有測試 (一次性)
最基本的測試指令，會掃描專案中所有的 `*.test.ts` 與 `*.test.tsx` 檔案並執行：
```bash
npx vitest run
```
*(在我們的 Conductor 工作流中，AI 通常會加上 `CI=true` 參數來確保非互動模式運行：`CI=true npx vitest run`)*

### 2. 執行特定檔案的測試
如果您只修改了某個元件，想單獨測試該檔案，可以直接在後方加上路徑關鍵字：
```bash
npx vitest run actions.test.ts
```

### 3. 開發模式 (Watch Mode)
在本地開發撰寫測試時，您可以使用監聽模式，只要存檔測試就會自動重新執行：
```bash
npx vitest
```

### 4. 產生測試覆蓋率報告 (Coverage)
要檢視目前的測試覆蓋率（我們專案的目標為 >80%），請執行：
```bash
npx vitest run --coverage
```
這會在終端機印出詳細的報表，並可能在資料夾中產生 HTML 格式的報告供您在瀏覽器中查看。

---

## 手動驗證與除錯
除了自動化測試，某些 UI 互動與視覺效果仍需人工確認：
1. **元件檢查**：確保 Loading 畫面 (如 `GlobalLoader`) 有正確阻擋背景互動。
2. **終端機日誌 (Logs)**：我們在伺服器端使用了 `logger` 工具。如果在開發過程中 AI 發生錯誤，您可以在執行 `npm run dev` 的終端機視窗中查看詳細的 `console.error` 或 `logger.info` 輸出，這些日誌會包含 API 失敗的具體原因。