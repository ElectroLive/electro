# Electro — Project Plan

**Last updated:** February 2026
**Status:** Pre-build, planning phase

---

## What is Electro?

A web app that lets users move their music playlists between streaming services (starting with Spotify and Apple Music). Mobile-first, freemium, no account needed for v1.

**Core promise:** "Move your playlists between Spotify and Apple Music in 30 seconds."

## Why this exists

Cross-platform playlist transfer is a real pain point. Apple Music and Spotify don't natively let you share playlists across services. Existing tools (Soundiiz, TuneMyMusic, FreeYourMusic) have friction: paywalls early, dated UX, sketchy trust signals, weak track matching.

The opportunity is not "does this exist" — it's "can we do it noticeably better with sharper UX, better matching, and friendlier pricing."

---

## Phased roadmap

### Phase 1 — MVP (weeks 1-4)
- Spotify ↔ Apple Music transfer
- Mobile-first responsive web app (not a native app)
- No user accounts; session-only OAuth
- One free transfer per session; paid unlock for unlimited
- Deployed to Vercel

### Phase 2 — Expansion (post-launch)
- YouTube Music integration
- Gaana integration (Indian market — likely underserved by existing tools)
- Tidal, Amazon Music, Deezer
- Shazam integration (import liked songs from Shazam history)

### Phase 3 — Recurring value (subscription)
- Ongoing sync between playlists (change on one platform, propagates to others)
- Multi-platform playlist management dashboard
- This is the natural subscription-shaped offering

### Phase 4 — Mobile app (only if validated)
- Only build native if web app shows strong demand AND clear native-only needs
- Likely React Native to share logic with web

---

## Business model

**Free tier:** 1 playlist transfer, up to ~200 tracks. No signup required.
**Paid:** $4.99 one-time unlock → unlimited transfers, unlimited tracks, transfer Liked Songs, batch transfer all playlists.
**Future subscription (Phase 3):** ~$3/mo for ongoing sync.

Rationale: one-off transfer is not subscription-shaped (users leave when done). One-time unlock is low friction and matches the user's mental model. Subscription comes later when sync ships.

---

## Tech stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Hosting:** Vercel
- **Database:** None for MVP. OAuth tokens in httpOnly cookies, session-only.
- **Payments (later):** Stripe (one-time payment)
- **Analytics:** Plausible or Vercel Analytics (privacy-friendly)

---

## External accounts needed (start these NOW — they have lead time)

1. **Spotify Developer account** — free, 15 min setup
   - developer.spotify.com → create app → get Client ID + Secret
   - Add redirect URI: `http://localhost:3000/api/auth/spotify/callback` for dev
   - Note: dev mode caps at 25 whitelisted users; submit for extended quota before public launch (1-2 weeks review)

2. **Apple Developer account** — $99/yr, 24-48h to activate ← START TODAY
   - developer.apple.com → enroll
   - Create MusicKit identifier
   - Generate private key (.p8 file)
   - Note Team ID and Key ID
   - These three pieces sign developer tokens for MusicKit

3. **Domain** — ~$12/yr
   - Check: electro.app, electro.fm, getelectro.com, tryelectro.com
   - Buy through Namecheap or Cloudflare

4. **GitHub repo** — private, for version control

5. **Vercel account** — free, connects to GitHub

---

## User flow (9 screens)

1. **Landing** — headline, "Start transfer" CTA, no signup
2. **Pick direction** — Apple → Spotify, or Spotify → Apple
3. **Connect source** — OAuth to source service
4. **Pick playlist** — scrollable list with cover art, name, track count; include Liked Songs
5. **Connect destination** — OAuth to destination service
6. **Matching preview** — most important screen; show match count, expandable unmatched list with reasons
7. **Transferring** — progress indicator ("Adding track 47 of 142")
8. **Done** — success state, "Open in [destination]" deep link, share prompt
9. **Paywall** — only if user tries a second transfer; "$4.99 to unlock unlimited"

---

## Matching algorithm (the moat)

Three tiers, cascading:

