# Specification: 互動式行程細節規劃師 (Activity Planner Agent)

## 概述
本 Track 旨在實作 **行程細節規劃師 (Activity Planner Agent)**，這是一個整合在詳細行程編輯器中的 AI 協作助手。允許顧問透過點擊特定行程元素建立上下文，並透過對話進行快速調整、推薦與邏輯檢查。

## 業務需求 (US-105-2)
1.  **上下文感知的對話輔助**: 使用者可直接點擊畫面上的行程卡片，將 AI 的注意力鎖定在該項目上（例如點擊「第一天晚餐」後問「推薦這附近的餐廳」）。
2.  **彈性調整能力**: 雖專注於細節填充（餐廳、景點），但**必須支援**使用者臨時提出的跨城市移動或地點變更需求，不應強制使用者跳轉頁面。
3.  **即時邏輯檢查 (紅綠燈)**: AI 在提供建議時需同步評估合理性，並以紅/綠燈顯示。
4.  **建議與確認機制**: AI 的修改需先呈現為「預覽提案」，待使用者點擊「套用」後才正式寫入行程。

## 技術規範
-   **UI 元件**:
    -   `ItineraryAgentChat`: 右側全域側邊欄。
    -   `ContextHighlight`: 當點擊行程項目時，自動建立 Highlight 並同步狀態至 Sidebar。
-   **AI 模型**: 使用 **Gemini 3.0 Flash/Pro Preview** (透過環境變數配置)。
-   **資料流**:
    -   使用 `useHistory` 管理編輯器狀態，確保 AI 的修改可被還原 (Undo)。
    -   Server Action `refineItineraryWithAI` 接收 `currentItinerary`, `focusContext`, `instruction` 並回傳結構化 JSON。

## 使用者流程
1.  進入 `/itineraries/[id]` 詳細行程編輯頁面。
2.  點擊「Day 2 下午」的活動卡片。
3.  **UI 回饋**: 卡片邊框變色，側邊欄顯示「正在處理：Day 2 下午」。
4.  在對話框輸入：「這段時間我想改去附近適合拍照的咖啡廳」。
5.  AI 回傳建議清單與紅綠燈評估。
6.  使用者點擊 **[套用變更]**，行程表自動更新。

## 範圍外 (Out of Scope)
-   即時外部 API 搜尋 (Reserved for US-605)。
