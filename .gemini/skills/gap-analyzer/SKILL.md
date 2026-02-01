---
name: gap-analyzer
description: Analyze travel requirements for missing information or logical inconsistencies. Use this skill before generating an itinerary to ensure all necessary details are present.
---

# Gap Analyzer Skill

This skill detects information gaps and logical inconsistencies in client travel requirements.

## Workflow

1.  **Analyze Input**: Review the `Requirement` JSON object.
2.  **Check Completeness**: Identify missing critical fields (e.g., senior travelers but no accessibility preferences).
3.  **Check Consistency**: Identify logical conflicts (e.g., "Camping" accommodation with "Infant" traveler, budget mismatch).
4.  **Generate Report**: Produce a structured JSON report using the [Gap Analysis Schema](references/gap-analysis-schema.md).

## Logic Guidelines

-   **Senior / Accessibility**: If seniors are present, check for 'accessibility' or 'walking difficulty' notes.
-   **Infant / Equipment**: If infants are present, check for 'crib', 'stroller', or 'car seat' needs.
-   **Dietary**: If "Vegetarian" or "Vegan" is selected, ensure no conflicting restaurant requests in notes.
-   **Budget**: Check if the budget range aligns reasonably with the requested duration and accommodation type (heuristic).
-   **Location / Season**: If destination implies extreme weather (e.g., mountains, winter), check for gear mentions.

## Output Constraints

-   **Format**: Pure JSON only.
-   **Structure**: Must follow the defined schema strictly.
-   **Tone**: Suggestions should be polite and professional, suitable for a travel consultant to ask a client.