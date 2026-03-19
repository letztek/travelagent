# TravelAgent - AI 智慧旅遊規畫助理

TravelAgent 是一個專為旅遊規劃從業人員設計的 **AI 智慧行程規劃與管理平台**。透過生成式 AI 技術，將客戶碎片化的旅遊需求自動轉化為結構化、高品質的行程草案，並提供直覺的編輯介面與專業的文件導出功能。

---

## ✨ 主要功能

### 1. 智慧需求分析
- **多樣化匯入**：支援 PDF、圖片或文字直接提取旅遊需求。
- **資訊完整性偵測**：系統會自動分析需求內容，並提示缺少的關鍵資訊。

### 2. AI 自動生成與路線規劃
- **一鍵產出行程**：根據需求快速生成包含交通、餐飲、住宿與每日活動的完整行程。
- **互動式路線編輯**：視覺化調整路線骨架，並由 AI 協助填充細節。

### 3. 結構化資料管理
- **同步更新**：介面上所有的修改都會即時同步到底層資料，確保資料一致性。
- **專業格式導出**：支援導出為 Word 文件或簡報提示詞 (Prompt)。

### 4. 安全權限控管
- **私有邀請制**：系統不開放公開註冊，僅限受邀成員存取。
- **角色管理**：區分管理員 (Admin) 與規畫師 (Editor) 權限。

---

## 🛠️ 技術架構

- **前端框架**: Next.js 15+ (App Router)
- **樣式工具**: Tailwind CSS, shadcn/ui
- **後端服務**: Supabase (認證、資料庫、即時更新、儲存空間)
- **資料驗證**: Zod (確保系統資料交換的穩定性)

---

## 🚦 地端安裝與部署指南

若要在本地環境執行此專案，請參考以下步驟：

### 1. 前置準備
請確保您的電腦已安裝：
- [Node.js](https://nodejs.org/) (建議 v18 以上版本)
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

### 2. 下載專案與安裝套件
```bash
# 進入專案目錄
cd travelagent

# 安裝相依套件
npm install
```

### 3. 設定環境變數
在 `travelagent/` 目錄下建立 `.env.local` 檔案，並填入您的金鑰資訊：

```env
# Supabase 設定 (請從 Supabase Dashboard 獲取)
NEXT_PUBLIC_SUPABASE_URL=您的_SUPABASE_網址
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=您的_SERVICE_ROLE_KEY

# AI 引擎設定 (請填入 API Key)
GEMINI_API_KEY=您的_API_KEY
```

### 4. 啟動開發伺服器
```bash
npm run dev
```
啟動後，開啟瀏覽器造訪 `http://localhost:3000` 即可看到執行結果。

---

## 📂 專案指令說明

- `npm run dev`：啟動本地開發模式。
- `npm run build`：專案編譯（部署至生產環境前使用）。
- `npm run lint`：執行程式碼檢查。
- `npm run test`：執行單元測試。

---

© 2026 TravelAgent. All rights reserved.
