---
name: itinerary-generator
description: Generate structured travel itineraries from client requirements. Use this skill when requested to create a detailed travel plan that must follow a specific JSON schema for backend processing.
---

# Itinerary Generator Skill

This skill guides the generation of structured travel itineraries.

## Workflow

1.  **Analyze Requirements**: Review the client's travel dates, group structure (adults, seniors, children, infants), budget range, and preferences.
2.  **Plan Route**: Design a geographically logical route that avoids backtracking and optimizes travel time.
3.  **Generate JSON**: Produce a JSON response that strictly adheres to the [Itinerary JSON Schema](references/itinerary-schema.md).

## Output Constraints

-   **Format**: Pure JSON only. Do not include Markdown blocks (e.g., ```json) or preamble/postamble text.
-   **Structure**: Must contain a top-level `days` array.
-   **Validation**: Every field defined in the schema is required.

## Example Trigger

"Generate a 3-day itinerary for a family of 4 visiting Tokyo in June with a mid-range budget."