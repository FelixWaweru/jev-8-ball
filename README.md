# Jev 8 Ball

The worlds most powerful Magic 8 Ball powered by Jev.

Live at [8-ball.codefundi.app](https://8-ball.codefundi.app). Ask a yes/no-style question (or scan a GitHub repo with CodeFundi) and get a classic 8-ball phrase with calibrated probabilities from [TypeSafe Jev](https://openrouter.ai/typesafe/jev-1.13) on [OpenRouter](https://openrouter.ai).

## How it works

- Jev is a **System One decision model**, not a chat LLM.
- The browser calls OpenRouter’s Decisions API directly:

  `POST https://openrouter.ai/api/alpha/decisions`

  with model `typesafe/jev-1.13` and a Choice question whose criteria are the classic Magic 8-ball answers.
- Your **OpenRouter API key** stays in `localStorage` (`openrouter_api_key`) and is sent only from the client.
- There is **no** Next.js / Vercel proxy for Jev. OpenRouter usage is billed to **your** key.
- **GitHub Repo** mode uses server-only CodeFundi routes (`/api/codefundi/blueprint`, `/api/codefundi/index`) with `CODEFUNDI_API_KEY` against `https://api.codefundi.app`, then passes that context into the client-side Jev call.

## Setup

```bash
npm install
```

Create `.env.local`:

```bash
CODEFUNDI_API_KEY=your_codefundi_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Set OpenRouter Key**, and paste a key from [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

## Docs

- [Jev tutorial](https://openrouter.ai/docs/guides/community/jev-tutorial)
- [Decisions API](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request)
- [Jev model page](https://openrouter.ai/typesafe/jev-1.13)
- [CodeFundi](https://codefundi.app)

## Stack

Next.js, React, TypeScript, Tailwind CSS, Framer Motion, CodeFundi, OpenRouter / TypeSafe Jev.
