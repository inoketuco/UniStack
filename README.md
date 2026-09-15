# UniStack

UniStack is a student planner app designed to help keep study schedules, assignments, and course details in one place. It combines a weekly timetable, calendar view, assignment tracking, and per-user cloud storage with Supabase authentication.

## Features

- Weekly timetable with long-term and short-term event planning
- Calendar overview for monthly scheduling
- Assignment dashboard with due dates, progress tracking, and status updates
- Course management with colour-coded entries and metadata
- Local persistence for quick offline use
- Supabase-backed account sync and private user data storage
- Responsive dashboard built with React and Vinext

## Tech Stack

- React 19
- Vinext + Vite
- TypeScript
- Supabase Auth + Postgres
- Drizzle ORM
- Tailwind CSS

## Project Structure

```text
.
├── app/                     # App pages and UI entry points
├── components/             # Reusable planner UI components
├── db/                     # Database helpers and schema config
├── drizzle/                # Drizzle metadata output
├── lib/                    # Planner logic and Supabase client helpers
├── public/                 # Static assets
├── supabase/               # SQL migration files
├── tests/                  # Smoke tests
├── types/                  # Shared TypeScript database types
├── .env.example            # Environment variables template
├── drizzle.config.ts       # Drizzle configuration
├── package.json            # Scripts and dependencies
├── vite.config.ts          # Vite + Vinext config
├── README.md               # Project documentation
└── tsconfig.json           # TypeScript config
```

## Prerequisites

- Node.js 22.13.0 or later
- A Supabase project
- A browser for local app testing

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env.local
```

4. Add your Supabase variables to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Database Setup

This app expects the planner tables defined in `supabase/migrations/001_unistack_schema.sql`.

1. Open your Supabase project.
2. Go to the SQL Editor.
3. Run the contents of `supabase/migrations/001_unistack_schema.sql`.

This creates the private `profiles`, `courses`, `events`, and `assignments` tables with row-level security enabled.

## Running the App

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal in your browser.

## Production Build

```bash
npm run build
```

## Tests

```bash
npm test
```

This runs the build and executes the rendered HTML smoke test in `tests/rendered-html.test.mjs`.

## Linting

```bash
npm run lint
```

## Useful Scripts

```bash
npm run dev          # start the app locally
npm run build        # create a production build
npm test             # run build + smoke tests
npm run lint         # run ESLint
npm run db:generate  # generate Drizzle migrations
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
