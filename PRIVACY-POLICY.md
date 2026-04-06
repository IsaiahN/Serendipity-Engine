# Privacy Policy

**Serendipity | StoryWeaver**
Last updated: April 5, 2026

## Overview

Serendipity | StoryWeaver is a local-first creative writing tool. It does not collect, transmit, or store any user data on external servers. All project data, settings, and credentials remain on your device.

## Data Storage

All data is stored locally in your browser's IndexedDB. This includes your story projects, files, settings, session logs, and file version history. Nothing is sent to any server operated by StoryWeaver. If you uninstall the extension or clear your browser data, your local data is deleted.

## API Keys

StoryWeaver uses a Bring Your Own Key (BYOK) model. You provide your own API keys from supported AI providers (Anthropic, OpenAI, Google, DeepSeek, OpenRouter, or Ollama). Your API keys are encrypted using AES-256-GCM via the Web Crypto API and stored locally in your browser's IndexedDB. Keys are never transmitted to any server other than the AI provider you configured, and only when you initiate an AI-assisted action.

## AI Provider Communication

When you use AI-powered features (story generation, decomposition, editing, etc.), StoryWeaver sends prompts directly from your browser to the AI provider you selected. These requests contain the story content you are working on and are governed by the respective provider's privacy policy and terms of service. StoryWeaver does not proxy, log, or intercept these communications.

## Data Collection

StoryWeaver does not collect any of the following:

- Personally identifiable information (names, emails, addresses, age, identification numbers)
- Health information
- Financial or payment information
- Authentication information (passwords, credentials, PINs)
- Personal communications (emails, texts, chat messages)
- Location data (GPS, IP addresses, regional information)
- Web browsing history
- User activity (clicks, mouse movements, scroll behavior, keystrokes)
- Website content from other tabs or pages

## Analytics and Telemetry

StoryWeaver includes no analytics, telemetry, crash reporting, or tracking of any kind. No data is sent to any server for any purpose other than the AI provider API calls you explicitly initiate.

## Third-Party Services

The only third-party services StoryWeaver communicates with are the AI providers you choose to configure:

- Anthropic (api.anthropic.com)
- OpenAI (api.openai.com)
- Google Gemini (generativelanguage.googleapis.com)
- DeepSeek (api.deepseek.com)
- OpenRouter (openrouter.ai)
- Ollama (localhost, runs on your own machine)

Each provider has its own privacy policy governing how it handles the data you send to it. StoryWeaver has no control over how these providers process your requests.

## Permissions

The extension requests the following permissions:

- **storage**: Required for persistent local data storage (projects, settings, encrypted API keys) via IndexedDB.
- **Host permissions** for AI provider domains: Required to send API requests directly from your browser to the AI providers you configure. No other domains are accessed.

## Children's Privacy

StoryWeaver does not knowingly collect any information from anyone, including children under the age of 13.

## Changes to This Policy

If this privacy policy is updated, the changes will be reflected in a new version of the extension with an updated "Last updated" date above.

## Contact

For questions about this privacy policy, open an issue on the GitHub repository:
https://github.com/IsaiahN/Serendipity-Engine/issues
