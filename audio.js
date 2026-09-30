import { NARRATION_AUDIO } from './assets/narration/manifest.js';

// Recorded narration and original synthesized music. Audio begins only after a tap.
const SETTINGS_KEY = 'ratio-quest-audio-v1';
const DEFAULTS = { voice: true, music: true, sounds: true, volume: 60 };

export function loadAudioSettings(raw) {
  try {
    const saved = JSON.parse(raw);
    return {
      voice: typeof saved?.voice === 'boolean' ? saved.voice : DEFAULTS.voice,
      music: typeof saved?.music === 'boolean' ? saved.music : DEFAULTS.music,
      sounds: typeof saved?.sounds === 'boolean' ? saved.sounds : DEFAULTS.sounds,
      volume: Number.isFinite(saved?.volume) ? Math.max(0, Math.min(100, saved.volume)) : DEFAULTS.volume
    };
  } catch { return { ...DEFAULTS }; }
}

// Speak mathematical punctuation explicitly while keeping the visible bank untouched.
export function spokenMath(text) {
  return text
    .replace(/\b(\d+(?:\.\d+)?|x)\/(\d+(?:\.\d+)?)\b/g, '$1 divided by $2')
    .replace(/\$(\d+(?:\.\d+)?)/g, '$1 dollars')
    .replace(/(\d+(?:\.\d+)?)%/g, '$1 percent')
    .replace(/(\d+)\s*:\s*(\d+)/g, '$1 to $2')
    .replace(/=/g, ' equals ')
    .replace(/\(0,0\)/g, '(zero, zero)');
}

