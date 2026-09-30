async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  // Observe native playback calls and events; do not replace speech or Web Audio with mocks.
  await page.addInitScript(() => {
    window.audioProbe = { contexts: [], gains: [], utterances: [], starts: [], oscillatorStarts: 0 };
    const NativeContext = window.AudioContext;
    window.AudioContext = new Proxy(NativeContext, {
      construct(Target, args) {
        const context = new Target(...args);
        window.audioProbe.contexts.push(context);
        const createGain = context.createGain.bind(context);
        context.createGain = () => { const gain = createGain(); window.audioProbe.gains.push(gain); return gain; };
        const createOscillator = context.createOscillator.bind(context);
        context.createOscillator = () => {
          const node = createOscillator(), start = node.start.bind(node);
          node.start = (...args) => { window.audioProbe.oscillatorStarts++; return start(...args); };
          return node;
        };
        return context;
      }
    });
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (this instanceof HTMLAudioElement) {
        window.audioProbe.utterances.push(this.src);
        this.addEventListener('playing', () => window.audioProbe.starts.push(this.src), { once: true });
        window.audioProbe.player = this;
      }
      return play.apply(this, args);
    };
  });
  await page.evaluate(() => {
    localStorage.removeItem('ratio-quest-audio-v1');
    localStorage.removeItem('ratio-quest-v1');
  });
  await page.goto(page.url().split('#')[0]);
  assert(await page.evaluate(() => audioProbe.contexts.length === 0 && audioProbe.utterances.length === 0), 'No autoplay on initial load');
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Audio panel overflow at ${width}`);
    for (const button of await page.locator('#audio-panel button').all()) assert((await button.boundingBox()).height >= 44, 'Audio control touch size');
  }
  await page.locator('#audio-enable').click();
  await page.waitForFunction(() => audioProbe.contexts[0]?.state === 'running' && audioProbe.oscillatorStarts > 0);
  await page.waitForFunction(() => audioProbe.starts.length > 0, { timeout: 15000 });
  await page.waitForFunction(() => audioProbe.gains[1].gain.value < 0.025);
  assert(await page.evaluate(() => audioProbe.utterances[0].endsWith('/intro.mp3')), 'Intro narration');
  await page.locator('#audio-stop').click();
  await page.waitForFunction(() => audioProbe.player.paused);
  await page.waitForFunction(() => audioProbe.gains[1].gain.value > 0.06);
  assert(await page.evaluate(() => audioProbe.contexts[0].state === 'running'), 'Stop reading keeps music running');
  await page.locator('[data-audio="music"]').click();
  const musicCount = await page.evaluate(() => audioProbe.oscillatorStarts);
  await page.waitForTimeout(850);
  assert(await page.evaluate(count => audioProbe.oscillatorStarts === count, musicCount), 'Music off stops scheduling');
  await page.getByRole('button', { name: 'Start quest' }).click();
  await page.locator('#decision').waitFor();
  assert(await page.evaluate(() => audioProbe.utterances.at(-1).endsWith('/1.1-story.mp3')), 'Story narration');
  await page.locator('#decision').click();
  assert(await page.evaluate(() => audioProbe.utterances.at(-1).endsWith('/1.1-question.mp3')), 'Questions and math options narrated');
  await page.locator('#hint').click();
  assert(await page.evaluate(() => audioProbe.utterances.at(-1).endsWith('/1.1-hint.mp3')), 'Exact hint narration');
  await page.locator('[data-option="1"]').click();
  assert(await page.evaluate(() => audioProbe.utterances.at(-1).endsWith('/1.1-retry.mp3')), 'Wrong-choice consequence narration');
  await page.locator('[data-option="0"]').click();
  assert(await page.evaluate(() => audioProbe.utterances.at(-1).endsWith('/1.1-success.mp3')), 'Success narration');
  await page.locator('#next').click();
  await page.locator('[data-audio="voice"]').click();
  await page.locator('[data-audio="sounds"]').click();
  const silent = await page.evaluate(() => ({ voice: audioProbe.utterances.length, sounds: audioProbe.oscillatorStarts }));
  await page.locator('#decision').click();
  assert(await page.evaluate(before => audioProbe.utterances.length === before.voice && audioProbe.oscillatorStarts === before.sounds, silent), 'Independent voice and sounds off');
  await page.locator('#audio-volume').fill('25');
  assert(await page.locator('output').textContent() === '25%', 'Volume control');
  assert(await page.evaluate(() => JSON.parse(localStorage.getItem('ratio-quest-audio-v1')).volume === 25), 'Preferences saved');
  await page.reload();
  assert(await page.locator('#audio-enable').textContent() === 'Enable audio', 'Reload waits for user gesture');
  assert(await page.locator('[data-audio="music"]').getAttribute('aria-pressed') === 'false', 'Music preference persists');
  assert(await page.locator('[data-audio="voice"]').getAttribute('aria-pressed') === 'false', 'Voice preference persists');
  assert(await page.evaluate(() => audioProbe.contexts.length === 0 && audioProbe.utterances.length === 0), 'Preferences do not trigger autoplay');
  await page.locator('#audio-read').click();
  await page.waitForFunction(() => audioProbe.starts.length > 0);
  assert(await page.locator('[data-audio="voice"]').getAttribute('aria-pressed') === 'true', 'Read screen enables narration');
  await page.locator('[data-audio="music"]').click();
  await page.getByRole('link', { name: 'Teacher view' }).click();
  await page.locator('#roster-form').waitFor();
  await page.waitForFunction(() => audioProbe.contexts[0]?.state === 'suspended');
  assert(await page.locator('#audio-read').isDisabled(), 'Teacher view disables read');
  assert(await page.evaluate(() => audioProbe.player.paused), 'Teacher view cancels voice');
  await page.getByRole('link', { name: 'Quest map', exact: true }).click();
  await page.locator('.hero').waitFor();
  await page.waitForFunction(() => audioProbe.contexts[0]?.state === 'running');
  await page.locator('#audio-enable').click();
  await page.waitForFunction(() => audioProbe.contexts[0]?.state === 'suspended' && audioProbe.player.paused);
  const stopped = await page.evaluate(() => audioProbe.oscillatorStarts);
  await page.waitForTimeout(500);
  assert(await page.evaluate(before => audioProbe.oscillatorStarts === before, stopped), 'Mute all stops music');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'output/playwright/audio-phone.png', fullPage: true });
  const voice = await page.evaluate(async () => (await import('./assets/narration/manifest.js')).NARRATOR);
  assert(errors.length === 0, `Console errors: ${errors.join('; ')}`);
  return { pass: true, voice, verified: ['Actual recorded audio playing events', 'Original music and effects start native oscillators', 'Music gain ducks during narration and recovers afterward', 'No autoplay, independent toggles, replay voice, volume, saved settings', 'Mute and quiet teacher view', 'Phone and desktop controls'], errors };
}
