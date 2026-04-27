# Local Setup Guide

This guide will walk you through running the TravelAgent system on your local machine for development and testing.

## Prerequisites
- **Node.js**: Version v18.17 or newer (LTS recommended)
- **Package Manager**: npm (built into Node.js), pnpm, or yarn
- **Git**: For version control

## Step 1: Clone the Repository
First, clone the project from GitHub to your computer and navigate to the `travelagent` subdirectory (which is the root of the Next.js application):

```bash
git clone <your-repository-url>
cd TravelAgent/travelagent
```

## Step 2: Install Dependencies
We use npm for package management. Run the following command in the `travelagent` directory:

```bash
npm install
```

This will install Next.js, Tailwind CSS, shadcn/ui, Supabase Client, Gemini SDK, and all other necessary dependencies.

## Step 3: Environment Variables
The project requires connections to Supabase (for database and authentication) and Google Gemini (for the AI model).
Copy the example file to create your own local environment variable file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your API keys. For detailed explanations of each field, please refer to the [Environment Variables](environment-variables.md) section.

## Step 4: Start the Development Server
Once configured, you can start the local development server:

```bash
npm run dev
```

If successful, you will see a message like this:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```
Now open your browser and navigate to `http://localhost:3000` to start using the system!

## Step 5: Database Setup (First Time Only)
If you are connecting to a brand new Supabase project, make sure you execute all the `.sql` files located in `supabase/migrations/` using the Supabase SQL Editor. This will create the correct tables and Row Level Security (RLS) policies. For detailed database structure, see [Supabase Database & Auth](../architecture/supabase.md).