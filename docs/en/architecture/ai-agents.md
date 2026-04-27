# AI & Sub-agent Mechanism

The core value of this system lies in orchestrating multiple specialized AI Agents (built on Gemini) through a multi-step data pipeline to produce high-quality itinerary proposals. These logics are centralized in the `travelagent/lib/skills/` directory.

## 🤖 Core AI Skills (Agent Modules)

### 1. `import-parser.ts` (File Import Parser)
*   **Purpose**: Processes user-uploaded PDFs, images, or raw text.
*   **Mechanism**: Utilizes the Gemini Flash model's multimodal capabilities to accurately extract unstructured travel brochures or notes into structured JSON data conforming to the `Itinerary` or `Requirement` Zod Schema.

### 2. `gap-analyzer.ts` (AI Gap Diagnostic)
*   **Purpose**: Checks for missing information or logical conflicts in the user's requirements before the actual planning begins.
*   **Mechanism**: Analyzes the input. If it finds issues like "arriving at the airport but missing arrival time" or "elderly travelers included but scheduled a high-intensity hike", it returns structured `missing_info` and `logic_issues`. The frontend renders this as a Gap Wizard questionnaire for the travel agent to complete.

### 3. `route-planner.ts` (High-Level Route Planner)
*   **Purpose**: Determines the "macro direction and accommodation locations" for each day, without dealing with specific attractions.
*   **Mechanism**: Considers airport locations, total days, and destinations to produce a `RouteConcept` consisting of `nodes` (days) and `edges` (transportation), ensuring geographical logic.

### 4. `itinerary-generator.ts` (Detailed Itinerary Generator)
*   **Purpose**: Fills in the detailed attractions and restaurants for morning/afternoon/evening based on the requirements and the high-level route.
*   **Mechanism & RAG Integration**:
    *   **Favorites Injection (RAG)**: Before generation, it queries the user's `user_favorites` and feeds these locations to the AI via Context Injection, forcing the AI to prioritize these "pocket list" spots.
    *   **Geographic Accuracy & Grounding**: By connecting to the Google Places API to retrieve actual coordinates and opening hours, and utilizing Gemini's Grounding Tool, it ensures the generated spots actually exist and are within reasonable travel distances.

### 5. `itinerary-verifier.ts` (Adherence & Logic Verifier Sub-agent)
*   **Purpose**: Acts as the last line of defense to check if the AI-generated final result violates the user's original instructions or real-world logic.
*   **Mechanism**:
    1.  **Entity Verification**: Cross-references the opening hours returned by Google Places. If a scheduled attraction is closed on that specific day, it issues a warning.
    2.  **Route Adherence Check**: Boots up a smaller validation Agent to verify that the final itinerary hasn't "completely deviated" from the cities decided by the `route-planner`. If a major deviation is detected (e.g., planned for Tokyo, but went to Osaka), the Verifier rejects the output, triggers an auto-correction loop (Retry/Correction Loop), and attaches a `correctionPrompt` asking the generator to readjust.