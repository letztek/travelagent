# 本地環境建置指南

這份指南將帶領您一步步在自己的電腦上跑起 TravelAgent 系統，方便進行開發測試與修改。

## 軟硬體需求
- **Node.js**: 建議版本 v18.17 或更新版本 (LTS)
- **套件管理員**: npm (Node.js 內建) 或 pnpm/yarn
- **Git**: 用於版本控制

## 步驟一：取得程式碼
首先，請將專案從 GitHub 複製到您的電腦中，並進入專案目錄下的 `travelagent` 子目錄（這是 Next.js 應用程式的根目錄）：

```bash
git clone <your-repository-url>
cd TravelAgent/travelagent
```

## 步驟二：安裝依賴套件
我們使用 npm 進行套件管理。請在 `travelagent` 目錄下執行：

```bash
npm install
```

這會安裝 Next.js, Tailwind CSS, shadcn/ui, Supabase Client, Gemini SDK 以及其他所有必要的依賴。

## 步驟三：環境變數設定
專案需要連線至 Supabase (作為資料庫與身分驗證) 以及 Google Gemini (AI 模型)。
請複製範本檔案，建立您自己的本地環境變數檔：

```bash
cp .env.example .env.local
```

打開 `.env.local`，並填入您自己的 API 金鑰。詳細的各欄位說明，請參考 [環境變數說明](environment-variables.md) 章節。

## 步驟四：啟動開發伺服器
設定完成後，即可啟動本地的開發伺服器：

```bash
npm run dev
```

伺服器成功啟動後，通常會顯示如下訊息：
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```
現在您可以打開瀏覽器，前往 `http://localhost:3000` 開始使用系統了！

## 步驟五：資料庫建置 (若為首次開發)
如果您需要連接到自己全新的 Supabase 專案，請確保您已經在 Supabase 的 SQL Editor 執行過我們 `supabase/migrations/` 底下的所有 `.sql` 檔案，以建立正確的資料表 (Tables) 與權限規則 (RLS)。詳細的資料庫結構請見 [Supabase 資料庫與權限設計](../architecture/supabase.md)。