# Client Requirement Schema

This is the structure of the input data provided to the generator.

```json
{
  "type": "object",
  "properties": {
    "origin": { "type": "string" },
    "destinations": { "type": "array", "items": { "type": "string" } },
    "travel_dates": {
      "type": "object",
      "properties": {
        "start": { "type": "string" },
        "end": { "type": "string" }
      }
    },
    "travelers": {
      "type": "object",
      "properties": {
        "adult": { "type": "integer" },
        "senior": { "type": "integer" },
        "child": { "type": "integer" },
        "infant": { "type": "integer" }
      }
    },
    "budget_range": { "type": "string" },
    "preferences": {
      "type": "object",
      "properties": {
        "dietary": { "type": "array", "items": { "type": "string" } },
        "accommodation": { "type": "array", "items": { "type": "string" } }
      }
    },
    "notes": { "type": "string" }
  }
}
```
