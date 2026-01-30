# Implementation Plan: 初始化 Next.js 專案並實作結構化需求輸入表單

## Phase 1: 環境初始化
- [ ] Task: 初始化 Next.js 專案
    - [ ] 執行 `npx create-next-app@latest` (TypeScript, Tailwind, App Router)
    - [ ] 配置專案目錄結構
- [ ] Task: 整合 Supabase
    - [ ] 安裝 `@supabase/supabase-js` 與 `@supabase/auth-helpers-nextjs`
    - [ ] 配置環境變數 (`.env.local`)
- [ ] Task: 安裝基礎 UI 元件庫
    - [ ] 初始化 Shadcn UI
    - [ ] 安裝必要元件 (Button, Input, Form, DatePicker)

## Phase 2: 資料庫與後端驗證
- [ ] Task: 定義資料庫 Schema
    - [ ] 在 Supabase 建立 `requirements` 資料表
    - [ ] 配置 RLS (Row Level Security) 策略
- [ ] Task: 定義 Zod Schema
    - [ ] 建立 `schemas/requirement.ts` 用於驗證表單輸入

## Phase 3: 前端表單實作 (US-101)
- [ ] Task: 建立需求輸入表單頁面
    - [ ] 使用 `react-hook-form` 實作表單邏輯
    - [ ] 實作日期區間選擇器
    - [ ] 實作旅客結構輸入與預算範圍選單
- [ ] Task: 實作資料提交邏輯
    - [ ] 建立 Server Action 處理資料寫入 Supabase
    - [ ] 實作提交後的成功提示與導向

## Phase 4: 驗收與清理
- [ ] Task: 手動測試表單完整流程
- [ ] Task: 清理多餘的 Next.js 模板代碼