export class QuestAudio {
  constructor(panel, readScreen) {
    this.panel = panel;
    this.readScreen = readScreen;
    try { this.settings = loadAudioSettings(localStorage.getItem(SETTINGS_KEY)); }
    catch { this.settings = { ...DEFAULTS }; }
    this.enabled = false;
    this.teacher = false;
    this.nodes = new Set();
    this.voicePlayer = new Audio();
    this.voicePlayer.preload = 'none';
    this.canSpeak = true;
    this.canPlay = Boolean(window.AudioContext || window.webkitAudioContext);
    this.message = 'Tap Enable audio to hear the adventure.';
    this.narrationId = 0;
    this.screenKey = '';
    panel.addEventListener('click', event => this.handleClick(event));
    panel.addEventListener('input', event => {
      if (event.target.id !== 'audio-volume') return;
      this.settings.volume = Number(event.target.value);
      this.persist();
      this.updateGains();
      panel.querySelector('output').textContent = `${this.settings.volume}%`;
      this.voicePlayer.volume = this.settings.volume / 100;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopVoice();
        this.stopMusic();
        this.stopNodes('effect');
        this.context?.suspend().catch(() => {});
      } else if (this.enabled && !this.teacher) {
        this.context?.resume().then(() => this.startMusic()).catch(() => {});
      }
    });
    window.addEventListener('pagehide', () => this.mute());
    this.renderControls();
  }

  persist() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch { /* Session controls still work. */ }
  }

  renderControls() {
    this.panel.innerHTML = `<div class="audio-top"><div><strong>♫ Adventure audio</strong><p id="audio-status" role="status">${this.teacher ? 'Teacher view stays quiet.' : this.message}</p></div><button id="audio-enable" class="audio-main" aria-pressed="${this.enabled}">${this.enabled ? 'Mute all' : 'Enable audio'}</button></div><div class="audio-options">${['voice', 'music', 'sounds'].map(type => `<button data-audio="${type}" aria-pressed="${this.settings[type]}" ${type === 'voice' && !this.canSpeak || type !== 'voice' && !this.canPlay ? 'disabled' : ''}>${{voice:'Voice',music:'Music',sounds:'Sounds'}[type]} <span>${this.settings[type] ? 'on' : 'off'}</span></button>`).join('')}<button id="audio-read" ${!this.canSpeak || this.teacher ? 'disabled' : ''}>Read this screen</button><button id="audio-stop" ${!this.canSpeak ? 'disabled' : ''}>Stop reading</button><label class="audio-volume" for="audio-volume">Volume <input id="audio-volume" type="range" min="0" max="100" value="${this.settings.volume}"><output for="audio-volume">${this.settings.volume}%</output></label></div>`;
  }

  setMessage(message) {
    this.message = message;
    const status = this.panel.querySelector('#audio-status');
    if (status) status.textContent = this.teacher ? 'Teacher view stays quiet.' : message;
  }

  async activate() {
    this.enabled = true;
    if (this.canPlay) {
      try {
        if (!this.context) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.context = new AudioContext();
          this.master = this.context.createGain();
          this.musicBus = this.context.createGain();
          this.effectsBus = this.context.createGain();
          this.master.connect(this.context.destination);
          this.musicBus.connect(this.master);
          this.effectsBus.connect(this.master);
        }
        this.updateGains();
        if (!this.teacher) await this.context.resume();
      } catch { this.setMessage('Music and sounds are unavailable in this browser. You can still read and play.'); }
    }
    if (this.teacher) this.context?.suspend().catch(() => {});
    else {
      this.startMusic();
      if (this.context?.state === 'running' || this.canSpeak) this.setMessage('Audio enabled. Make it your mix.');
      else this.setMessage('Audio is unavailable in this browser. The adventure still works.');
    }
    this.renderControls();
  }

  mute() {
    this.enabled = false;
    this.stopVoice();
    this.stopMusic();
    this.stopNodes('effect');
    this.context?.suspend().catch(() => {});
    this.setMessage('Audio muted. Tap Enable audio when you’re ready.');
    this.renderControls();
  }

  async handleClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.id === 'audio-enable') {
      if (this.enabled) this.mute();
      else {
        // Start narration inside the tap, including browsers with stricter autoplay policies.
        const activation = this.activate();
        if (!this.teacher) this.speak(this.readScreen());
        await activation;
      }
    } else if (button.dataset.audio) {
      const type = button.dataset.audio;
      this.settings[type] = !this.settings[type];
      this.persist();
      if (type === 'voice') {
        if (this.settings.voice) this.speak(this.readScreen());
        else this.stopVoice();
      }
      if (type === 'music') this.settings.music ? this.startMusic() : this.stopMusic();
      if (type === 'sounds' && !this.settings.sounds) this.stopNodes('effect');
      this.renderControls();
    } else if (button.id === 'audio-read') {
      this.settings.voice = true;
      this.persist();
      const activation = this.enabled ? Promise.resolve() : this.activate();
      this.speak(this.readScreen());
      await activation;
      this.renderControls();
    } else if (button.id === 'audio-stop') this.stopVoice();
  }

  updateGains() {
    if (!this.context || !this.master) return;
    this.master.gain.setTargetAtTime(this.settings.volume / 100, this.context.currentTime, 0.04);
    this.musicBus.gain.setTargetAtTime(this.speaking ? 0.018 : 0.075, this.context.currentTime, 0.1);
    this.effectsBus.gain.value = 0.2;
  }

  stopVoice() {
    this.narrationId++;
    this.voicePlayer.pause();
    this.voicePlayer.onended = null;
    this.voicePlayer.onerror = null;
    this.voicePlayer.removeAttribute('src');
    this.voicePlayer.load();
    this.speaking = false;
    this.updateGains();
  }

  speak(entry) {
    this.stopVoice();
    if (!this.enabled || !this.settings.voice || this.teacher || document.hidden || !entry || this.settings.volume === 0) return;
    const id = this.narrationId;
    const clip = NARRATION_AUDIO[entry.id];
    if (!clip || clip.text !== entry.text) {
      this.setMessage('This recording isn’t available. You can keep playing with the text.');
      return;
    }
    this.voicePlayer.src = new URL(clip.src, document.baseURI).href;
    this.voicePlayer.volume = this.settings.volume / 100;
    this.speaking = true;
    this.updateGains();
    this.voicePlayer.onended = () => {
      if (id !== this.narrationId) return;
      this.speaking = false;
      this.updateGains();
    };
    const failed = () => {
      if (id !== this.narrationId) return;
      this.speaking = false;
      this.updateGains();
      this.setMessage('The recording couldn’t play. Tap Read this screen to retry, or keep playing with the text.');
    };
    this.voicePlayer.onerror = failed;
    this.voicePlayer.play().catch(failed);
  }

  screenChanged(key, teacher = false) {
    if (key === this.screenKey && teacher === this.teacher) return;
    this.screenKey = key;
    this.teacher = teacher;
    this.stopVoice();
    if (teacher) {
      this.stopMusic();
      this.stopNodes('effect');
      this.context?.suspend().catch(() => {});
    } else if (this.enabled) {
      this.context?.resume().then(() => this.startMusic()).catch(() => {});
      this.speak(this.readScreen());
    }
    this.renderControls();
  }

  note(frequency, time, duration, amplitude, kind = 'music', wave = 'sine') {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(amplitude, time + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(kind === 'music' ? this.musicBus : this.effectsBus);
    const node = { oscillator, envelope, kind };
    this.nodes.add(node);
    oscillator.onended = () => { this.nodes.delete(node); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }

  stopNodes(kind) {
    for (const node of this.nodes) {
      if (node.kind !== kind) continue;
      node.envelope.gain.cancelScheduledValues(this.context.currentTime);
      node.envelope.gain.setValueAtTime(0, this.context.currentTime);
      try { node.oscillator.stop(); } catch { /* Already ended. */ }
    }
  }

  startMusic() {
    if (this.musicTimer || !this.enabled || !this.settings.music || this.teacher || document.hidden || this.context?.state !== 'running') return;
    this.beat = 0;
    this.nextBeat = this.context.currentTime + 0.05;
    const secondsPerBeat = 60 / 92;
    const melody = [72, 76, 79, null, 81, 79, 76, null, 77, 81, 84, null, 81, 79, 77, null, 79, 83, 86, null, 84, 83, 79, null, 76, 79, 81, 79, 76, null, 74, null];
    const bass = [48, 53, 55, 48];
    const hz = midi => 440 * 2 ** ((midi - 69) / 12);
    const schedule = () => {
      if (!this.enabled || !this.settings.music || this.teacher || document.hidden || this.context.state !== 'running') return;
      // Look ahead a little so animation or rendering cannot make the tune stutter.
      if (this.nextBeat < this.context.currentTime) this.nextBeat = this.context.currentTime + 0.05;
      while (this.nextBeat < this.context.currentTime + 0.3) {
        const step = this.beat % melody.length;
        if (melody[step] !== null) this.note(hz(melody[step]), this.nextBeat, 0.42, 0.4, 'music', 'triangle');
        if (step % 4 === 0) this.note(hz(bass[Math.floor(step / 8)]), this.nextBeat, secondsPerBeat * 3.8, 0.38);
        this.nextBeat += secondsPerBeat;
        this.beat++;
      }
    };
    schedule();
    this.musicTimer = setInterval(schedule, 100);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.stopNodes('music');
  }

  effect(type) {
    if (!this.enabled || !this.settings.sounds || this.teacher || document.hidden || this.context?.state !== 'running') return;
    const tunes = {
      click: [660], hint: [523.25, 783.99], retry: [392, 440],
      success: [523.25, 659.25, 783.99], badge: [523.25, 659.25, 783.99, 1046.5]
    };
    this.stopNodes('effect');
    (tunes[type] || tunes.click).forEach((frequency, i) => this.note(frequency, this.context.currentTime + i * 0.11, type === 'badge' ? 0.45 : 0.17, 0.38, 'effect'));
  }
}
