# Ratio Quest · The Great Book Bake

A no-login Grade 7 ratios and proportions adventure, made for Alina and her class. Students run a community bake sale to buy books for the school library. Every decision moves the fundraiser story forward.

Play: https://ratio-quest-book-bake.vercel.app

See `ACCEPTANCE.md` for the completed local and live verification pass.

## Run locally

Node.js 20 or later. No app dependencies or API keys.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Stop the server with Ctrl+C.

```sh
npm run check
```

This checks JavaScript syntax, automated contract/state/audio tests, and the static build. `npm run build` copies the nine public app files and the recorded MP3 assets to `dist/`. Deploy that directory on a static host; `vercel.json` supplies the Vercel settings.

## Rules

- Three tiers, eight quests each. Each quest starts with the exact supplied story, then four choices in the supplied order.
- Every wrong choice produces a quest-specific story consequence, the exact supplied hint, and an unlimited retry. No timers, failing grades, or red X marks.
- Two hint-button uses per quest. The supplied bank contains one hint for each question, so both uses revisit that verified hint rather than inventing a second math hint. Hint uses reset at the next quest and survive reload.
- Each first-ever solved quest awards 10 XP; maximum 240 XP. Replays keep earned XP and badges.
- Accuracy uses the first answer to each question in the current run. Retries cannot rewrite that record. Best **completed** tier score controls unlocking; 7/8 = 87.5% meets the 80% requirement, while 6/8 = 75% does not.
- Completing all eight quests awards the tier badge even if retries were needed. Students can replay a completed tier to improve its score. A replay never removes an already unlocked tier.
- Progress, an unfinished quest, hint count, and roster persist in localStorage under `ratio-quest-v1`. Clearing browser/site data clears those records. A blocked-storage notice appears if this browser cannot save.

## Teacher view

Add first names once, one per line or separated by commas. Select a student using **Play as** or the student selector on the map. Each student has independent progress, accuracy, badges, and XP.

The roster is local to the browser/device. Teachers cannot see results from other students' Chromebooks automatically. No personal data is uploaded, and names do not act as authentication. Two students sharing a first name can use distinct first-name labels, such as `Alina A` and `Alina B`. No reset/delete control is included to prevent accidental loss.

## Voice, sounds and music

Tap **Enable audio** to hear narration, gentle action sounds and an original looping tune. Nothing plays automatically when the site loads or reloads. Voice, music and sounds have independent toggles; use the volume slider or **Mute all** at any time. Preferences save separately from student progress.

Recorded storyteller narration reads stories, questions and options, hints, story consequences and badge celebrations. **Read this screen** repeats the current narration, while **Stop reading** ends the voice without muting music. Spoken ratios use “to,” percentages use “percent,” and dollar amounts use “dollars”; the on-screen question bank is untouched.

Narration uses 126 pre-generated MP3 clips with one consistent American English storyteller voice (`Kokoro af_heart`). It no longer uses browser speech synthesis. Question text, option order, answers and hints remain unchanged. Clips are generated locally, normalized to consistent loudness, and served as ordinary static files. No speech provider, credit balance, microphone or recording access is needed during play. If a clip cannot load, the game displays a retry notice and remains playable with text.

Music and effects use Web Audio synthesis: no downloaded tracks, paid services or runtime dependencies. Music softens during narration. Switching to Teacher view silences all audio; hiding the tab stops narration and pauses music. Returning to a visible game tab resumes enabled music, but does not restart narration automatically.

## Files

- `bank.js`: all 24 supplied questions, unchanged.
- `state.js`: scoring, tier gating, rewards, hint counts, save validation.
- `app.js`: map, story scenes, choices, badge celebrations, teacher roster.
- `audio.js`: recorded narration playback, original music, sound effects, audio controls and saved preferences.
- `story.js` and `narration.js`: shared story content and stable scripts for all 126 clips.
- `assets/narration/`: MP3 recordings and their checked manifest.
- `scripts/record-narration.py`: offline asset generation; not required to run or deploy the game.
- `style.css`: responsive Chromebook and phone layouts, reduced-motion support.
- `scripts/question-contract.txt`: exact pasted question lines, used as an independent contract fixture.
- `scripts/state.test.js`: contract and state acceptance tests.
- `scripts/acceptance-browser.js`: full browser acceptance pass, using Playwright CLI's `run-code --filename` command. Run in a dedicated test session: it clears that session's site storage and creates test students.

The public GitHub repository already contained a previous version when this implementation was built. This version lives on `codex/ratio-quest-book-bake`; the existing `main` is preserved. The old `questions.js` and `.impeccable` files are retained from the original repository but are not included in this static build.

## Next classroom check

Let Alina play one tier and ask which decision felt like running the sale. Browser acceptance proves the specified behavior; her feedback is the test for engagement. A future opt-in classroom export/import could bring results from separate Chromebooks to a teacher's browser without adding accounts.

## Regenerate narration (optional)

The checked-in MP3s work without installing a speech model. To change scripts, `npm run narration:prepare` creates the recording requests under ignored `output/audio/`. Then use the local generator with Python 3.12, `kokoro-onnx==0.6.1`, `soundfile`, and the Kokoro v1.0 int8 model and voice data. `scripts/record-narration.py` writes the clips and manifest; `npm run check` catches missing or stale scripts. Model files and the Python environment stay in `output/` and are not deployed.

Sources: [Kokoro model and voices](https://huggingface.co/hexgrad/Kokoro-82M), [Kokoro ONNX](https://github.com/thewh1teagle/kokoro-onnx). The model is Apache 2.0; the inference library is MIT. The browser runs neither model nor Python.
