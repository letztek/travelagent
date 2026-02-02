---
name: route-planner
description: Plan a high-level route skeleton (Route Concept) based on travel requirements. Use this skill to determine city sequence and logic before generating detailed activities.
---

# Route Planner Skill

This skill designs the optimal sequence of cities and regions for a trip.

## Workflow

1.  **Analyze Logic**: Determine the best entry/exit points and direction (e.g., clockwise vs counter-clockwise) based on `origin` and `destinations`.
2.  **Optimize Flow**: Ensure the route minimizes travel time and avoids backtracking.
3.  **Generate Concept**: Create a day-by-day node list focusing on "Where" and "How" (Transport), not "What" (Specific spots).
4.  **Output JSON**: Produce a JSON response using the [Route Concept Schema](references/route-concept-schema.md).

## Planning Principles

-   **Efficiency**: Prioritize Shinkansen/High-speed rail hubs.
-   **Balance**: Don't change hotels every single night if possible (unless it's a road trip).
-   **Feasibility**: Ensure travel distances are realistic.

## Output Constraints

-   **Format**: Pure JSON only.
-   **Structure**: Must follow the defined schema.
-   **Language**: Traditional Chinese (繁體中文).