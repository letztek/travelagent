# 🇹🇼 AI 智慧旅遊業務助理 (TravelAgent)

[繁體中文](#繁體中文) | [English](#english)

---

<div align="center">

[![GitBook](https://img.shields.io/badge/Documentation-GitBook-blue?style=for-the-badge&logo=gitbook&logoColor=white)](https://letztek.gitbook.io/travelagent/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75E9?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

<a name="繁體中文"></a>

## 🇹🇼 繁體中文

### 🚀 專案簡介
**TravelAgent** 是一個專為專業旅遊顧問打造的「B2B 私人邀請制」行程規畫平台。透過整合 Google Gemini AI 與 Google Places API，我們將顧問從繁瑣的資料解析與初步排版中解放，讓科技成為專業服務最強大的後盾。

### ✨ 核心特色
- **智能行程匯入**：支援 PDF、Word 與純文字解析，自動將雜亂的行程轉化為結構化資料。
- **AI 需求診斷 (Gap Analysis)**：自動偵測需求中的邏輯衝突或資訊缺失，並提供顧問詢問建議。
- **動態路線編輯**：視覺化拖拽編輯每日落腳城市，支援實時日期計算。
- **私房名單注入 (RAG)**：優先將顧問個人收藏的景點與餐廳排入 AI 生成的行程中。
- **自動化邏輯審查 (Verifier)**：自動核對景點營業時間與地理距離，強制 AI 產出具備執行力的行程。

### 🏗️ 技術堆疊
- **框架**：Next.js 15 (App Router)
- **語言**：TypeScript
- **後端/資料庫**：Supabase (PostgreSQL + RLS + Auth)
- **AI 模型**：Google Gemini 1.5/2.0/3.0 系列
- **外部 API**：Google Places API (New), Distance Matrix API

### 🛠️ 快速開始
1. **Clone 專案**:
   ```bash
   git clone https://github.com/letztek/travelagent.git
   cd travelagent/travelagent
   ```
2. **安裝依賴**:
   ```bash
   npm install
   ```
3. **設定環境變數**:
   複製 `.env.example` 為 `.env.local` 並填入您的 API 金鑰。
4. **啟動開發伺服器**:
   ```bash
   npm run dev
   ```

---

<a name="english"></a>

## 🇺🇸 English

### 🚀 Project Introduction
**TravelAgent** is a "B2B Invite-Only" itinerary planning platform tailored for professional travel consultants. By integrating Google Gemini AI and Google Places API, we free consultants from tedious data parsing and initial formatting, allowing technology to empower professional services.

### ✨ Key Features
- **Smart Itinerary Import**: Supports PDF, Word, and text parsing, automatically converting messy itineraries into structured data.
- **AI Gap Analysis**: Automatically detects logical conflicts or missing information in requirements and provides questioning suggestions for consultants.
- **Dynamic Route Editor**: Visualize and drag-and-drop daily destination cities with real-time date calculation.
- **Personal Favorites Injection (RAG)**: Prioritizes the consultant's personal collection of spots and restaurants during AI generation.
- **Automated Verification Sub-agent**: Automatically cross-checks attraction opening hours and geographical distances, forcing the AI to produce actionable itineraries.

### 🏗️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Backend/DB**: Supabase (PostgreSQL + RLS + Auth)
- **AI Models**: Google Gemini 1.5/2.0/3.0 Series
- **External APIs**: Google Places API (New), Distance Matrix API

### 🛠️ Quick Start
1. **Clone the Repo**:
   ```bash
   git clone https://github.com/letztek/travelagent.git
   cd travelagent/travelagent
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your API keys.
4. **Start Dev Server**:
   ```bash
   npm run dev
   ```

---

## 📖 官方文檔 (Documentation)
更詳細的系統架構、部署指南與操作手冊，請參閱我們的 **[GitBook 知識庫](https://letztek.gitbook.io/travelagent/)**。
For more details on architecture, deployment, and user manuals, please visit our **[GitBook Knowledge Base](https://letztek.gitbook.io/travelagent/)**.
