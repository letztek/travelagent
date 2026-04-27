# 🇹🇼 AI Smart Travel Agent Knowledge Base

Welcome to the official documentation center for the TravelAgent project. This documentation is designed for two main audiences:
1. **Developers and Maintainers**: Learn how to deploy the system, review architecture decisions (Supabase Schema, Auth), and understand the core code logic.
2. **Travel Agents and Users**: Learn how to operate the backend management system, including importing itineraries, writing requirements, editing routes, and utilizing AI diagnostics (Gap Analysis) and AI prompts.

---

## 🚀 About the System

**TravelAgent** is a "B2B Invite-Only" platform tailored for professional travel agents. Its core value lies in using Generative AI (Gemini) to free agents from the tedious tasks of "initial itinerary formatting" and "data checking".

Currently, we solve three major pain points:
*   **Inconsistent Formats**: Whether the client sends a PDF, Word document, or plain text, the system parses it into structured data.
*   **Illogical Routes**: The AI diagnostic engine catches illogical flows or missing information before generating the itinerary.
*   **Time-Consuming Formatting**: Automatically generates high-quality JSON itineraries and text formats ready for proposals.

---

## 📖 How to Read This Documentation

You can browse different topics via the left menu:

*   **Deployment Guide**: Takes you from `.env` configuration to successfully starting the server locally.
*   **Architecture Docs**: Deep dive into our backend (Supabase) structure, including permission controls and AI Agent integration details.
*   **User Manual**: Detailed illustrated guides for all platform features.
*   **Advanced AI Usage**: Learn how to create your own Favorites list so the AI understands your taste, and how to fine-tune the system.

If you are a developer taking over this project for the first time, we recommend reading the [**GitBook Setup**](setup-gitbook.md) and the Deployment Guide first.