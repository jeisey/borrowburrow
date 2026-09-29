import { SAVE_VERSION } from './engine'
import type { GameState, Phase } from './types'

export const SAVE_KEY = 'borrowburrow/save/v1'
export const SETTINGS_KEY = 'borrowburrow/settings/v1'

/** The subset of the Storage API we use, so tests can pass an in-memory store. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const PHASES: Phase[] = ['morning', 'open', 'echoes', 'evening', 'festival', 'epilogue']

function defaultStore(): KeyValueStore | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined
  } catch {
    return undefined
  }
}

/** Light structural validation: a save that doesn't look like a game is ignored, never trusted. */
export function isValidSave(v: unknown): v is GameState {
  if (!v || typeof v !== 'object') return false
  const s = v as Partial<GameState>
  return (
    s.version === SAVE_VERSION &&
    typeof s.seed === 'number' &&
    typeof s.day === 'number' &&
    s.day >= 1 &&
    typeof s.phase === 'string' &&
    PHASES.includes(s.phase) &&
    Array.isArray(s.collection) &&
    Array.isArray(s.shelf) &&
    Array.isArray(s.visits) &&
    Array.isArray(s.loans) &&
    Array.isArray(s.present) &&
    typeof s.objects === 'object' &&
    s.objects !== null &&
    typeof s.report === 'object' &&
    s.report !== null &&
    Array.isArray(s.report.echoes) &&
    typeof s.flags === 'object'
  )
}

export function saveGame(state: GameState, store: KeyValueStore | undefined = defaultStore()): void {
  try {
    store?.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable: the game keeps running, it just won't persist.
  }
}

export function loadGame(store: KeyValueStore | undefined = defaultStore()): GameState | null {
  try {
    const raw = store?.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidSave(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearGame(store: KeyValueStore | undefined = defaultStore()): void {
  try {
    store?.removeItem(SAVE_KEY)
  } catch {
    // ignore
  }
}

export interface Settings {
  muted: boolean
  reducedMotion: 'system' | 'on' | 'off'
}

export const DEFAULT_SETTINGS: Settings = { muted: false, reducedMotion: 'system' }

export function loadSettings(store: KeyValueStore | undefined = defaultStore()): Settings {
  try {
    const raw = store?.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_SETTINGS.muted,
      reducedMotion:
        parsed.reducedMotion === 'on' || parsed.reducedMotion === 'off' ? parsed.reducedMotion : 'system',
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings, store: KeyValueStore | undefined = defaultStore()): void {
  try {
    store?.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}
