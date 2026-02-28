# cf-ai-jobhelper

A Cloudflare Worker powered AI career assistant built with Llama 3.3 via Workers AI.

## Live Demo
https://cf-ai-jobhelper.shambhavi927.workers.dev

## What it does
JobHelper AI is a career chatbot that helps users with:
- CV and resume writing tips
- Job search strategies
- Interview preparation advice
- Career guidance for software engineers
- Salary negotiation tips

## Components
- **LLM** — Llama 3.3 70B via Cloudflare Workers AI
- **Worker** — Cloudflare Worker handles routing and AI calls
- **UI** — Chat interface served directly from the Worker
- **Memory** — Conversation history maintained in browser state

## How to Run Locally
1. Install Wrangler: npm install -g wrangler
2. Clone this repo
3. Run: npm install
4. Run locally: npm run dev
5. Open: http://localhost:8787

## Deploy
npm run deploy