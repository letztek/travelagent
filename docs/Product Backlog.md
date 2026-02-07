# **Product Backlog: AI 智慧旅遊業務助理 (TravelAgent)**

**專案名稱:** AI 智慧旅遊業務助理系統 (TravelAgent)

**文件版本:** 1.3

**更新日期:** 2026-02-02

**產品負責人 (PO):** 旅遊業務顧問

**開發教練:** Sprint 團隊 AI 教練

## **📌 產品願景 (Product Vision)**

透過生成式 AI 技術，將旅遊顧問從繁瑣的「需求整理」與「初版行程排版」中解放，透過「人機協作」模式，快速產出結構化、高品質的行程草稿與簡報素材，讓顧問能專注於客戶關係經營與行程邏輯的專業判斷。

## **🎯 MVP 範疇 (MVP Scope)**

1. **結構化輸入:** 提供表單介面確保資料完整性，而非依賴純文字對話解析。  
2. **智慧偵測:** 利用 AI 進行「資訊缺口分析 (Gap Analysis)」，輔助顧問提問。  
3. **路線預覽:** 在生成詳細行程前，先提供大方向的路線概念供確認。  
4. **行程生成:** 自動產出結構化的每日行程表格（含時段、食宿）。  
5. **編輯交付:** 支援直覺式 UI 調整行程，並能匯出支援中英轉換的 Word 文件與簡報專用 Prompt。

## **🛠️ Sprint 規劃策略**

* **Sprint 1 (Focus: Get it Done):** 建立基礎設施，完成從「輸入」到「詳細行程」再到「Word 交付」的核心閉環。 (已完成)
* **Sprint 2 (Focus: Make it Smart):** 導入 AI 智慧建議（缺口偵測、路線預覽、總結回饋）與簡報 Prompt 生成，優化體驗與美感。 (已完成)
* **Sprint 3 (Focus: Platform & Security):** 實作使用者認證、資料隔離、儀表板與導航優化。 (執行中)

## **📋 待辦清單詳情 (Backlog Items)**

### **🔹 Epic 1: 需求輸入與分析 (Input & Analysis)**

#### **✅ US-101: 客戶需求結構化輸入表單 [Completed]**
* **Status:** 已實作 UI 表單、Supabase 存取邏輯。

#### **✅ US-102: 資訊缺口偵測與提問 (AI Gap Analysis) [Completed]**
* **Status:** 已實作 GapWizard 元件與 AI 邏輯。

### **🔹 Epic 2: 行程規劃與編輯 (Planning & Editing)**

#### **✅ US-103: 初步行程概念與路線預覽 [Completed]**
* **Status:** 已實作 RouteFlow 展示邏輯。

#### **✅ US-103-2: 互動式路線規劃編輯器 (Interactive Route Editor & Co-pilot) [Completed]**
* **Status:** 已整合 Dnd-kit、History (Undo/Redo) 與 Route Architect Agent (Chat)。

#### **✅ US-104: 結構化行程生成 (Itinerary Generation) [Completed]**
* **Status:** 已實作 `generateItinerary` Action 與 `itinerary-generator` Skill。

#### **✅ US-105: 直覺式行程編輯與 Word 匯出 (Interactive Editing & Export) [Completed]**
* **Status:** 已實作 `ItineraryEditor` 拖拉編輯與 `export-word` 模組。

#### **✅ US-105-2: 互動式行程細節規劃師 (Activity Planner Agent) [Completed]**
* **Status:** 已整合 `ItineraryAgentChat` 提供單點細節優化。

#### **US-106: AI 行程總結與優化建議 (AI Final Review)**
* **Priority:** Low (Sprint 3)

### **🔹 Epic 3: 交付物生成 (Final Delivery)**

#### **✅ US-107: 外部簡報工具 Prompt 生成 (Presentation Prompt Generation) [Completed]**
* **Status:** 已實作 `PresentationPromptDialog` 與 `generatePresentationPrompt`。

### **🔹 Epic 4: 高階編輯與管理 (Advanced Management)**

#### **US-401: 行程天數調整與排序 (Day Management)**
* **Priority:** Medium

#### **US-402: 剪下/複製/貼上與遠距離移動 (Clipboard & Jump Move)**
* **Priority:** Medium

### **🔹 Epic 5: 外部服務串接 (External Integrations)**

#### **US-501: Google Flights 航班資訊整合 (Flight Data Integration)**
* **Priority:** Medium (Sprint 3)

### **🔹 Epic 6: 系統優化與技術債 (Optimization & Technical Debt) 🔥 *New***

#### **US-601: 雙模型 AI 架構優化 (Dual-Model Architecture)**
* **Priority:** Medium (Sprint 3)

