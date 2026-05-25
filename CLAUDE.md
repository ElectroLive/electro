# CLAUDE.md — Electro

This file gives Claude Code persistent context about this project. Read it at the start of every session.

---

## Project identity

**Name:** Electro
**One-liner:** A web app that transfers music playlists between streaming services (Spotify, Apple Music, and more coming).
**Stage:** MVP build, week 1
**Owner:** [your name]

---

## Product vision (don't lose sight of this)

Electro removes the friction of switching or living across multiple music services. The MVP is one-off playlist transfer between Spotify and Apple Music. The endgame is a multi-platform playlist hub with ongoing sync, supporting Spotify, Apple Music, YouTube Music, Gaana, Tidal, Amazon Music, and Shazam.

**Mobile-first.** Most users will use this from their phone, on a sofa, in a moment of "ugh I wish I could just move this." The web experience must feel like a native app on a phone.

**No signup for the free tier.** Friction kills one-off utility tools. OAuth into the two services, do the transfer, done. Sessions only, no database in v1.

---

## Tech stack (locked in)

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Hosting:** Vercel
- **Database:** None for v1 (cookie-based sessions)
- **Payments:** Stripe one-time payment ($4.99 unlock)

**Do not introduce new dependencies without asking.** If a problem can be solved with what's already in the stack, solve it there.

---

## Code conventions

- TypeScript everywhere. No `any` types without justification.
- Server components by default; use client components only when needed (interactivity, hooks).
- API routes under `app/api/` for OAuth callbacks and backend logic.
- Environment variables in `.env.local` — never commit secrets.
- Use shadcn/ui components rather than rolling custom UI.
- Mobile-first Tailwind: design for 375px width, scale up.
- Accessible by default: proper labels, focus states, touch targets ≥44px.

## File structure (target)

```
electro/
├── app/
│   ├── page.tsx                    # Landing (Screen 1)
│   ├── transfer/
│   │   ├── page.tsx                # Direction picker (Screen 2)
│   │   ├── connect-source/page.tsx # Screen 3
│   │   ├── playlists/page.tsx      # Screen 4
│   │   ├── connect-dest/page.tsx   # Screen 5
│   │   ├── preview/page.tsx        # Screen 6 (matching)
│   │   ├── transferring/page.tsx   # Screen 7
│   │   └── done/page.tsx           # Screen 8
│   ├── api/
│   │   ├── auth/
│   │   │   ├── spotify/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── callback/route.ts
│   │   │   └── apple/
│   │   │       └── token/route.ts  # MusicKit dev token
│   │   ├── playlists/route.ts
│   │   ├── match/route.ts
│   │   └── transfer/route.ts
│   └── layout.tsx
├── lib/
│   ├── spotify.ts                  # Spotify API client
│   ├── apple.ts                    # Apple MusicKit client
│   ├── matcher.ts                  # Track matching logic
│   └── session.ts                  # Cookie/session helpers
├── components/
│   └── ui/                         # shadcn components
└── CLAUDE.md                       # this file
```

---

## Current build status

**Week 1 goals:**
- [ ] Next.js project scaffolded with TypeScript, Tailwind, shadcn/ui
- [ ] Landing page deployed to Vercel
- [ ] Spotify OAuth flow working end-to-end
- [ ] User can see their Spotify playlists after connecting

**Not yet started:**
- Apple Music integration (waiting on developer account)
- Matching logic
- Transfer logic
- Paywall

---

## API integration notes

### Spotify
- Auth: OAuth 2.0 Authorization Code with PKCE
- Required scopes: `playlist-read-private`, `playlist-read-collaborative`, `playlist-modify-public`, `playlist-modify-private`, `user-library-read` (for Liked Songs)
- Docs: https://developer.spotify.com/documentation/web-api
- Rate limits: generous; respect 429 responses with exponential backoff
- Track object includes `external_ids.isrc` — use this for matching

### Apple Music (MusicKit)
- Auth: developer token (signed JWT) + user token (from MusicKit JS)
- Developer token signed with ES256 using .p8 key, Team ID, Key ID
- Token TTL: max 6 months
- User token obtained via MusicKit.authorize() in browser
- Docs: https://developer.apple.com/documentation/musickit
- Track object includes ISRC under `attributes.isrc`

---

## Matching algorithm

Three tiers (cascade):

1. **ISRC match** — both APIs expose ISRC; exact match = high confidence
2. **Fuzzy match** — normalize titles (lowercase, strip parentheticals, normalize feat./ft., unicode normalize), compare title + artist + duration (±3s). Score ≥0.9 auto-accept, 0.7-0.9 flag, <0.7 unmatched.
3. **User confirmation** — for low-confidence matches, show top 3 candidates, let user pick

When implementing, isolate matching logic in `lib/matcher.ts` so it's easy to test and improve. Add unit tests for normalization edge cases.

---

## Security and privacy principles

- OAuth tokens stored in httpOnly, secure, sameSite=Lax cookies. Never in localStorage.
- No PII in logs.
- Anonymous logging of unmatched tracks (track name + artist only, no user identifier)
- Privacy policy and terms link in footer.
- "We never store your music data" messaging on connect screens.

---

## What Claude Code should and shouldn't do

**Should:**
- Build one milestone at a time, ask for confirmation before moving on
- Show code before committing
- Suggest commits at logical checkpoints
- Flag any security concerns (especially around token handling)
- Ask before adding new dependencies

**Shouldn't:**
- Don't refactor working code unprompted
- Don't add features beyond what's asked
- Don't commit secrets, ever
- Don't disable TypeScript strict mode to make errors go away
- Don't skip mobile responsiveness — every screen must work on a 375px viewport

---

## How to use this file

At the start of each Claude Code session, ensure this file is in context. As work progresses, update the "Current build status" section to reflect what's done. When milestones complete, note them and what was learned.

This file is the source of truth for project state. Keep it accurate.
