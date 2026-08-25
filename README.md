# FinPilot

A personal finance dashboard for the Indian market — net worth tracking, SIP/investment
analysis, a loan eligibility calculator, an AI financial co-pilot, and data export.

## Architecture

```
client/    React 19 + TypeScript + Vite — UI only, talks to the API over HTTP
server/    Express 5 + TypeScript — financial calculations, mock data, AI chat routing
shared/    TypeScript types used by both client and server (single source of truth)
```

The client holds no business logic and no data of its own — every page (`Dashboard`,
`Investment Analysis`, `Loan Calculator`, `AI Chat`, `Settings`) fetches from the server's
API. `client/src/data/DataContext.tsx` fetches the profile once on mount and exposes it
through a hook; `client/src/lib/api/` holds one typed fetch wrapper per endpoint group.

The server keeps a `FinancialProfileRepository` interface between routes and the actual
data source (`server/src/data/financialProfile.ts`, currently an in-memory mock profile
for a fictional user). Swapping in a real data source (e.g. Fi's MCP server) later means
implementing that one interface — no route handler changes.

### AI chat pipeline

`POST /api/chat` runs a small pipeline instead of forwarding straight to a model:

1. **Classify** (`server/src/lib/queryClassifier.ts`) — deterministic keyword matching
   sorts the message into one of five `QueryType`s (`loan`, `investment`, `general`,
   `complex_analysis`, `quick_advice`). No model call needed for this step.
2. **Route** (`server/src/lib/modelRouter.ts`) — a `QueryType → { provider, model }` map.
   Loan/investment/analysis questions go to GPT-4 (OpenAI); quick-advice/general questions
   go to Gemini Flash (cheaper, adequate for lighter queries). Adding a query type or
   swapping a model is a one-line change here.
3. **Build a prompt** (`server/src/lib/prompts.ts`) — injects only the profile slice
   relevant to that query type (e.g. loan questions get DTI + liabilities + credit score;
   investment questions get portfolio allocation + SIP performance).
4. **Call the provider** (`server/src/lib/providers.ts`) — wraps the OpenAI/Gemini SDKs.
   A missing API key or a provider-side failure never reaches the client as a raw error;
   both are caught and mapped to a typed `{ error, message }` response (503 vs 502).

`POST /api/openai-chat` is a legacy direct passthrough to OpenAI with no classification
or profile injection, kept for callers that want a raw completion.

## Prerequisites

- Node.js 20+ and npm 10+
- (Optional, for real AI responses) an [OpenAI API key](https://platform.openai.com/account/api-keys)
  and a [Gemini API key](https://aistudio.google.com/app/apikey) — without these, `/api/chat`
  and `/api/openai-chat` still respond correctly with a typed 503 instead of crashing.

## Environment variables

Copy the example env files before running anything:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | server | `4000` | Port the API listens on |
| `NODE_ENV` | server | `development` | Standard Node environment flag |
| `CLIENT_ORIGIN` | server | `http://localhost:5173,http://localhost:5174` | Comma-separated list of origins CORS allows. Add your deployed client URL here in production. |
| `OPENAI_API_KEY` | server | _(empty)_ | Required for loan/investment/complex-analysis chat queries and `/api/openai-chat` |
| `GEMINI_API_KEY` | server | _(empty)_ | Required for quick-advice/general chat queries |
| `CHAT_RATE_LIMIT_PER_MINUTE` | server | `20` | Per-IP request cap on `/api/chat` and `/api/openai-chat` (they hit paid APIs) |
| `VITE_API_BASE_URL` | client | `http://localhost:4000` | Base URL the client calls for all API requests |

## Install

```bash
npm install
```

This installs all three workspaces (`shared`, `server`, `client`) in one pass.

## Development

```bash
npm run dev
```

Builds `shared` once, then runs the server (`tsx watch`, port 4000) and the client (Vite,
port 5173) together via `concurrently`. Both auto-reload on file changes.

Run a single workspace instead, if you only need one:

```bash
npm run dev --workspace=server
npm run dev --workspace=client
```

## Testing

```bash
npm test
```

Runs the server's Vitest suite: unit tests for the financial math (`lib/financial.ts`),
the query classifier, and the model router, plus Supertest integration tests for the full
API surface (profile routes, loan calculation, and chat — including the missing-API-key
and rate-limit-exceeded paths, with the AI providers mocked so tests don't hit real APIs
or cost money).

## Building for production

```bash
npm run build       # builds shared, then server, then client
npm run typecheck   # tsc --noEmit across all three workspaces
npm run lint        # oxlint across server and client
```

Server output goes to `server/dist/` (run with `npm run start --workspace=server`).
Client output goes to `client/dist/` (a static SPA — serve with any static host).

## Deployment

- **Client** — `client/vercel.json` is set up for Vercel: set the project's root directory
  to `client/`, and it builds `shared` then `client` and serves `dist/` with SPA rewrites
  (all paths fall back to `index.html`, required for client-side routing). Set
  `VITE_API_BASE_URL` to your deployed server's URL in the Vercel project's environment
  variables.
- **Server** — `render.yaml` at the repo root configures a Render web service (build:
  `shared` then `server`; start: `node dist/index.js`; health check: `/health`). Render
  was chosen over a serverless platform because the server keeps small in-memory state
  (the rate limiter's request counters) that doesn't survive across serverless
  invocations — a persistent Node process avoids that problem outright. Set
  `CLIENT_ORIGIN`, `OPENAI_API_KEY`, and `GEMINI_API_KEY` as environment variables in the
  Render dashboard (marked `sync: false` in `render.yaml` so they're entered manually,
  never committed).

## Project structure

```
client/src/
  pages/            Dashboard, InvestmentAnalysis, LoanCalculator, AIChat, Settings
  lib/api/           typed fetch wrapper per endpoint group
  lib/financial.ts   display-only formatting + client-derived metrics (net worth, DTI,
                      allocation, SIP returns) computed from the already-fetched profile
  data/DataContext.tsx  fetches the profile once, exposes loading/error state
  services/chatService.ts  re-exports the real chat API call + client-side query hinting

server/src/
  routes/            one file per resource (profile, investments, loan, settings, chat, health)
  lib/financial.ts   authoritative EMI/eligibility/net-worth/DTI/allocation math
  lib/queryClassifier.ts, modelRouter.ts, prompts.ts, providers.ts   AI chat pipeline
  data/              FinancialProfileRepository interface + mock implementation
  schemas/           Zod schemas — every request body is validated
  middleware/        error handling, Zod validation, rate limiting
```
