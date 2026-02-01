# Gap Analysis JSON Schema

The AI must generate a JSON object that strictly adheres to this structure.

```json
{
  "type": "object",
  "properties": {
    "missing_info": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": { "type": "string", "description": "The field related to the missing info (e.g., 'travelers.senior', 'preferences')" },
          "issue": { "type": "string", "description": "Description of what is missing" },
          "suggestion": { "type": "string", "description": "A polite question to ask the user to fill this gap" },
          "severity": { "enum": ["low", "medium", "high"] }
        },
        "required": ["field", "issue", "suggestion", "severity"]
      }
    },
    "logic_issues": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": { "type": "string" },
          "issue": { "type": "string", "description": "Description of the logical inconsistency" },
          "suggestion": { "type": "string", "description": "Suggestion on how to resolve it" },
          "severity": { "enum": ["low", "medium", "high"] }
        },
        "required": ["field", "issue", "suggestion", "severity"]
      }
    },
    "overall_status": {
      "enum": ["ready", "needs_info", "critical_issues"],
      "description": "ready: Good to go. needs_info: Missing non-critical details. critical_issues: Cannot proceed meaningfully."
    }
  },
  "required": ["missing_info", "logic_issues", "overall_status"]
}
```
