// Soft background music. Uses personal.musicFile if set, otherwise a
// gentle generated music-box loop (Web Audio, no external files).

import { personal } from "./config.js";

const PREF_KEY = "hlw-music";

// I – vi – IV – V in C major, as arpeggios (MIDI note numbers).
const CHORDS = [
  [60, 64, 67, 72, 76, 72, 67, 64],
  [57, 60, 64, 69, 72, 69, 64, 60],
  [53, 57, 60, 65, 69, 65, 60, 57],
  [55, 59, 62, 67, 71, 67, 62, 59],
];
const BASS = [48, 45, 41, 43];
const STEP = 0.42; // seconds per note

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function createMusic() {
  let ctx = null, master = null, timer = null, nextTime = 0, step = 0;
  let audioEl = null;
  let playing = false;

  const prefersOn = () => {
    try { return localStorage.getItem(PREF_KEY) !== "off"; } catch { return true; }
  };
  const savePref = (on) => {
    try { localStorage.setItem(PREF_KEY, on ? "on" : "off"); } catch { /* ignore */ }
  };

  function setupSynth() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;

    // Small generated reverb for a dreamy room feel.
    const len = ctx.sampleRate * 2.2;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = 0.45;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass"; lowpass.frequency.value = 2600;

    master.connect(lowpass);
    lowpass.connect(ctx.destination);
    lowpass.connect(reverb); reverb.connect(wet); wet.connect(ctx.destination);
  }

  function note(midi, time, { gain = 0.07, dur = 1.6, type = "sine" } = {}) {
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToHz(midi);
    overtone.type = "sine";
    overtone.frequency.value = midiToHz(midi) * 2;
    const og = ctx.createGain(); og.gain.value = 0.18;
    overtone.connect(og); og.connect(g);
    osc.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.start(time); overtone.start(time);
    osc.stop(time + dur + 0.05); overtone.stop(time + dur + 0.05);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 8) % CHORDS.length;
      const i = step % 8;
      note(CHORDS[bar][i] + 12, nextTime, { gain: i === 0 ? 0.075 : 0.05 });
      if (i === 0) note(BASS[bar], nextTime, { gain: 0.06, dur: 3.2, type: "triangle" });
      nextTime += STEP;
      step++;
    }
  }

  async function start() {
    if (playing) return;
    playing = true;
    if (personal.musicFile) {
      audioEl ??= Object.assign(new Audio(personal.musicFile), { loop: true, volume: 0.35 });
      try { await audioEl.play(); } catch { playing = false; }
      return;
    }
    if (!ctx) setupSynth();
    await ctx.resume();
    nextTime = ctx.currentTime + 0.1;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
    timer = setInterval(schedule, 150);
    schedule();
  }

  function stop() {
    if (!playing) return;
    playing = false;
    if (audioEl) { audioEl.pause(); return; }
    clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  }

  return {
    get playing() { return playing; },
    // Call from a user gesture (browsers block autoplay).
    startIfAllowed() { if (prefersOn()) start(); },
    toggle() {
      if (playing) { stop(); savePref(false); } else { start(); savePref(true); }
      return playing;
    },
  };
}
