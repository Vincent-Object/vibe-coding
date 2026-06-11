/* audio.js — NES-style chiptune engine (WebAudio, square + triangle channels). */
'use strict';

const AudioSys = {
  ctx: null,
  muted: false,
  songTimer: null,
  current: null,

  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSong(); else if (this._wantSong) this.playSong(this._wantSong);
    return this.muted;
  },

  // ---- low-level voice ----
  tone(freq, when, dur, type, vol, freqEnd) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, when);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), when + dur);
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.connect(g); g.connect(c.destination);
    o.start(when); o.stop(when + dur + 0.02);
  },
  noise(when, dur, vol, low) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource();
    s.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    if (low) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 700;
      s.connect(f); f.connect(g);
    } else s.connect(g);
    g.connect(c.destination);
    s.start(when);
  },

  now() { return this.ctx ? this.ctx.currentTime : 0; },

  // ---- sound effects ----
  sfx(name) {
    if (!this.ctx || this.muted) return;
    const t = this.now();
    switch (name) {
      case 'jump':     this.tone(220, t, 0.18, 'square', 0.18, 660); break;
      case 'bigjump':  this.tone(150, t, 0.22, 'square', 0.18, 480); break;
      case 'coin':
        this.tone(988, t, 0.07, 'square', 0.2);
        this.tone(1319, t + 0.07, 0.35, 'square', 0.2); break;
      case 'stomp':    this.tone(420, t, 0.12, 'square', 0.2, 120); break;
      case 'kick':     this.tone(760, t, 0.08, 'square', 0.2, 900); break;
      case 'bump':     this.tone(120, t, 0.09, 'square', 0.22, 80); break;
      case 'break':    this.noise(t, 0.25, 0.3, true); this.tone(160, t, 0.1, 'square', 0.15, 60); break;
      case 'sprout':   this.tone(200, t, 0.4, 'square', 0.15, 900); break;
      case 'powerup': {
        const seq = [523, 659, 784, 1047, 1319, 1568];
        seq.forEach((f, i) => this.tone(f, t + i * 0.055, 0.09, 'square', 0.18));
        break;
      }
      case '1up': {
        const seq = [659, 784, 1319, 1047, 1175, 1568];
        seq.forEach((f, i) => this.tone(f, t + i * 0.09, 0.12, 'square', 0.18));
        break;
      }
      case 'hurt':     this.tone(500, t, 0.3, 'square', 0.2, 100); break;
      case 'fire':     this.tone(700, t, 0.09, 'square', 0.16, 250); break;
      case 'flag':     this.tone(200, t, 0.7, 'square', 0.16, 1400); break;
      case 'bowserfall': this.tone(300, t, 0.6, 'square', 0.22, 40); this.noise(t + 0.1, 0.5, 0.25, true); break;
      case 'bowserfire': this.noise(t, 0.3, 0.2, true); this.tone(180, t, 0.25, 'sawtooth', 0.1, 90); break;
      case 'tick':     this.tone(900, t, 0.04, 'square', 0.12); break;
      case 'pause':    this.tone(660, t, 0.08, 'square', 0.15); this.tone(880, t + 0.1, 0.08, 'square', 0.15); break;
    }
  },

  // ---- music sequencer ----
  // Note token: "C4" "Eb3" "F#5" | "." rest | "~" extend previous note.
  parseTrack(str) {
    const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const toks = str.trim().split(/\s+/);
    const out = [];
    for (const tk of toks) {
      if (tk === '.') { out.push(null); continue; }
      if (tk === '~') { out.push('~'); continue; }
      const m = tk.match(/^([A-G])([#b]?)(\d)$/);
      if (!m) { out.push(null); continue; }
      let semi = NOTE[m[1]];
      if (m[2] === '#') semi++; else if (m[2] === 'b') semi--;
      const midi = (parseInt(m[3], 10) + 1) * 12 + semi;
      out.push(440 * Math.pow(2, (midi - 69) / 12));
    }
    return out;
  },

  songs: null,
  buildSongs() {
    const P = (s) => this.parseTrack(s);
    this.songs = {
      overworld: {
        step: 0.16,
        mel: P(`E5 G5 A5 G5 E5 C5 D5 E5 G5 . E5 . C5 . . .
                F5 A5 C6 A5 G5 E5 C5 D5 E5 ~ D5 ~ C5 ~ . .
                E5 G5 A5 G5 E5 C5 D5 E5 G5 . A5 . B5 . . .
                C6 B5 A5 G5 A5 G5 E5 D5 C5 ~ ~ ~ . . . .`),
        bass: P(`C3 . G2 . C3 . G2 . A2 . E2 . F2 . G2 .
                 F2 . C3 . F2 . C3 . G2 . D2 . C3 . G2 .
                 C3 . G2 . C3 . G2 . A2 . E2 . G2 . B2 .
                 A2 . E2 . F2 . G2 . C3 . G2 . C3 . . .`),
        type: 'square',
      },
      underground: {
        step: 0.18,
        mel: P(`C4 . Eb4 . C4 . G3 . Ab3 . C4 . G3 . . .
                C4 . Eb4 . F4 . Eb4 . C4 ~ . . . . . .`),
        bass: P(`C2 . . . C2 . . . Ab1 . . . G1 . . .
                 C2 . . . F1 . . . C2 . . . G1 . . .`),
        type: 'square',
      },
      athletic: {
        step: 0.13,
        mel: P(`C5 E5 G5 C6 . G5 E5 C5 D5 F5 A5 D6 . A5 F5 D5
                E5 G5 B5 E6 . B5 G5 E5 F5 D5 B4 G4 C5 ~ . .
                C5 E5 G5 C6 . G5 E5 C5 A4 C5 F5 A5 . F5 C5 A4
                G4 B4 D5 G5 B5 G5 D5 B4 C5 ~ ~ ~ . . . .`),
        bass: P(`C3 . C3 . D3 . D3 . E3 . E3 . G2 . G2 .
                 C3 . C3 . G2 . G2 . C3 . G2 . C3 . . .
                 C3 . C3 . F2 . F2 . F2 . F2 . F2 . A2 .
                 G2 . G2 . G2 . G2 . C3 . G2 . C3 . . .`),
        type: 'square',
      },
      castle: {
        step: 0.15,
        mel: P(`C4 Db4 C4 Db4 C4 . G4 . C4 Db4 C4 Db4 C4 . Eb4 .
                C4 Db4 C4 Db4 C4 . G4 . Ab4 G4 Eb4 Db4 C4 ~ . .`),
        bass: P(`C2 . . . G1 . . . C2 . . . Ab1 . . .
                 C2 . . . G1 . . . Ab1 . G1 . C2 . . .`),
        type: 'triangle',
      },
    };
  },

  _wantSong: null,
  playSong(name) {
    this._wantSong = name;
    this.stopSongTimer();
    if (!this.ctx || this.muted || !name) return;
    if (!this.songs) this.buildSongs();
    const song = this.songs[name];
    if (!song) return;
    this.current = name;
    let idx = 0;
    let nextTime = this.now() + 0.06;
    const len = song.mel.length;
    const schedule = () => {
      const horizon = this.now() + 0.25;
      while (nextTime < horizon) {
        const playTrack = (track, vol, type) => {
          const v = track[idx % track.length];
          if (v && v !== '~') {
            // count extensions
            let d = 1, j = (idx + 1);
            while (track[j % track.length] === '~' && d < 8) { d++; j++; }
            this.tone(v, nextTime, song.step * d * 0.92, type, vol);
          }
        };
        playTrack(song.mel, 0.12, song.type);
        playTrack(song.bass, 0.14, 'triangle');
        idx = (idx + 1) % len;
        nextTime += song.step;
      }
    };
    schedule();
    this.songTimer = setInterval(schedule, 80);
  },
  stopSongTimer() {
    if (this.songTimer) { clearInterval(this.songTimer); this.songTimer = null; }
  },
  stopSong() {
    this.stopSongTimer();
    this.current = null;
  },

  // one-shot jingles (stop music first)
  jingle(name) {
    this.stopSong();
    this._wantSong = null;
    if (!this.ctx || this.muted) return;
    const t = this.now();
    if (name === 'clear') {
      const seq = [392, 523, 659, 784, 1047, 1319, 1568];
      seq.forEach((f, i) => this.tone(f, t + i * 0.09, 0.14, 'square', 0.18));
      this.tone(1568, t + 7 * 0.09, 0.5, 'square', 0.16);
    } else if (name === 'death') {
      this.tone(392, t, 0.12, 'square', 0.2);
      this.tone(330, t + 0.14, 0.12, 'square', 0.2);
      this.tone(262, t + 0.28, 0.2, 'square', 0.2);
      this.tone(196, t + 0.5, 0.45, 'square', 0.2);
    } else if (name === 'gameover') {
      const seq = [[262, 0], [196, 0.25], [165, 0.5], [220, 0.8], [247, 1.0], [220, 1.2], [208, 1.45], [233, 1.65], [208, 1.85], [196, 2.1]];
      seq.forEach(([f, d]) => this.tone(f, t + d, 0.2, 'square', 0.18));
    } else if (name === 'win') {
      const seq = [523, 659, 784, 1047, 988, 1175, 1319, 1568];
      seq.forEach((f, i) => this.tone(f, t + i * 0.12, 0.18, 'square', 0.18));
      this.tone(2093, t + 8 * 0.12, 0.8, 'square', 0.15);
    }
  },
};
