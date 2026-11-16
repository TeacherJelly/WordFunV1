import { MusicTrack } from '../types';

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 1, name: 'Sunny Meadow', mood: 'Cheerful & Bright', tempo: 112, wave: 'triangle', notes: [60, 64, 67, 72, 67, 64, 65, 69, 72, 69, 65, 62, 67, 71, 74, 72], bassNotes: [48, 48, 53, 53, 55, 55, 48, 48] },
  { id: 2, name: 'Music Box Lullaby', mood: 'Sweet & Gentle', tempo: 92, wave: 'sine', notes: [72, 76, 79, 76, 74, 71, 72, 0, 72, 77, 81, 77, 76, 74, 72, 0], bassNotes: [60, 55, 57, 55, 60, 53, 55, 60] },
  { id: 3, name: 'Bouncy Xylophone', mood: 'Playful Hop', tempo: 126, wave: 'sine', notes: [60, 67, 64, 67, 69, 72, 67, 64, 65, 69, 67, 64, 62, 67, 60, 0], bassNotes: [48, 55, 53, 55, 48, 53, 55, 48] },
  { id: 4, name: 'Toy Train Adventure', mood: 'Upbeat Rhythm', tempo: 132, wave: 'triangle', notes: [62, 66, 69, 66, 74, 69, 66, 62, 64, 67, 71, 69, 67, 66, 62, 0], bassNotes: [50, 57, 50, 57, 52, 55, 57, 50] },
  { id: 5, name: 'Starlight Waltz', mood: 'Dreamy 3/4', tempo: 100, wave: 'sine', notes: [67, 72, 76, 74, 71, 72, 69, 72, 76, 79, 76, 72], bassNotes: [48, 55, 55, 53, 55, 48] },
  { id: 6, name: 'Rainbow Hop', mood: 'Vibrant Pop', tempo: 120, wave: 'triangle', notes: [64, 67, 72, 74, 76, 74, 72, 67, 69, 72, 74, 72, 67, 64, 60, 0], bassNotes: [48, 52, 53, 55, 57, 53, 55, 48] },
  { id: 7, name: 'Gentle Forest', mood: 'Calm Nature', tempo: 96, wave: 'sine', notes: [65, 69, 72, 74, 72, 69, 67, 65, 62, 65, 69, 67, 65, 0, 69, 0], bassNotes: [53, 48, 50, 55, 53, 46, 48, 53] },
  { id: 8, name: 'Circus Parade', mood: 'Silly & Fun', tempo: 136, wave: 'square', notes: [60, 64, 67, 68, 69, 67, 65, 62, 67, 71, 74, 72, 67, 64, 60, 0], bassNotes: [48, 55, 53, 55, 48, 55, 55, 48] },
  { id: 9, name: 'Cloud Nine', mood: 'Airy & Soft', tempo: 88, wave: 'sine', notes: [72, 74, 76, 79, 76, 74, 72, 67, 69, 72, 74, 76, 72, 0, 74, 0], bassNotes: [60, 64, 65, 67, 60, 65, 67, 60] },
  { id: 10, name: 'Puppy Playtime', mood: 'Happy Bounce', tempo: 128, wave: 'triangle', notes: [67, 67, 72, 67, 69, 69, 67, 0, 65, 65, 64, 64, 62, 62, 60, 0], bassNotes: [48, 55, 53, 48, 53, 48, 55, 48] },
  { id: 11, name: 'Ocean Bubbles', mood: 'Sparkly Water', tempo: 104, wave: 'sine', notes: [60, 67, 72, 76, 79, 76, 72, 67, 62, 69, 74, 77, 74, 69, 67, 62], bassNotes: [48, 55, 50, 55, 48, 53, 55, 48] },
  { id: 12, name: 'Space Explorer', mood: 'Cosmic Wonder', tempo: 98, wave: 'triangle', notes: [57, 64, 69, 72, 71, 69, 64, 57, 60, 67, 72, 76, 74, 72, 69, 0], bassNotes: [45, 48, 52, 45, 48, 53, 55, 45] },
  { id: 13, name: 'Butterfly Garden', mood: 'Light Flutter', tempo: 116, wave: 'sine', notes: [72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 74, 0], bassNotes: [48, 55, 57, 53, 48, 55, 55, 48] },
  { id: 14, name: 'Happy Marimba', mood: 'Island Groove', tempo: 122, wave: 'sine', notes: [64, 67, 64, 60, 69, 72, 69, 65, 67, 71, 67, 62, 64, 67, 72, 0], bassNotes: [48, 48, 53, 53, 55, 55, 48, 48] },
  { id: 15, name: 'Cozy Campfire', mood: 'Warm Folk', tempo: 94, wave: 'triangle', notes: [60, 62, 64, 67, 69, 67, 64, 62, 60, 64, 67, 65, 64, 62, 60, 0], bassNotes: [48, 55, 57, 53, 48, 53, 55, 48] },
  { id: 16, name: 'Morning Dew', mood: 'Fresh Sunrise', tempo: 102, wave: 'sine', notes: [69, 72, 76, 81, 79, 76, 74, 72, 69, 72, 74, 76, 74, 72, 69, 0], bassNotes: [57, 53, 48, 55, 57, 53, 55, 57] },
  { id: 17, name: 'Candy Shop', mood: 'Sweet & Peppy', tempo: 130, wave: 'triangle', notes: [72, 72, 74, 76, 72, 76, 74, 0, 71, 71, 72, 74, 71, 74, 72, 0], bassNotes: [48, 55, 48, 55, 55, 50, 55, 48] },
  { id: 18, name: 'Magic Castle', mood: 'Storybook Harp', tempo: 106, wave: 'sine', notes: [62, 69, 74, 78, 76, 74, 69, 64, 67, 71, 74, 79, 78, 74, 71, 69], bassNotes: [50, 57, 55, 57, 50, 55, 57, 50] },
  { id: 19, name: 'Spring Breeze', mood: 'Easy & Happy', tempo: 108, wave: 'triangle', notes: [65, 69, 72, 77, 76, 74, 72, 69, 67, 70, 74, 72, 69, 67, 65, 0], bassNotes: [53, 48, 50, 55, 53, 46, 48, 53] },
  { id: 20, name: 'Bedtime Chimes', mood: 'Peaceful Bells', tempo: 82, wave: 'sine', notes: [76, 72, 74, 67, 0, 67, 74, 76, 72, 0, 76, 72, 74, 67, 72, 0], bassNotes: [60, 55, 53, 55, 60, 55, 53, 60] },
];

const midiToFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

const FEMALE_VOICE_HINTS = [
  'natural',
  'female',
  'samantha',
  'victoria',
  'aria',
  'jenny',
  'emma',
  'zira',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'serena',
  'susan',
  'allison',
  'ava',
  'hazel',
  'libby',
  'sonia',
  'clara',
  'google uk english female',
  'google us english',
];

class SoundController {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;

  public sfxEnabled = true;
  public sfxVolume = 0.7;

  public musicEnabled = false;
  public musicTrackId = 1;
  public musicVolume = 0.28;

  public voiceEnabled = true;
  public voiceName = 'auto';
  public voicePitch = 1.08;
  public voiceRate = 0.88;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
    if (this.musicEnabled && this.musicTimer === null) {
      this.startMusic();
    }
  }

  // Background Music Sequencer
  public startMusic() {
    this.stopMusic();
    if (!this.musicEnabled) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const track = MUSIC_TRACKS.find(t => t.id === this.musicTrackId) || MUSIC_TRACKS[0];
    const stepMs = (60 / track.tempo / 2) * 1000; // eighth notes
    this.musicStep = 0;

    const playStep = () => {
      if (!this.musicEnabled) return;
      const activeCtx = this.ensureContext();
      if (!activeCtx) return;

      const currentTrack = MUSIC_TRACKS.find(t => t.id === this.musicTrackId) || MUSIC_TRACKS[0];
      const now = activeCtx.currentTime;
      const note = currentTrack.notes[this.musicStep % currentTrack.notes.length];
      const vol = Math.max(0.01, this.musicVolume * 0.22);

      // Melody note
      if (note > 0) {
        const osc = activeCtx.createOscillator();
        const gain = activeCtx.createGain();
        osc.type = currentTrack.wave;
        osc.frequency.setValueAtTime(midiToFreq(note), now);

        const dur = currentTrack.wave === 'sine' ? 0.42 : 0.28;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(currentTrack.wave === 'square' ? vol * 0.35 : vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

        osc.connect(gain);
        gain.connect(activeCtx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      }

      // Bass accompaniment on every 2nd step
      if (this.musicStep % 2 === 0 && currentTrack.bassNotes.length > 0) {
        const bassMidi = currentTrack.bassNotes[Math.floor(this.musicStep / 2) % currentTrack.bassNotes.length];
        if (bassMidi > 0) {
          const bOsc = activeCtx.createOscillator();
          const bGain = activeCtx.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(midiToFreq(bassMidi), now);
          bGain.gain.setValueAtTime(0.001, now);
          bGain.gain.linearRampToValueAtTime(vol * 0.65, now + 0.02);
          bGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);
          bOsc.connect(bGain);
          bGain.connect(activeCtx.destination);
          bOsc.start(now);
          bOsc.stop(now + 0.48);
        }
      }

      this.musicStep++;
    };

    playStep();
    this.musicTimer = window.setInterval(playStep, stepMs);
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public syncMusicSettings(enabled: boolean, trackId: number, volume: number) {
    const trackChanged = this.musicTrackId !== trackId;
    const enabledChanged = this.musicEnabled !== enabled;
    this.musicEnabled = enabled;
    this.musicTrackId = trackId;
    this.musicVolume = volume;

    if (!enabled) {
      this.stopMusic();
    } else if (enabledChanged || trackChanged || this.musicTimer === null) {
      this.startMusic();
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainLevel = 0.25, delay = 0, slideTo?: number) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
      }

      const finalVol = Math.max(0.005, gainLevel * this.sfxVolume);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(finalVol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch {
      // Ignore audio restricted before gesture
    }
  }

  public playClick() {
    this.playTone(540, 0.07, 'sine', 0.18, 0, 720);
  }

  public playPickup() {
    this.playTone(380, 0.09, 'triangle', 0.2, 0, 590);
  }

  public playDrop() {
    this.playTone(460, 0.08, 'sine', 0.16, 0, 320);
  }

  public playConnect(index: number) {
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[index % scale.length];
    this.playTone(freq, 0.35, 'sine', 0.28, 0);
    this.playTone(freq * 2, 0.25, 'triangle', 0.1, 0.02);
  }

  public playDisconnect() {
    this.playTone(390, 0.14, 'triangle', 0.18, 0, 260);
  }

  public playAuditCheck() {
    this.playTone(440, 0.09, 'triangle', 0.2, 0);
    this.playTone(554.37, 0.09, 'triangle', 0.2, 0.08);
    this.playTone(659.25, 0.14, 'triangle', 0.22, 0.16);
  }

  public playTryAgain() {
    this.playTone(260, 0.16, 'triangle', 0.22, 0, 210);
    this.playTone(210, 0.22, 'triangle', 0.22, 0.14, 175);
  }

  public playSuccessFanfare() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((f, idx) => {
      this.playTone(f, idx === chord.length - 1 ? 0.7 : 0.24, 'triangle', 0.24, idx * 0.08);
    });
  }

  public playRewardChime() {
    this.playTone(880, 0.18, 'sine', 0.22, 0);
    this.playTone(1174.66, 0.25, 'sine', 0.22, 0.09);
    this.playTone(1567.98, 0.45, 'sine', 0.25, 0.18);
  }

  // Natural Speaking Voice System
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    return [...pool].sort((a, b) => {
      const aScore = this.scoreVoice(a);
      const bScore = this.scoreVoice(b);
      return bScore - aScore;
    });
  }

  private scoreVoice(v: SpeechSynthesisVoice): number {
    const name = v.name.toLowerCase();
    let score = 0;
    if (name.includes('natural')) score += 40;
    if (name.includes('online')) score += 20;
    if (name.includes('google')) score += 15;
    if (FEMALE_VOICE_HINTS.some(h => name.includes(h))) score += 30;
    if (name.includes('male') && !name.includes('female')) score -= 25;
    if (v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en-gb') score += 5;
    return score;
  }

  public pickBestFemaleVoice(): SpeechSynthesisVoice | undefined {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return undefined;
    if (this.voiceName && this.voiceName !== 'auto') {
      const exact = voices.find(v => v.name === this.voiceName);
      if (exact) return exact;
    }
    return voices[0];
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = this.pickBestFemaleVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.pitch = this.voicePitch;
      utterance.rate = this.voiceRate;
      utterance.volume = 1;

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }
}

export const sound = new SoundController();
