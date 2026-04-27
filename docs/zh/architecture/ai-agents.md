# AI 與 Sub-agent 運作機制

本系統的核心價值在於協調多個專責的 AI Agent（基於 Gemini 建立），透過多步驟的處理與資料傳遞，產出高質量的行程建議。這些邏輯集中實作於 `travelagent/lib/skills/` 目錄中。

## 🤖 核心 AI Skills (Agent 模組)

### 1. `import-parser.ts` (檔案匯入解析器)
*   **用途**：處理使用者上傳的 PDF、圖片或純文字。
*   **機制**：利用 Gemini Flash 模型的跨模態 (Multimodal) 能力，將非結構化的旅遊手冊或筆記，精準轉換為符合 `Itinerary` 或 `Requirement` Zod Schema 的 JSON 資料。

### 2. `gap-analyzer.ts` (AI 需求診斷)
*   **用途**：在正式排行程前，檢查使用者需求是否有遺漏或邏輯衝突。
*   **機制**：分析輸入資料，若發現「抵達機場但沒說幾點」、「長輩隨行但安排了高強度登山」，會回傳結構化的 `missing_info` 與 `logic_issues`，供前端渲染為 Gap Wizard 問卷讓顧問補齊。

### 3. `route-planner.ts` (路線規劃師)
*   **用途**：決定整趟旅程「每一天的大方向與住宿點」，不處理細部景點。
*   **機制**：考量機場位置、總天數與目的地，產出由 `nodes` (天數節點) 與 `edges` (移動方式) 組成的 `RouteConcept`，確保大方向的地理邏輯正確。

### 4. `itinerary-generator.ts` (細部行程產生器)
*   **用途**：根據前面的需求與大路線，填補每天早/午/晚的詳細景點與餐廳。
*   **機制與 RAG 整合**：
    *   **最愛名單注入 (Favorites RAG)**：生成前，會先查詢使用者收藏的 `user_favorites`，並將這些地點透過 Context Injection 餵給 AI，強制 AI 優先將這些「私房景點」排入行程。
    *   **地理精準度與 Grounding**：透過串接 Google Places API 取得真實的經緯度與營業資訊，並利用 Gemini 的 Grounding Tool，確保 AI 產出的景點是真實存在且具合理距離的。

### 5. `itinerary-verifier.ts` (遵循度與邏輯檢查員 Sub-agent)
*   **用途**：作為最後一道防線，檢查 AI 生成的最終結果是否違背使用者的原始指令或現實邏輯。
*   **機制**：
    1.  **實體驗證**：交叉比對 Google Places 傳回的營業時間 (Opening Hours)，若發現排定的景點當天公休，會發出警告。
    2.  **路線遵循檢查**：啟動一個小型的檢驗 Agent，核對最終行程有沒有「完全偏離」 `route-planner` 決定的城市。若發現重大偏離（例如規劃在東京，卻跑去大阪），Verifier 會退回產出，啟動自動修正 (Retry/Correction Loop)，並附上 `correctionPrompt` 要求生成器重新調整。