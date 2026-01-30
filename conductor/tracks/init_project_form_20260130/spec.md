# Specification: 初始化 Next.js 專案並實作結構化需求輸入表單

## 概述
本 Track 旨在搭建 TravelAgent 的基礎開發環境，並實作第一個核心功能：客戶需求結構化輸入表單 (US-101)。

## 業務需求 (US-101)
- **表單欄位**：旅遊區間、總人數、旅客結構（成人/長輩/兒童/嬰兒）、人均預算範圍。
- **偏好選單**：飲食禁忌、住宿偏好。
- **自由備註**：特殊需求（如：慶生、求婚）。
- **資料儲存**：資料需以 JSON 格式存入 Supabase 資料庫。

## 技術規範
- **框架**: Next.js 14+ (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS + Shadcn UI (推薦)
- **資料庫**: Supabase (PostgreSQL)
- **驗證**: Zod (用於表單與 API 驗證)
- **狀態管理**: React Hook Form

## 資料模型 (Schema 草案)
- **Requirements 表**:
  - `id`: uuid (PK)
  - `created_at`: timestamp
  - `user_id`: uuid (FK to users)
  - `travel_dates`: jsonb ({ start, end })
  - `travelers`: jsonb ({ adult, senior, child, infant })
  - `budget_range`: text
  - `preferences`: jsonb ({ dietary, accommodation })
  - `notes`: text
  - `status`: text (default: 'pending')
