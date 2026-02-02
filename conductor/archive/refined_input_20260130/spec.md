# Specification: 需求欄位擴充與對話式 AI 補全

## 概述
本 Track 旨在解決當前需求收集的結構化程度不足（缺失出發地、目的地）以及 AI 診斷反饋過於靜態的問題。我們將透過欄位擴充與互動式 UI，讓需求收集過程更像是一位資深顧問在與客戶對談。

## 業務需求
1.  **結構化地點資料**：
    *   新增 `origin` (出發地)：單選字串（如 "台北"）。
    *   新增 `destinations` (目的地)：多選/陣列（如 ["東京", "大阪"]）。
2.  **對話式 AI 診斷 (Conversational Filling)**：
    *   當 `gap-analyzer` 發現缺口時，不只是顯示清單，而是逐條詢問。
    *   使用者可以在診斷視窗中直接輸入答案。
    *   系統將答案自動附加到需求的 `notes` 或更新對應欄位。

## 技術規範
1.  **資料庫**: 執行 Migration 擴充 `requirements` 表。
2.  **Schema**: 更新 `requirementSchema` 與 `gapAnalysisSchema`。
3.  **UI**:
    *   使用 `Select` 或 `Input` 增加地點欄位。
    *   重構 `GapChecklist` 為一個互動式的 **Step-by-Step Wizard**。
4.  **AI Skill**: 優化 `gap-analyzer` 的 Prompt，使其能針對每個缺口生成更具引導性的問題。

## 使用者流程
1.  填寫基本需求（含出發、目的地）。
2.  提交後觸發 AI 診斷。
3.  若有缺口，顯示對話視窗：「我注意到有長輩同行，請問體力狀況如何？」
4.  使用者回答後，AI 繼續問下一題，或點擊「完成」。
5.  所有回答併入需求資料後儲存。
