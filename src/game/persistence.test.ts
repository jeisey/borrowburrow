import { describe, expect, it } from 'vitest'
import { closeForAfternoon, feature, lend, newGame, openDoors } from './engine'
import {
  DEFAULT_SETTINGS,
  SAVE_KEY,
  clearGame,
  loadGame,
  loadSettings,
  saveGame,
  saveSettings,
  type KeyValueStore,
} from './persistence'

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

describe('persistence', () => {
  it('round-trips a game mid-day, provenance and all', () => {
    const store = memoryStore()
    let s = feature(feature(newGame(9), 'telescope'), 'camera')
    s = openDoors(s)
    s = lend(lend(s, 'telescope'), 'camera')
    s = closeForAfternoon(s)
    saveGame(s, store)
    const loaded = loadGame(store)
    expect(loaded).toEqual(s)
    expect(loaded!.objects.telescope!.history.length).toBe(1)
    expect(loaded!.report.echoes.length).toBeGreaterThan(0)
  })

  it('ignores corrupted or foreign saves instead of crashing', () => {
    const store = memoryStore()
    store.setItem(SAVE_KEY, '{not json')
    expect(loadGame(store)).toBeNull()
    store.setItem(SAVE_KEY, JSON.stringify({ ...newGame(1), version: 999 }))
    expect(loadGame(store)).toBeNull()
    store.setItem(SAVE_KEY, JSON.stringify({ version: 1, day: 'three' }))
    expect(loadGame(store)).toBeNull()
    expect(loadGame(undefined)).toBeNull()
  })

  it('clearing the save starts fresh', () => {
    const store = memoryStore()
    saveGame(newGame(3), store)
    expect(loadGame(store)).not.toBeNull()
    clearGame(store)
    expect(loadGame(store)).toBeNull()
  })

  it('keeps settings separately, with safe defaults', () => {
    const store = memoryStore()
    expect(loadSettings(store)).toEqual(DEFAULT_SETTINGS)
    saveSettings({ muted: true, reducedMotion: 'on' }, store)
    expect(loadSettings(store)).toEqual({ muted: true, reducedMotion: 'on' })
    store.setItem('borrowburrow/settings/v1', '{"muted":"yes"}')
    expect(loadSettings(store)).toEqual(DEFAULT_SETTINGS)
  })
})