#### **US-602: 節點描述 AI 智慧填寫 (AI-Assisted Node Description)**
* **Priority:** Low (Sprint 3)

#### **US-603: 核心產生器升級 (Generator Upgrade) [Completed]**
* **Status:** 已統一 API Key 為 `GEMINI_API_KEY`，並將產生器升級為 Structured Output 模式。

#### **US-604: AI 請求錯誤處理與重試機制 (AI Error Handling & Retry)**
*   **User Story:** 當 AI 服務因負載過重 (503) 或網路問題失敗時，系統應能友善地提示使用者，並提供「重試 (Retry)」按鈕，而非僅顯示錯誤訊息，以提升系統韌性。
*   **Priority:** Medium (Sprint 3)
*   **Story Points:** 3

#### **US-605: AI 外部搜尋工具整合 (Search Tool Integration) 🔥 *New***

* **User Story:** 作為 **旅遊顧問**，我希望 AI Agent 在推薦餐廳或景點時，能主動透過外部搜尋 (如 Google Places API) 獲取即時的營業時間、評價與價格資訊，避免推薦已停業或不符合現況的地點。
* **Priority:** Medium (Sprint 3)
* **Story Points:** 8
* **Acceptance Criteria:**
  1. **即時搜尋:** AI 在處理請求時能自動觸發搜尋工具。
  2. **資訊準確:** 推薦內容需附帶即時來源資訊。
  3. **自動校對:** AI 發現原本計畫的地點已歇業時，需主動提醒並建議替換。

#### **US-606: AI 回應在地化 (AI Response Localization)**
*   **Priority:** Low (Sprint 3)

#### **US-607: 全站 UI/UX 優化 (UI/UX Polish) 🔥 *New***
*   **User Story:** 作為使用者，我希望每個頁面的操作流程（如按鈕位置、回饋提示、載入動畫）都經過打磨，提供流暢且一致的體驗。
*   **Priority:** Medium (Sprint 3)

### **🔹 Epic 7: 平台化與運維 (Platform & Operations) 🔥 *New***

#### **US-701: 導航優化 (Navigation Flow)**
*   **User Story:** 在行程編輯完成後，我希望能方便地跳轉回「需求列表」或「行程列表」，而不是只能按瀏覽器上一頁。
*   **Priority:** High (Sprint 3)

#### **US-702: 行程管理列表 (Itinerary Management List)**
*   **User Story:** 我希望有一個專屬的「行程列表」頁面，讓我能管理所有生成的詳細行程，查看狀態並進行搜尋或刪除。
*   **Priority:** High (Sprint 3)

#### **✅ US-703: 使用者認證與授權 (Auth & Authorization) [Completed]**
* **Status:** 已實作 Supabase Auth (@supabase/ssr) 與 RLS 資料隔離。

#### **US-704: 帳號管理 (Account Management)**
*   **User Story:** 我希望能管理自己的個人資料與修改密碼。
*   **Priority:** Low (Sprint 4)

### **🔹 Epic 8: 安全與合規 (Security & Compliance) 🔥 *New***

#### **US-801: CI/CD Pipeline**
*   **User Story:** 作為開發者，我希望有自動化的測試與部署流程，確保每次推送代碼都不會破壞現有功能。
*   **Priority:** High (Sprint 3)

#### **US-802: 雲端部署 (Cost-Effective Deployment)**
*   **User Story:** 系統應部署在性價比高且安全的雲端環境 (如 Vercel/Railway)，並配置正確的環境變數與安全設定。
*   **Priority:** High (Sprint 3)

#### **US-803: 程式碼安全審計 (Code Security Review)**
*   **User Story:** 在正式上線前，需對程式碼進行全面的安全掃描，修復潛在漏洞。
*   **Priority:** High (Sprint 3)

#### **US-804: Prompt Injection 防護**
*   **User Story:** 需審計所有 AI 互動節點，確保 System Prompt 足夠強健，防止惡意使用者透過輸入欄位操控 AI 行為。
*   **Priority:** High (Sprint 3)

### **🔹 Epic 9: 文件與發布 (Documentation) 🔥 *New***

#### **US-901: 文件與發布 (Documentation & Release)**
*   **User Story:** 需產出 Release Note 與使用者操作手冊，方便交付與教育訓練。
*   **Priority:** Medium (Sprint 4)

## **📊 預估總 Story Points**

* **Sprint 1:** 18 Points (✅ 已全數達成)
* **Sprint 2:** 25 Points (✅ 已全數達成)
* **Sprint 3 (Focus: Platform & Security):** 預估 40+ Points (包含 Auth, Dashboard, CI/CD, Security)