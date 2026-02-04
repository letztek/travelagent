# Implementation Plan: 核心產生器升級 (Core Generator Upgrade)

## Phase 1: Environment & Configuration Cleanup [checkpoint: 6011fa3]
- [x] Task: 統一環境變數配置 (ba2c88c)
    - [x] 掃描並替換 `lib/skills/` 中所有 `GOOGLE_GENERATIVE_AI_API_KEY` 為 `GEMINI_API_KEY`。
    - [x] 在 `route-planner.ts` 與 `itinerary-generator.ts` 中引入模型名稱變數 `GEMINI_MODEL_NAME` (Default: `gemini-3-pro-preview`)。

## Phase 2: Upgrade Route Planner (US-103) [checkpoint: e936f58]
- [x] Task: 重構 Route Planner Skill (b9d5daf)
    - [x] 在 `lib/skills/route-planner.ts` 中手動定義對應 `routeConceptSchema` 的 JSON Schema。
    - [x] 更新 `model.generateContent` 設定，啟用 `responseMimeType: "application/json"` 與 `responseSchema`。
    - [x] 移除舊有的 Regex Markdown 清理邏輯。
- [x] Task: 驗證 Route Planner (b9d5daf)
    - [x] 執行並通過 `lib/skills/route-planner.test.ts`。

## Phase 3: Upgrade Itinerary Generator (US-104)
- [ ] Task: 重構 Itinerary Generator Skill
    - [ ] 在 `lib/skills/itinerary-generator.ts` 中手動定義對應 `itinerarySchema` 的 JSON Schema。
    - [ ] 更新 `model.generateContent` 設定，啟用 `responseMimeType: "application/json"` 與 `responseSchema`。
    - [ ] 移除舊有的 Regex Markdown 清理邏輯。
- [ ] Task: 驗證 Itinerary Generator
    - [ ] 執行並通過 `lib/skills/itinerary-generator.test.ts`。

## Phase 4: System Verification
- [ ] Task: Conductor - User Manual Verification 'System Verification' (Protocol in workflow.md)
