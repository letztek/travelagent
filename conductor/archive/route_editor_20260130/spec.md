# Specification: 互動式路線規劃編輯器 (US-103-2)

## 概述
本 Track 旨在增強「路線預覽」頁面的功能，從靜態展示轉變為可互動的編輯器。使用者可以調整城市節點的順序、新增或刪除節點，以便在生成詳細行程前確認最完美的路線骨架。

## 業務需求 (US-103-2)
- **節點排序與管理 (Manual)**：
  - Drag & Drop 調整順序。
  - 新增/刪除節點。
- **AI 協作 (Route Architect Agent)**：
  - **角色定位**: 專注於路線邏輯與架構，不處理詳細時間表或餐廳細節。
  - **對話介面**: 允許自然語言指令（如「Day 3 太空了，加個點」）。
  - **建議模式 (Proposal Mode)**: AI 的修改不會直接生效，而是呈現「預覽」與「紅綠燈評估」，需使用者確認。
  - **邏輯檢查 (Traffic Light)**:
    - 🟢 Green: 路線順暢，邏輯合理。
    - 🔴 Red: 存在問題（如拉車太遠、動線回頭），需附上警告理由。
- **狀態控制**:
  - **Undo/Redo**: 支援操作還原，提升編輯信心。

## 技術規範
- **前端套件**: `@dnd-kit/core` (拖拉), `lucide-react` (Icons).
- **AI 模型**: **Gemini 1.5 Flash** (或更高版本)。
- **AI 整合**:
  - 必須使用 **Gemini API Structured Output (`responseSchema`)** 以確保 JSON 格式精確。
  - Server Action 需回傳包含 `thought`, `analysis` (status/message), `proposed_route` 的完整結構。
- **資料流**:
  - `RouteEditor` 管理 `history` (Undo Stack) 與 `currentRoute`。
  - `ChatInterface` 管理 `proposal` (待確認狀態)。

## 使用者流程
1.  **手動操作**: 使用者拖拉節點 ➔ 直接更新 State ➔ Push to History。
2.  **AI 操作**:
    - 使用者輸入：「Day 2 加入睡魔之家」。
    - AI 回傳 Proposal (含修改後的 Route + 綠燈評價)。
    - 介面顯示：「建議加入睡魔之家 (綠燈：順路)」。
    - 使用者點擊 **[Accept]** ➔ 更新 State ➔ Push to History。
3.  **後悔**: 使用者點擊 **[Undo]** ➔ 回復上一步狀態。
4.  **提交**: 點擊「確認並生成詳細行程」。
