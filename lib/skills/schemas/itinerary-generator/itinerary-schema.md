# Itinerary JSON Schema

The AI must generate a JSON object that strictly adheres to this structure.

```json
{
  "type": "object",
  "properties": {
    "days": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "day": { "type": "integer", "minimum": 1 },
          "date": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
          "activities": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "time_slot": { "enum": ["Morning", "Afternoon", "Evening"] },
                "activity": { "type": "string", "minLength": 1 },
                "description": { "type": "string", "minLength": 1 }
              },
              "required": ["time_slot", "activity", "description"]
            }
          },
          "meals": {
            "type": "object",
            "properties": {
              "breakfast": { "type": "string", "minLength": 1 },
              "lunch": { "type": "string", "minLength": 1 },
              "dinner": { "type": "string", "minLength": 1 }
            },
            "required": ["breakfast", "lunch", "dinner"]
          },
          "accommodation": { "type": "string", "minLength": 1 }
        },
        "required": ["day", "date", "activities", "meals", "accommodation"]
      }
    }
  },
  "required": ["days"]
}
```

```