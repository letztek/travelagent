# Implementation Plan: 個人儀表板與導航流程優化 (Dashboard & Navigation)

## Phase 1: Itinerary List Page (US-702) [checkpoint: 00974ee]
- [x] Task: Implement getItineraries Server Action (a89a4c0)
    - [x] 在 `app/itineraries/actions.ts` 實作獲取使用者行程列表的邏輯。
- [x] Task: Create Itinerary List Page (1a16725)
    - [x] 建立 `app/itineraries/page.tsx`。
    - [x] 實作卡片式清單 UI，支援空狀態處理。
- [x] Task: Conductor - User Manual Verification 'Itinerary List'

## Phase 2: Navigation & Flow Optimization (US-701) [checkpoint: 6e334bf]
- [x] Task: Add Back Navigation to Editors (f0e1179)
    - [x] 在路線編輯器與行程編輯器新增「返回列表」按鈕。
- [x] Task: Update Header & Landing Redirects (9075981)
    - [x] 調整 Header Logo 連結。
    - [x] 確保已登入使用者訪問首頁時能快速進入儀表板。
- [x] Task: Conductor - User Manual Verification 'Nav Flow'

## Phase 3: UI/UX Polish
- [x] Task: Unify List Aesthetics (a88ebf8)
    - [x] 將 `app/requirements/page.tsx` 的視覺風格調整為與新版首頁/登入頁一致。
- [x] Task: Final End-to-End Polish (eb98c65)
- [ ] Task: Conductor - User Manual Verification 'Dashboard Complete'
