# Prompt Engineering

In the TravelAgent system, the field that most profoundly affects the AI's output is the **"Special Notes"** (特殊需求 / 備註) field in the "Create Requirement" form.
Treat this field as if you are delegating a task to a junior assistant. The more specific you are, the closer the AI's output will be to your expectations.

## Tip 1: Specify Style and Tone
The AI's default tone is "professional and clear," but you can force it to change via the notes.
*   **❌ Poor**: Plan a honeymoon.
*   **✅ Recommended**: This is a honeymoon trip. Please use an extremely romantic and ceremonial tone in the itinerary descriptions, and schedule dinners at restaurants with great ambiance every night.

## Tip 2: Strictly Limit Activity Scope
If the client has specific physical limitations or strong preferences, state them clearly.
*   **❌ Poor**: With seniors, don't make it too tiring.
*   **✅ Recommended**: Accompanied by a 70-year-old senior in a wheelchair. All attractions MUST be flat ground with perfect accessibility facilities. Absolutely DO NOT schedule any hikes or stairs requiring more than 10 minutes of walking. You MUST schedule a 2-hour afternoon rest back at the hotel every day.

## Tip 3: Give Instructions for Specific Days
You can give special instructions for specific days in the itinerary, and the AI will understand and comply.
*   **✅ Recommended**:
    *   Day 2 is the wife's birthday. Dinner MUST be scheduled at a high-end Michelin French restaurant, and note "Birthday Surprise Arrangement" in the description.
    *   Day 4 the client wants to shop all day in Harajuku and Omotesando. Do not schedule any specific sightseeing spots; just leave it blank and write "Full day free shopping time".

## Synergize with "High-Level Route Planning"
Although you can control the AI through notes, we still highly recommend utilizing the system's second phase: the **"Route Editor"**.
If a client explicitly says "I MUST stay in Hakone on the third day", simply change the location of the Day 3 node to "Hakone" in the Route Editor. This is far more effective at "forcing" the AI to comply than just writing it in the notes (because the system has a strict Verifier sub-agent built specifically to enforce the route).