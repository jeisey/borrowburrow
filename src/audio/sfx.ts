// Small procedural sounds made with Web Audio — no files, nothing to download.
// Everything is quiet, short and optional.

type Wave = OscillatorType

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  muted = false

  private ensure(): AudioContext | null {
    if (this.muted) return null
    if (typeof window === 'undefined') return null
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    if (!this.ctx) {
      try {
        this.ctx = new Ctor()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.32
        this.master.connect(this.ctx.destination)
      } catch {
        return null
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private tone(freq: number, dur: number, opts: { type?: Wave; gain?: number; at?: number; slideTo?: number; attack?: number } = {}) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime + (opts.at ?? 0)
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = opts.type ?? 'sine'
    osc.frequency.setValueAtTime(freq, t)
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t + dur)
    const peak = opts.gain ?? 0.2
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + (opts.attack ?? 0.008))
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  private noise(dur: number, opts: { freq?: number; q?: number; gain?: number; at?: number; type?: BiquadFilterType } = {}) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime + (opts.at ?? 0)
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = opts.type ?? 'bandpass'
    filter.frequency.value = opts.freq ?? 1200
    filter.Q.value = opts.q ?? 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(opts.gain ?? 0.2, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filter)
    filter.connect(g)
    g.connect(this.master)
    src.start(t)
    src.stop(t + dur + 0.02)
  }

  /** Picking something up / setting it down. */
  tap() {
    this.noise(0.05, { freq: 900, q: 1.4, gain: 0.25 })
    this.tone(520, 0.08, { type: 'triangle', gain: 0.05 })
  }
  /** Paper: cards, notes, pages. */
  paper() {
    this.noise(0.16, { freq: 3200, q: 0.5, gain: 0.12, type: 'highpass' })
  }
  /** The rubber stamp, then a small bright chime. */
  lend() {
    this.tone(110, 0.16, { type: 'sine', gain: 0.35, slideTo: 55 })
    this.noise(0.07, { freq: 600, q: 1, gain: 0.3 })
    this.tone(659, 0.5, { type: 'triangle', gain: 0.07, at: 0.12 })
    this.tone(988, 0.7, { type: 'triangle', gain: 0.06, at: 0.2 })
  }
  /** The shop bell over the door. */
  bell() {
    this.tone(1760, 0.9, { gain: 0.05 })
    this.tone(2217, 0.8, { gain: 0.035, at: 0.02 })
    this.tone(1760, 0.7, { gain: 0.03, at: 0.18 })
  }
  /** Something coming home: a wooden clunk and a little ring. */
  returned() {
    this.noise(0.09, { freq: 380, q: 2, gain: 0.35 })
    this.tone(196, 0.14, { type: 'triangle', gain: 0.12 })
    this.tone(1318, 0.9, { gain: 0.045, at: 0.08 })
  }
  /** A new Thread: a rising pluck, like a string being tied. */
  thread() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => this.tone(f, 0.55, { type: 'triangle', gain: 0.07, at: i * 0.075 }))
  }
  /** A village Happening. */
  happening() {
    ;[392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.9, { type: 'sine', gain: 0.06, at: i * 0.11 }))
  }
  /** Morning: a music-box phrase. */
  day() {
    ;[783.99, 659.25, 523.25, 587.33, 659.25].forEach((f, i) => this.tone(f, 0.7, { type: 'sine', gain: 0.06, at: i * 0.16 }))
  }
  /** Evening: lamps lit. */
  dusk() {
    ;[392, 329.63, 261.63].forEach((f, i) => this.tone(f, 1.2, { type: 'sine', gain: 0.06, at: i * 0.22 }))
  }
}

export const sfx = new Sfx()
