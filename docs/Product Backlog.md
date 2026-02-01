# **Product Backlog: AI 智慧旅遊業務助理 (TravelAgent)**

**專案名稱:** AI 智慧旅遊業務助理系統 (TravelAgent)

**文件版本:** 1.1

**更新日期:** 2024-06-25

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

* **Sprint 1 (Focus: Get it Done):** 建立基礎設施，完成從「輸入」到「詳細行程」再到「Word 交付」的核心閉環。  
* **Sprint 2 (Focus: Make it Smart):** 導入 AI 智慧建議（缺口偵測、路線預覽、總結回饋）與簡報 Prompt 生成，優化體驗與美感。

## **📋 待辦清單詳情 (Backlog Items)**

### **🔹 Epic 1: 需求輸入與分析 (Input & Analysis)**

#### **US-101: 客戶需求結構化輸入表單**

* **User Story:** 作為 **旅遊顧問**，我希望有一個表單介面，讓我能手動輸入客戶的基本需求（如日期、人數、預算、偏好），以確保資料的結構化與正確性。  
* **Priority:** Highest (Sprint 1\)  
* **Story Points:** 2  
* **Acceptance Criteria:**  
  1. 表單欄位需包含：旅遊區間、總人數、旅客結構（成人/長輩/兒童/嬰兒）、人均預算範圍。  
  2. 提供「飲食禁忌」與「住宿偏好」選單。  
  3. 包含「自由備註」文字框，供填寫特殊需求（如：慶生、求婚、無障礙）。  
  4. 輸入完成後，資料需以 JSON 格式暫存於前端或寫入資料庫。  
* **INVEST Check:** Small (單純表單), Independent.

#### **US-102: 資訊缺口偵測與提問 (AI Gap Analysis)**

* **User Story:** 作為 **旅遊顧問**，在填寫完需求後，我希望 AI **不要立刻生成行程**，而是先分析我輸入的內容，提醒我「是否遺漏了重要資訊」（如長輩的無障礙需求），以利後續規劃。  
* **Priority:** High (Sprint 2\)  
* **Story Points:** 3  
* **Acceptance Criteria:**  
  1. 系統能根據輸入資料調用 LLM 進行邏輯檢查。  
  2. **情境測試 A:** 輸入「有 70 歲長輩」但未填寫「健康狀況」-\> AI 提示：「建議詢問長輩行走能力與飲食軟硬度需求。」  
  3. **情境測試 B:** 輸入「去高山」但未填寫「月份/裝備」-\> AI 提示：「建議確認季節與禦寒裝備需求。」  
  4. 顧問可點擊「忽略」直接進入行程生成，或點擊「返回」補充資訊。  
* **INVEST Check:** Valuable (避免 GIGO), Testable (有明確輸入輸出邏輯).

### **🔹 Epic 2: 行程規劃與編輯 (Planning & Editing)**

#### **US-103: 初步行程概念與路線預覽 (Preliminary Route Concept) 🔥 *New***

* **User Story:** 作為 **旅遊顧問**，在生成詳細表格前，我希望先看到一個「高層次的路線概念與順序」，讓我能快速確認或調整大方向（如順時針/逆時針、城市順序），避免細節生成後才發現方向錯誤。  
* **Priority:** High (Sprint 2\)  
* **Story Points:** 3  
* **Acceptance Criteria:**  
  1. **概念生成:** AI 生成一段簡短的路線邏輯描述（例：「採『逆時針』環島路線，不走回頭路，效率最高。」）。  
  2. **節點視覺化:** 顯示城市/重點區域的流向（例：「高松進 ➔ 琴平 ➔ 松山 ➔ 高知 ➔ 高松出」）。  
  3. **可編輯性:** 提供文字編輯框，顧問可直接修改路線順序或描述文字。  
  4. **確認機制:** 點擊「確認並生成詳細行程」按鈕後，才觸發下一階段的詳細排程 (US-104)。  
* **INVEST Check:** Valuable (節省來回修改時間), Negotiable.

#### **US-104: 結構化行程生成 (Itinerary Generation)**

* **User Story:** 作為 **旅遊顧問**，我希望系統根據確認後的路線概念，生成一份類似「表格檢視」的詳細行程，包含日期、住宿、活動、三餐資訊。  
* **Priority:** Highest (Sprint 1\)  
* **Story Points:** 8  
* **Acceptance Criteria:**  
  1. 系統後端能根據需求與確認後的路線 Prompt 調用 LLM 生成 JSON 格式行程資料。  
  2. 生成內容需對應 *Taiwan High Mountain* 範本結構：  
     * **Date:** 日期與星期  
     * **Time Slot:** 早/午/晚  
     * **Activity:** 景點名稱 \+ 簡短說明  
     * **Meals:** 早餐/午餐/晚餐 (需標註餐廳類型或自理)  
     * **Accommodation:** 飯店名稱  
  3. 行程邏輯需符合地理順序。  
