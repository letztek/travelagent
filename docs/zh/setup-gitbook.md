# GitBook 註冊與雙語系同步教學指南

這份指南將引導您如何從零開始，將這個 GitHub 專案與 GitBook 連結，並建立支援「繁體中文」與「英文」雙語切換的工作流。

## 步驟一：註冊與建立 GitBook 組織
1. 前往 [GitBook.com](https://www.gitbook.com/)。
2. 點擊右上角的 **"Sign up"**，強烈建議選擇 **"Sign up with GitHub"** 以方便後續的權限綁定。
3. 登入後，系統會引導您建立一個 Organization（組織）和一個初始的 Space（空間，也就是一份獨立的文件庫）。
4. 幫這個 Space 命名為 `TravelAgent Docs`（或您喜歡的名稱）。

## 步驟二：安裝 GitBook GitHub 應用程式
1. 在您剛建立好的 Space 左側選單，點擊 **Integrations**。
2. 在列表中找到 **GitHub** 並點擊它，選擇 **Install GitBook on GitHub**。
3. 畫面會跳轉到 GitHub，詢問您要安裝在哪個帳號/組織下。請選擇存放 `TravelAgent` 專案的帳號。
4. 在權限設定中，建議選擇 "Only select repositories" 並明確勾選您的 `TravelAgent` 專案。
5. 點擊 **Install & Authorize**。

## 步驟三：設定雙語系切換 (Variants)
1. 授權完成後會跳轉回 GitBook 的設定畫面。在進入同步設定前，我們先開啟雙語系功能。
2. 前往左側選單的 **Space settings** (空間設定) -> **Localization** (語系設定) 或是 **Variants**。
3. 啟用 Variants 功能，並建立兩個 Variant：
   - 命名一個為：**繁體中文**
   - 命名另一個為：**English**
   *(註：介面名稱可能會隨 GitBook 更新而不同，主要概念就是為同一個空間建立兩個版本變體)*

## 步驟四：設定雙向同步 (Git Sync)
現在，我們要為這兩個 Variant 分別綁定 GitHub 上不同的資料夾。

1. 點擊 **"Configure Git Sync"** 或前往 **Integrations -> GitHub** 進行設定。
2. 在設定畫面中，您需要為剛建立的兩個 Variant 各自指定同步對象：
   
   **針對「繁體中文」Variant：**
   - **Repository**: 選擇 `TravelAgent` 專案。
   - **Branch**: 選擇 `main` (或 `master`)。
   - **Root directory**: 輸入 `docs/zh`。
   - **Sync direction**: 選擇 **Bidirectional** (雙向同步)。

   **針對「English」Variant：**
   - **Repository**: 選擇 `TravelAgent` 專案。
   - **Branch**: 選擇 `main` (或 `master`)。
   - **Root directory**: 輸入 `docs/en`。
   - **Sync direction**: 選擇 **Bidirectional** (雙向同步)。

3. 點擊 **"Sync"** 儲存設定。

## 步驟五：驗證與完成
1. GitBook 現在會掃描您 GitHub 專案中的 `docs/zh` 與 `docs/en` 目錄。
2. 稍等片刻，您就會在 GitBook 畫面上看到剛剛同步過去的文件內容，並且可以在介面右上角自由切換「繁體中文」與「English」。
3. 未來，只要有人在 GitHub 上對 `docs/` 內的檔案提交 (Commit) 修改，GitBook 就會自動更新對應語言的線上文件！

🎉 **恭喜！您已成功完成 GitBook 雙語知識庫的前置作業設定。**