# Route Concept JSON Schema

The AI must generate a JSON object that strictly adheres to this structure.

```json
{
  "type": "object",
  "properties": {
    "nodes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "day": { "type": "integer", "minimum": 1 },
          "location": { "type": "string", "description": "City or major area name (e.g., Tokyo, Kyoto)" },
          "description": { "type": "string", "description": "Brief summary of activity/theme for this location" },
          "transport": { "type": "string", "description": "Main transport mode to reach here (e.g., Flight, Shinkansen)" }
        },
        "required": ["day", "location", "description"]
      }
    },
    "rationale": { "type": "string", "description": "Reasoning behind this route (e.g., efficient loop, seasonal highlights)" },
    "total_days": { "type": "integer", "minimum": 1 }
  },
  "required": ["nodes", "rationale", "total_days"]
}
```
