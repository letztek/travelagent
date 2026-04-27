# Next.js Core Logic & Architecture

The frontend and backend of this system are built entirely on the **Next.js (App Router)** framework. We heavily leverage the latest React features (such as Server Components and Server Actions) to achieve an efficient and secure human-in-the-loop workflow.

## 🗂️ Project Structure (App Router)

The main application resides in the `travelagent/app/` directory:

*   `/app/login` & `/app/signup`: Authentication pages.
*   `/app/admin`: Exclusive interface for System Administrators (generating invite links, viewing Audit Logs).
*   `/app/requirements`: Travel requirement collection module.
    *   `/new`: Create new requirements (supports manual entry and file imports).
    *   `/[id]/gap`: AI Diagnostic (Gap Wizard) interface.
    *   `/[id]/route`: Route editing and preview page.
*   `/app/itineraries`: List of generated itineraries and the detailed itinerary editor.
*   `/app/favorites`: Personal "Favorites" list management for travel agents.

## ⚡ Server Actions and Data Flow

To improve performance and security, the system extensively uses **Server Actions** (`"use server"`) to communicate with Supabase and AI models, bypassing traditional API Routes.

### Handling Large File Imports (`FormData`)
In `/app/requirements/new/components/ImportWizard.tsx`, users can upload PDFs or images to parse existing itineraries.
**Technical Challenge**: When passing large objects or Base64 files to Server Actions, Next.js often hits serialization limits (throwing `"Only plain objects..."` or payload too large errors).
**Solution**: We convert files to Base64 on the client, pack them using the native `FormData` API, and send them to the `parseImportData` action, parsing them manually on the server. This effectively bypasses the React Server Components (RSC) depth serialization issues.

## 🛡️ Data Validation (Zod Schema)
All data structures—whether passed between client and server or generated as JSON by the AI—must pass strict validation using `Zod`. This ensures data type safety and consistency across the system.

Schemas are centralized in the `travelagent/schemas/` directory:
*   `requirement.ts`: Defines the format of the travel request.
*   `route.ts`: Defines the AI-planned route structure (Nodes & Edges).
*   `itinerary.ts`: Defines the final daily detailed itinerary and activities format.
*   `gap-analysis.ts`: Defines the format for missing info and logic issues returned by the AI diagnostic.