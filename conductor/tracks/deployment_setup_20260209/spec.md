# Track Specification: US-801 & US-802 CI/CD 與雲端部署環境建立

## 1. 概述 (Overview)
本 Track 旨在建立 TravelAgent 專案的專業化發布流程。透過 GitHub Actions 實作 CI (持續整合)，並透過 Vercel 實作 CD (持續部署)。為了確保安全性與專業性，我們將 Git 根目錄重新定位至程式碼資料夾 (`travelagent/`)，使 GitHub 倉庫僅包含程式碼，並徹底隔離本地設計文件。

## 2. 功能需求 (Functional Requirements)

### 2.0 專案結構與安全優化 (Project Structure & Security)
- **重定位 Git 根目錄**：將 `.git` 從目前的根目錄移入 `travelagent/` 中，確保推送到 GitHub 的內容僅限程式碼。
- **Git 忽略規則檢查**：更新 `travelagent/.gitignore`，確保 `.env.local`、`.next/`、`node_modules/` 等機敏或暫存檔不會被追蹤。
- **環境變數範本**：建立 `.env.example`，標準化開發環境設定。

### 2.1 自動化 CI 管道 (US-801)
- **觸發機制**：推送到 `main` 分支或 PR 時。
- **檢查項目**：
    - **Linting**: 確保代碼風格一致。
    - **Type Check**: 確保 TypeScript 型別安全。
    - **Unit Tests**: 確保核心邏輯通過測試。

### 2.2 Vercel 雲端部署 (US-802)
- **部署平台**：使用 Vercel。
- **環境變數管理**：在 Vercel 後台配置 `GEMINI_API_KEY`、`NEXT_PUBLIC_SUPABASE_URL` 等變數。
- **生產環境隔離**：引導使用者建立獨立的 Supabase Production 專案。

## 3. 非功能需求 (Non-Functional Requirements)
- **安全性**：禁止金鑰在 GitHub 上以明文顯示，使用 GitHub Secrets 與 Vercel Env Vars 管理。
- **純淨性**：GitHub 倉庫不應包含任何 `.conductor`、`.gemini` 或 `docs/` 資料。

## 4. 驗收標準 (Acceptance Criteria)
- [ ] Git 根目錄已成功移至 `travelagent/`，且 `git status` 顯示正確。
- [ ] `.env.local` 已被 `.gitignore` 正確排除。
- [ ] GitHub Actions 能在提交時自動執行並報告結果。
- [ ] Vercel 部署成功，且能正常存取生產環境資料庫。

## 5. 超出範圍 (Out of Scope)
- 自動化資料庫遷移 (Migrations Automation) —— 初期先採手動在 Production 套用 SQL。
