# TravelAgent Core Application

這是 TravelAgent 的核心應用程式，採用 Next.js 15+ (App Router) 開發。

## 開發指令

```bash
npm run dev      # 啟動開發伺服器
npm run build    # 專案編譯
npm run lint     # 語法檢查
npm run test     # 執行單元測試 (Vitest)
```

## 技術特點

- **App Router**: 利用 React Server Components 最佳化載入速度。
- **Supabase SSR**: 完整實作伺服器端認證與工作階段管理。
- **Zod Schema**: 嚴格驗證 AI 輸出的 JSON，確保前端渲染穩定性。
- **Modular Actions**: 所有的資料庫操作均封裝於 `actions.ts` 檔案中。

## 測試規範

專案使用 `Vitest` 進行測試：
- 測試檔案與原始碼放置於同一目錄，命名為 `*.test.ts`。
- 所有的 Schema 變更都必須伴隨對應的測試案例。

## 文件參考

- 全域產品說明請參考：`../README.md`
- 開發軌道紀錄請參考：`../conductor/`
