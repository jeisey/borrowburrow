// Small deterministic randomness: the same seed and the same choices always
// produce the same week, which keeps the game coherent and testable.

export type Rng = () => number

export function hashString(str: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** An RNG stream keyed by the game seed plus a context label. */
export function rngFor(seed: number, ...context: (string | number)[]): Rng {
  return mulberry32(hashString(`${seed}:${context.join(':')}`))
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A seed from the page address (`?seed=1234`), so a week can be begun again exactly. */
export function seedFromUrl(search: string): number | undefined {
  const raw = new URLSearchParams(search).get('seed')?.trim() ?? ''
  if (!/^\d+$/.test(raw)) return undefined
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : undefined
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}
