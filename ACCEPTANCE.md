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

## Audio update

The user subsequently requested voice-over, sounds and music, superseding the original no-sound requirement. Published at the same URL, deployment `dpl_etcMAwuzsuRHeHTwqzxNPwDnwJG9`.

- Actual browser speech start events verified with the local English `Samantha` voice. Stories, question options, hints, wrong-choice consequences and success narration were checked.
- Native Web Audio oscillators verified for original music and gentle game effects. Music gain lowers during narration and recovers when narration ends or is stopped.
- No autoplay on initial load or reload. Explicit Enable audio or Read this screen tap starts playback.
- Voice, music and effects toggle independently. Stop reading preserves the music; Mute all suspends audio and stops scheduled notes.
- Volume and toggles persist independently of student records. Teacher view cancels speech and suspends sound; returning to the game resumes enabled music.
- Audio controls meet 44-pixel touch heights and have no horizontal overflow at 320, 390 and 1366 pixels. Phone screenshot reviewed.
- Full original quest acceptance pass rerun successfully after integration. All 24 exact questions, hints, tier rules, badges and teacher records still pass.
- `npm run check`: eight automated tests, syntax checks and static build pass. Live audio browser check: `pass: true`, `errors: []`.

Device voices differ. Physical phones/Chromebooks and audible quality on those speakers still need a student play session. No paid narration service, microphone access, downloaded music or new app dependencies are used.

## Recorded storyteller update

After feedback that the browser voice sounded robotic and monotonous, replaced browser speech synthesis with 126 locally generated Kokoro `af_heart` MP3s. Every device receives the same recordings. Published at the same URL, production deployment `dpl_EzTL7Yhb8coTxPSdGKLzcLwzpwmj` confirmed **Ready**.

- All 126 recording scripts match the shared story/question/hint source; the exact 24-question bank remains unchanged. Build rejects incomplete or stale recordings.
- `npm run check`: nine tests, JavaScript syntax checks and static asset build pass.
- Native HTMLAudioElement playing events verified locally and on production. Stories, choices, hints, retry consequences and success use their corresponding recorded clips.
- Live audio browser check reports `pass: true`, narrator `Heart · Storyteller`, and zero console errors. Music ducking, independent controls, saved preferences, no autoplay, mute, teacher silence and phone/desktop touch targets pass.
- Full local quest acceptance rerun successfully: all 24 questions, tier rules, retries, badges, XP, roster, saves and layouts pass with zero errors or failed requests.
- Production availability check confirms all 126 clips return HTTP 200 with `audio/mpeg` and nonempty content.
- Recordings contain about 17 minutes of narration in about 12 MB. Each clip loads on demand; the model and Python environment are not shipped.

The first story clip was provided for listening feedback. Browser tests verify playback and behavior; Sayem and Alina's listening feedback remains the acceptance check for perceived naturalness. Physical-device speaker quality is not established by viewport testing. No paid upgrade was purchased; playback needs no provider credits.
