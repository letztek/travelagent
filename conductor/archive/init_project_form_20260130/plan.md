# Implementation Plan: 初始化 Next.js 專案並實作結構化需求輸入表單

## Phase 1: 環境初始化 [checkpoint: 3f1cf2e]
- [x] Task: 初始化 Next.js 專案
    - [x] 執行 `npx create-next-app@latest` (TypeScript, Tailwind, App Router)
    - [x] 配置專案目錄結構
- [x] Task: 整合 Supabase 571de4c
    - [x] 安裝 `@supabase/supabase-js` 與 `@supabase/auth-helpers-nextjs`
    - [x] 配置環境變數 (`.env.local`)
- [x] Task: 安裝基礎 UI 元件庫 4c791cf
    - [x] 初始化 Shadcn UI
    - [x] 安裝必要元件 (Button, Input, Form, DatePicker)

## Phase 2: 資料庫與後端驗證 [checkpoint: d979dd4]
- [x] Task: 定義資料庫 Schema 3f1cf2e
    - [x] 在 Supabase 建立 `requirements` 資料表
    - [x] 配置 RLS (Row Level Security) 策略
- [x] Task: 定義 Zod Schema c7703c6
    - [x] 建立 `schemas/requirement.ts` 用於驗證表單輸入

## Phase 3: 前端表單實作 (US-101) [checkpoint: 3c010db]
- [x] Task: 建立需求輸入表單頁面 740a38b
    - [x] 使用 `react-hook-form` 實作表單邏輯
    - [x] 實作日期區間選擇器
    - [x] 實作旅客結構輸入與預算範圍選單
- [x] Task: 實作資料提交邏輯 1d94f0a
    - [x] 建立 Server Action 處理資料寫入 Supabase
    - [x] 實作提交後的成功提示與導向

## Phase 4: 驗收與清理
- [x] Task: 手動測試表單完整流程
- [x] Task: 清理多餘的 Next.js 模板代碼
