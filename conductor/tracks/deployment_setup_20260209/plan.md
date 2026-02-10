# Implementation Plan: US-801 & US-802 CI/CD 與雲端部署

本計畫旨在優化專案結構並建立自動化發布流程。

## Phase 0: 專案結構與安全優化 (Restructuring)
- [~] Task: 重定位 Git 根目錄
    - [ ] 將 `.git` 資料夾從根目錄移入 `travelagent/`
    - [ ] 在 `travelagent/` 初始化新 Git 狀態，確認追蹤範圍僅限程式碼
- [ ] Task: 忽略規則審計
    - [ ] 更新 `travelagent/.gitignore` 加入必要排除項
- [ ] Task: 建立 `.env.example`
    - [ ] 提供環境變數範本
- [ ] Task: Conductor - User Manual Verification 'Phase 0: 專案結構與安全優化' (Protocol in workflow.md)

## Phase 1: CI 持續整合 (GitHub Actions)
- [ ] Task: 配置 GitHub Actions Workflow
    - [ ] 建立 `travelagent/.github/workflows/ci.yml`
    - [ ] 實作 Lint, TSC, Test 步驟
- [ ] Task: 驗證 CI 流程
    - [ ] 模擬提交觸發，確保各檢查項正確執行
- [ ] Task: Conductor - User Manual Verification 'Phase 1: CI 持續整合' (Protocol in workflow.md)

## Phase 2: 雲端配置與部署 (Vercel)
- [ ] Task: 引導使用者建立生產環境
    - [ ] 指導建立獨立 Supabase 專案並套用 Schema
- [ ] Task: Vercel 部署設定
    - [ ] 指導在 Vercel 配置專案路徑與環境變數
- [ ] Task: 執行首次雲端部署
    - [ ] 確認部署連結正常運作
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 雲端配置與部署' (Protocol in workflow.md)