* **INVEST Check:** Valuable (核心功能), Estimable.

#### **US-105: 直覺式行程編輯與 Word 匯出 (Interactive Editing & Export)**

* **User Story:** 作為 **旅遊顧問**，我想要在介面上直接拖拉調整景點順序、修改文字，並能將最終結果匯出成 Word 文件 (Docx)，且能選擇語言版本。  
* **Priority:** High (Sprint 1\)  
* **Story Points:** 8  
* **Acceptance Criteria:**  
  1. **UI 操作:** 支援 Drag & Drop（調整順序）與 Inline Edit（修改內容）。  
  2. **匯出功能:** 點擊「匯出 Word」按鈕，瀏覽器自動下載 .docx 檔案。  
  3. **Word 格式:** 需包含基本的行程表 (Table)，排版整齊。  
  4. **語言轉換 (新功能):** 匯出時提供選項，若行程原始內容包含英文，可選擇「翻譯為繁體中文」或「保留原文/雙語對照」輸出。  
* **INVEST Check:** Negotiable.

#### **US-106: AI 行程總結與優化建議 (AI Final Review)**

* **User Story:** 作為 **旅遊顧問**，在行程排定後，我希望有一個獨立區塊顯示「AI 對這份行程的看法」，提供邏輯檢查或亮點總結。  
* **Priority:** Medium (Sprint 2\)  
* **Story Points:** 3  
* **Acceptance Criteria:**  
  1. 介面側邊或底部顯示 "AI Review" 區塊。  
  2. 內容包含：  
     * **紅燈 (Alert):** 邏輯警告（如：拉車時間過長、景點休館日衝突）。  
     * **綠燈 (Highlight):** 行程亮點話術（如：兼顧了自然景觀與人文體驗）。  
* **INVEST Check:** Small, Valuable.

### 🔹 Epic 3: 交付物生成 (Final Delivery)

#### US-107: 外部簡報工具 Prompt 生成 (Presentation Prompt Generation)

* **User Story:** 作為 **旅遊顧問**，我想要一鍵生成「針對簡報工具（如 Gamma/Seede）優化的 Prompt」，以便我複製貼上後，能快速產出包含「視覺情境描述」與「精簡文字」的行前說明會投影片。  
* **Priority:** High (Sprint 2\)  
* **Story Points:** 3  
* **Acceptance Criteria:**  
  1. **Prompt 結構化:** 輸出格式符合 Gamma/Seede 的 "Card" 或 "Outline" 模式要求。  
  2. **視覺指令 (Visual Prompting):** 針對每個景點自動生成英文 Image Prompt（如參考範例：*Sunrise at Alishan, sea of clouds, cinematic lighting, photorealistic*）。  
  3. **文字濃縮:** 將 Word 版的詳細行程自動摘要為 Bullet Points，適合 PPT 閱讀。  
  4. 提供「一鍵複製」按鈕。  
* **INVEST Check:** Valuable (連結最終交付), Independent.

### 🔹 Epic 4: 高階編輯與管理 (Advanced Management) 🔥 *New*

#### US-401: 行程天數調整與排序 (Day Management)

* **User Story:** 作為 **旅遊顧問**，我希望能夠調整整天的先後順序（例如將 Day 2 與 Day 3 對調），而不需要手動移動每個活動。
* **Priority:** Medium
* **Story Points:** 5
* **Acceptance Criteria:**
  1. 提供整天移動（上移/下移）的按鈕或拖拉手柄。
  2. 移動天數後，系統需自動更新日期與行程內容。

#### US-402: 剪下/複製/貼上與遠距離移動 (Clipboard & Jump Move)

* **User Story:** 作為 **旅遊顧問**，當行程很長時，我不希望長距離拖拉活動，我希望能透過選單將活動從 Day 2 直接移動到 Day 10。
* **Priority:** Medium
* **Story Points:** 5
* **Acceptance Criteria:**
  1. 每個活動卡片提供「移動到特定天數/時段」的選單。
  2. 支援活動的複製與貼上。

## **📊 預估總 Story Points**

* **Sprint 1:** 18 Points (涵蓋 US-101, US-104, US-105)  
* **Sprint 2:** 12 Points (涵蓋 US-102, US-103, US-106, US-107)  
* **Total:** 30 Points