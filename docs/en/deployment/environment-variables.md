# Environment Variables

The system relies on several external services (Supabase, Google Gemini, Google Places), so correctly configuring environment variables is critical for the system to function.

An `.env.example` file is provided in the project. For local development, copy it and rename it to `.env.local`. **Do NOT commit `.env.local` to version control.**

Below are the detailed descriptions for each variable:

## 🗄️ Supabase Configuration
Allows the frontend and server to access your Supabase project.

*   `NEXT_PUBLIC_SUPABASE_URL`
    *   **Description**: Your Supabase project URL.
    *   **How to get**: Supabase Dashboard -> Project Settings -> API -> Project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   **Description**: The public API key used by the client (browser). It is restricted by Row Level Security (RLS).
    *   **How to get**: Supabase Dashboard -> Project Settings -> API -> Project API Keys (anon public).
*   `SUPABASE_SERVICE_ROLE_KEY`
    *   **Description**: A secret key with superuser privileges that bypasses RLS. Use ONLY in server-side code (Server Actions / API Routes). **Never expose this key.**
    *   **How to get**: Supabase Dashboard -> Project Settings -> API -> Project API Keys (service_role secret).

## 🧠 AI and Maps Services
Used for itinerary generation and location queries.

*   `GEMINI_API_KEY`
    *   **Description**: The API key used by the main application to call Google Gemini models.
    *   **How to get**: [Google AI Studio](https://aistudio.google.com/app/apikey).
*   `GOOGLE_GENERATIVE_AI_API_KEY`
    *   **Description**: The API key used by some internal scripts or for backwards compatibility (usually the same as `GEMINI_API_KEY`).
*   `GEMINI_PRIMARY_MODEL`
    *   **Description**: The primary model called by the system.
    *   **Default**: `gemini-3-flash-preview` or `gemini-2.5-flash`.
*   `GEMINI_FALLBACK_MODEL`
    *   **Description**: The fallback model used if the primary model is overloaded or fails.
    *   **Default**: `gemini-2.5-flash`.
*   `GOOGLE_PLACES_API_KEY`
    *   **Description**: Google Maps API key used for verifying places, fetching opening hours, and coordinates during route planning and generation.
    *   **How to get**: Google Cloud Console -> Enable Places API (New) and create credentials.

## ⚙️ Application Settings
*   `NEXT_PUBLIC_SITE_URL`
    *   **Description**: The main URL of the website. Used for email invitation links, login redirects, etc.
    *   **Default**: Use `http://localhost:3000` for local development. Use your actual domain (e.g., `https://travelagent.yourdomain.com`) in production.