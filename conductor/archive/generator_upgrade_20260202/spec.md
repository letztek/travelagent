# Specification: 核心產生器升級 (Core Generator Upgrade)

## 概述
本 Track 旨在將專案中的核心 AI 生成邏輯（行程生成器與路線規劃器）升級為使用 Google Gemini API 的 **Structured Output (`responseSchema`)** 技術。這將取代現有的「Prompt 引導 + Regex 清理」模式，提供由 API 底層保證的 JSON 格式穩定性。同時，本任務將統一專案中的環境變數命名規範。

## 業務需求 (US-603)
1.  **提升生成穩定性**: 消除因 AI 回傳 Markdown 標記或非標準 JSON 格式導致的解析錯誤。
2.  **統一配置管理**: 整合散落在各處的 API Key 變數，降低維運與部署的複雜度。

## 技術規範

### 1. 環境變數統一
-   **目標**: 廢除 `GOOGLE_GENERATIVE_AI_API_KEY`，全站統一使用 `GEMINI_API_KEY`。
-   **範圍**: 掃描所有 `lib/skills/` 下的檔案並更新讀取邏輯。

### 2. Structured Output 升級
針對 `itinerary-generator.ts` (US-104) 與 `route-planner.ts` (US-103) 執行以下重構：
-   **Schema 定義**: 在程式碼中手動定義對應 Zod Schema 的 `responseSchema` 物件（不依賴第三方轉換套件）。
-   **API 設定**: 在 `generationConfig` 中指定 `responseMimeType: "application/json"` 與 `responseSchema`。
-   **邏輯簡化**: 移除舊有的 `text.replace(...)` Markdown 清理代碼，直接使用 `JSON.parse`。

### 3. 模型設定參數化
-   引入 `GEMINI_MODEL_NAME` 環境變數（預設值維持 `gemini-3-pro-preview` 或現有設定），保留未來切換模型的彈性。

## 驗收標準 (Acceptance Criteria)
1.  **功能回歸測試**:
    -   「規劃路線」功能 (US-103) 產出結果正常。
    -   「生成詳細行程」功能 (US-104) 產出結果正常。
2.  **代碼品質**:
    -   `lib/skills` 目錄下不再包含 Regex 清理 JSON 的邏輯。
    -   全站不再引用 `GOOGLE_GENERATIVE_AI_API_KEY`。
3.  **單元測試**: 相關 Skill 的單元測試需全數通過。

## 範圍外 (Out of Scope)
-   更改 AI 輸出的資料結構或業務邏輯（僅做技術底層替換）。
-   實作新的 AI 功能。
