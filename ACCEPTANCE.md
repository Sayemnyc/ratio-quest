# Acceptance pass

Verified September 29, 2026 (America/New_York).

Public app: https://ratio-quest-book-bake.vercel.app

Vercel production deployment `dpl_AWPH1DwUD2BLNhHx6cTf8ZxD7hRb` confirmed **Ready**. The browser pass opened the public alias in a fresh browser session without Vercel authentication.

| Required check | Result | Evidence |
| --- | --- | --- |
| Loads with no login | PASS | Fresh local and public browser sessions show the map and Start quest. |
| Tier locks and 80% unlocking | PASS | Tier 2/3 disabled initially; direct Tier 3 route returns home. 6/8 first answers (75%) stays locked. Replay opens next tier. Unit test verifies 7/8 (87.5%) unlocks. |
| Exact 24-question bank | PASS | All records compared against the independent verbatim pasted question fixture. Browser traverses all 24 and checks exact stories, questions, option order, answers, and hints. |
| Wrong answer, retry, two hints | PASS | Wrong choice retains four options and displays the exact hint plus a scene-specific consequence. Two hint-button uses, then disabled. Hint and retry state survive reload. |
| XP, badges, map | PASS | Full playthrough reaches 240 XP and all three named badges. Tier 1 replay leaves XP at 80 and updates score. Badge shelf and final celebration persist after reload. |
| Teacher roster | PASS | Add two test students; independent progress and accuracy; play as a student; switch back; roster survives reload. |
| Phone and Chromebook layouts | PASS | Chromium viewport checks at 320, 375, 390, 600 and 1366 pixels; no horizontal overflow on map, question, answer feedback, completion, or roster. Options exceed 44-pixel touch height. Desktop and phone screenshots visually reviewed. |
| Console, assets, placeholders | PASS | Live browser reports zero console errors and zero failed asset requests. Artwork uses local SVG/CSS and system emoji; no remote images or placeholder copy. |

`npm run check`: JavaScript syntax checks, six automated tests, static build all pass. `scripts/acceptance-browser.js`: complete interactive browser pass reports `pass: true`, `errors: []`, `failedRequests: []` against production.

## Scope and interpretation

- Layout testing emulates Chromebook/phone dimensions in Chromium; it is not a physical-device test.
- Teacher data stays on the same browser; there is no automatic cross-device collection.
- Accuracy counts first answers in each run. Retries keep the story moving; best completed scores control unlocking.
- One verified hint is supplied per question. Both hint uses show that original hint, without adding or changing math content.
- Technical acceptance is complete. Alina's enjoyment and learning still need a real student play session.
- The requested repository already held a separate implementation. This version is on `codex/ratio-quest-book-bake`; the existing main branch and deployment are preserved.