**Tier 1: ISRC match (highest confidence)**
Both Spotify and Apple expose ISRC codes per track. Same recording = same ISRC. Catches 60-70% of mainstream tracks.

**Tier 2: Normalized fuzzy match**
For tracks without ISRC match:
- Lowercase
- Strip parentheticals: "(Remastered 2019)", "(Deluxe Edition)"
- Normalize "feat." / "ft." / "featuring"
- Normalize unicode (curly quotes, em dashes)
- Compare title + primary artist + duration (±3 seconds)
- Score: ≥0.9 auto-accept; 0.7-0.9 flag as "different version"; <0.7 unmatched

**Tier 3: Fallback search**
For unmatched, show top 3 candidates as "did you mean?" — user picks manually.

Log unmatched tracks anonymously to build a backlog of matcher improvements.

---

## Edge cases to handle

- Playlists with 1000+ tracks (paginate API calls)
- Track removed from source mid-transfer
- User revokes OAuth mid-transfer
- Destination playlist name collision (append "(2)" or prompt)
- Explicit vs. clean version mismatches
- Region-locked tracks

---

## Week-by-week build plan

### Week 1: Foundation
- [ ] Spotify developer account set up, credentials in hand
- [ ] Apple developer enrollment submitted (waiting on approval is OK)
- [ ] GitHub repo created, Next.js project scaffolded
- [ ] Landing page (Screen 1) — responsive, deployed to Vercel
- [ ] Spotify OAuth working — user can connect and see their playlists (Screens 3, 4 for Spotify side)

### Week 2: Apple Music + matching
- [ ] Apple Developer account active, MusicKit identifier + .p8 key generated
- [ ] MusicKit JS integration — user can connect Apple Music
- [ ] Playlist read flow for both services
- [ ] Matching algorithm v1 (ISRC + fuzzy tier 1 and 2)
- [ ] Matching preview screen (Screen 6)

### Week 3: Transfer + paywall
- [ ] Playlist creation on destination service
- [ ] Track add API calls with proper pagination
- [ ] Progress UI (Screen 7)
- [ ] Success state (Screen 8)
- [ ] Free tier limit logic + Stripe paywall (Screen 9)
- [ ] Error handling pass

### Week 4: Polish + launch
- [ ] Submit Spotify app for extended quota review
- [ ] Privacy policy and terms (use a generator, then read carefully)
- [ ] Landing page copy polish
- [ ] Beta test with 5-10 friends
- [ ] Soft launch: post on r/spotify, r/AppleMusic, r/SideProject, Hacker News Show HN, Product Hunt

---

## Validation before code (optional but recommended)

Before writing any code, spend a weekend on this:
- Buy domain, put up a one-page "coming soon" with email capture
- Share in r/spotify, r/AppleMusic, r/india music threads, music Discord servers
- If 200+ signups in a week → strong signal to build
- If <50 signups → reconsider positioning before investing weeks of build time

Cost: $12 + a weekend.

---

## Competitive landscape

| Tool | Free limit | UX | Trust signal |
|------|-----------|-----|--------------|
| Soundiiz | 1 playlist, 200 tracks | Dated | Established |
| TuneMyMusic | 500 tracks free | OK | Established |
| FreeYourMusic | Limited free trial | Decent | Paid-first |
| SongShift (iOS only) | Limited | Native iOS feel | App Store presence |

**Electro's wedge:** sharper UX, better matching transparency (show *why* tracks didn't match), no-signup free tier, Indian platforms (Gaana) in Phase 2.

---

## Open decisions

- Final name: Electro confirmed? Check domain availability.
- Logo/branding: TBD — can be done late, doesn't block engineering
- Privacy policy: use Termly or similar generator initially
- Customer support email: hello@electro.app or similar

---

## Success metrics for MVP

- 1,000 unique visitors in first month
- 30%+ start a transfer (300 transfers attempted)
- 90%+ transfer completion rate (of started transfers)
- 5%+ conversion to paid unlock (15 paying users from 300 transfers)
- Net Promoter Score from a simple post-transfer "would you recommend?" prompt
