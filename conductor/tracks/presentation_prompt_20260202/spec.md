# Specification: 外部簡報工具 Prompt 生成 (US-107)

## 概述
本 Track 旨在實作「簡報 Prompt 生成器」，將詳細行程轉化為高品質的「結構化 Markdown」，供 Gamma/Seede 等 AI 工具生成視覺化簡報。設計風格參考高端旅遊提案 (High-End Proposal)，強調視覺體驗與重點聚焦。

## 業務需求 (US-107)
1.  **一鍵生成**: 在行程編輯器中提供按鈕，點擊後自動調用 AI 生成 Prompt 並顯示於彈窗。
2.  **高品質結構 (High-End Structure)**:
    *   **Cover**: 標題、日期、Slogan。
    *   **Daily Summaries**: 每日行程摘要 (Morning/Afternoon/Evening) + 住宿。
    *   **Spotlights (關鍵差異)**: AI 自動挑選行程中所有具備吸引力的重點景點 (Highlights)，製作獨立特寫頁面 (包含 "Culture Spotlight", "City Spotlight" 等標籤)。
    *   **Assurance**: 結尾標準頁 (保險、交通、聯絡)。
3.  **視覺引導 (Image Prompts)**: 針對每一頁投影片，自動生成對應的英文圖像描述指令，確保 AI 配圖精準。
4.  **內容優化**: AI 需將行程細節濃縮為適合簡報閱讀的精簡文字 (Bullet Points)。

## 技術規範
-   **UI 元件**:
    -   `PresentationPromptDialog`: 包含生成的文字區域與 [複製] 按鈕。
    -   整合至 `ItineraryEditor` 的 Header 區域。
-   **AI 模型**: 使用 **Gemini 3.0 Pro** (因涉及摘要與創意撰寫，建議使用 Pro 模型)。
-   **Server Action**: `generatePresentationPrompt`。
    -   輸入: `Itinerary` JSON。
    -   輸出: Markdown String。

## 使用者流程
1.  在行程編輯器點擊 [匯出簡報 Prompt]。
2.  系統顯示 "正在為您撰寫提案故事..." (Loading)。
3.  彈出視窗顯示生成的 Markdown。
4.  使用者點擊 [複製內容]。
5.  (使用者操作) 前往 Gamma 選擇 "Paste Text" -> "Markdown"，貼上並生成。

## 驗收標準
1.  生成的 Markdown 結構必須包含 Cover, Daily, Spotlights, Closing 四大區塊。
2.  Spotlight 頁面需包含 "Must See" 或 "Experience" 等亮點描述。
3.  每頁均包含 `![Image Prompt: ...]` 格式的指令。
4.  複製功能在主流瀏覽器上運作正常。
