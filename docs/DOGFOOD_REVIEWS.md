# Dogfood checklist — Reviews & posts

Walk this before inviting beta testers. Goal: reviews and post flows feel functionally
complete on web (desktop + phone-width).

**Severity when noting issues:** **Blocker** / **Annoying** / **Polish** — include route +
repro steps.

Deferred by design (do not fail this checklist on these):

- Review-card subject context menus (`docs/REVIEW_INGRESS.md`)
- ComposerHint
- Share button / cross-platform share
- Lyrics quotes
- Expo / mobile app

---

## Setup

- [ ] Fresh browser (or private window) + one logged-in account
- [ ] Ideally a second account for “other user” checks
- [ ] Desktop **and** phone-width (or real phone)
- [ ] At least one Spotify / Tidal / Apple track **and** album you can search

---

## A. Ingress (how you get into the composer)

- [ ] `/reviews` → **Write review** opens empty composer
- [ ] Search / entity surface → context menu **Write review** on a **track** → composer prefilled
- [ ] Same for an **album / release**
- [ ] Context menu **See reviews** → `/tracks/{isrc}/reviews` or `/releases/{gtin}/reviews`
- [ ] Direct: `/reviews/new?isrc=…&type=TRACK` and `?gtin=…&type=RELEASE`
- [ ] Direct: `/reviews/new?url=<spotify|tidal|apple share URL>` resolves correctly
- [ ] Bad / unknown `?url=` → error banner + manual search still works
- [ ] Logged out → `/login?redirect=…` → after login land back on prefilled `/reviews/new?…`

See `docs/REVIEW_INGRESS.md` for the query-param contract.

---

## B. Create review

- [ ] Pick subject via MusicSubjectPicker (track + release)
- [ ] Change subject after picking (swap track ↔ album)
- [ ] Body: plain text, bold/italic if available, line breaks
- [ ] `@user` mention autocomplete + chip renders after publish
- [ ] `#artist` mention autocomplete + chip + tags toolbar updates
- [ ] Tags toolbar shows subject artist + title + typed `#artist`s
- [ ] Toggle **Private** before publish → saves private
- [ ] Toggle **Public** → saves public
- [ ] Publish empty body / no subject → blocked with clear feedback
- [ ] After publish → lands on review (`/review/{id}`) or feed with the card visible

---

## C. Read / feed surfaces

- [ ] Own public review on home / explore / profile feed
- [ ] Own **private** review: visible to you, **not** to second account
- [ ] `/review/{id}` detail page: subject, body, mentions, private badge
- [ ] Subject review lists: `/tracks/…/reviews`, `/releases/…/reviews`
- [ ] Open review from feed → detail → back without losing scroll / state badly
- [ ] Artwork / avatars load; no broken images or layout blowups

---

## D. Edit / visibility / delete

- [ ] Edit body + save; refresh still shows new content
- [ ] Edit doesn’t lose subject
- [ ] Owner menu: **Make private / public**; badge / border updates; second account sees correct visibility
- [ ] Delete review → gone from feed, detail 404 / empty, subject list updated
- [ ] Cannot edit / delete someone else’s review

---

## E. Interactions

- [ ] Like / unlike (count + your state)
- [ ] Comment inline + on detail; empty comment blocked
- [ ] Delete own comment (if supported)
- [ ] Repost / unrepost
- [ ] Regular **post** (non-review) create / edit / like / comment / repost still works

---

## F. Mobile / UX friction

- [ ] Composer usable on ~390px width (picker, editor, publish, visibility)
- [ ] Long review doesn’t break cards
- [ ] Context menus / long-press on touch (where expected)
- [ ] Loading / error toasts don’t fire falsely
- [ ] Refresh mid-compose: expected loss vs accidental loss is clear

---

## G. Invite-ready bar

Ship invites when:

- [ ] No **Blockers** in A–E
- [ ] Private reviews never leak to the other account
- [ ] At least one happy path from entity → write → appear in feed works on phone
- [ ] Short known-issues note exists for remaining **Annoying** items

---

## Suggested pass order

Finds the most bugs fastest:

1. **A** Ingress
2. **B** Create (public + private)
3. **C** Feeds with second account
4. **D** Visibility flip + delete
5. **E** Likes / comments / reposts
6. **F** Phone-width pass

---

## Related

- `docs/REVIEW_INGRESS.md` — composer entry points and deferred subject menus
- `.cursor/plans/production_deployment_prep_988afef6.plan.md` — beta deploy (WS8) before external invites
