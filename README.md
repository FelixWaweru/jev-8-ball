# Jev 8 Ball

A Magic 8-ball web app powered by [TypeSafe Jev](https://openrouter.ai/typesafe/jev-1.13) on [OpenRouter](https://openrouter.ai). Ask a yes/no-style question and Jev returns a classic 8-ball phrase with a calibrated probability distribution over all twenty answers.

## How it works

- Jev is a **System One decision model**, not a chat LLM.
- The browser calls OpenRouter’s Decisions API directly:

  `POST https://openrouter.ai/api/alpha/decisions`

  with model `typesafe/jev-1.13` and a Choice question whose criteria are the classic Magic 8-ball answers.
- Your **OpenRouter API key** stays in `localStorage` (`openrouter_api_key`) and is sent only from the client — the same pattern as the previous Dispersl setup.
- There is **no** Next.js / Vercel proxy for Jev. OpenRouter usage is billed to **your** key; this app does not tunnel decisions through serverless functions.
- Optional **News Link** mode uses `/api/scrape` only to fetch HTML text for context. That route never calls OpenRouter.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Set OpenRouter Key**, and paste a key from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

## Docs

- [Jev tutorial](https://openrouter.ai/docs/guides/community/jev-tutorial)
- [Decisions API](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request)
- [Jev model page](https://openrouter.ai/typesafe/jev-1.13)

## Stack

Next.js, React, TypeScript, Tailwind CSS, Framer Motion.
