# GitBook Registration and Bilingual Sync Guide

This guide will walk you through connecting this GitHub repository to GitBook from scratch, creating a workflow that supports both Traditional Chinese and English documentation.

## Step 1: Register and Create a GitBook Organization
1. Go to [GitBook.com](https://www.gitbook.com/).
2. Click **"Sign up"** in the top right corner. It is highly recommended to select **"Sign up with GitHub"** to simplify permission binding later.
3. After logging in, the system will guide you to create an Organization and an initial Space (an independent documentation library).
4. Name this Space `TravelAgent Docs` (or any name you prefer).

## Step 2: Install the GitBook GitHub App
1. Click **Integrations** in the left menu of your newly created Space.
2. Find **GitHub** in the list, click on it, and select **Install GitBook on GitHub**.
3. You will be redirected to GitHub, asking where to install the app. Select the account/organization hosting the `TravelAgent` repository.
4. In the permissions settings, it's recommended to select "Only select repositories" and explicitly check your `TravelAgent` repository.
5. Click **Install & Authorize**.

## Step 3: Setup Bilingual Variants
1. After authorization, you will be redirected back to the GitBook settings page. Before setting up synchronization, let's enable bilingual support.
2. Go to the left menu: **Space settings** -> **Localization** or **Variants**.
3. Enable the Variants feature and create two variants:
   - Name one: **繁體中文** (Traditional Chinese)
   - Name the other: **English**

## Step 4: Configure Two-Way Sync (Git Sync)
Now, we need to bind these two variants to different folders in our GitHub repository.

1. Click **"Configure Git Sync"** or go to **Integrations -> GitHub**.
2. In the settings, you need to specify the sync target for each of the two variants:
   
   **For the "繁體中文" (Traditional Chinese) Variant:**
   - **Repository**: Select the `TravelAgent` project.
   - **Branch**: Select `main` (or `master`).
   - **Root directory**: Enter `docs/zh`.
   - **Sync direction**: Select **Bidirectional**.

   **For the "English" Variant:**
   - **Repository**: Select the `TravelAgent` project.
   - **Branch**: Select `main` (or `master`).
   - **Root directory**: Enter `docs/en`.
   - **Sync direction**: Select **Bidirectional**.

3. Click **"Sync"** to save.

## Step 5: Verification
1. GitBook will now scan the `docs/zh` and `docs/en` directories in your GitHub repository.
2. After a few moments, your documents will appear on GitBook. You will be able to switch freely between "繁體中文" and "English" using the variant selector in the top right corner of the GitBook interface.
3. In the future, any commits pushed to the `docs/` folder on GitHub will automatically update the corresponding language on GitBook!

🎉 **Congratulations! You have successfully configured your GitBook bilingual knowledge base.**