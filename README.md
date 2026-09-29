# Borrowburrow — A Library of Things

A small, cozy browser game. You keep the Borrowburrow, a lending house dug into a hill in
Mosswick, a village of animals. Nothing is for sale. Your neighbours borrow things, take them
out into the village, and bring them back changed: a sticker on the telescope, a jam stain
on the picnic blanket, a note tucked into the board game. Every object keeps a library card
of where it has been and with whom, and that history decides what happens the next time
someone borrows it. Over a week the village knits itself together out of the things it
shares.

## Running it

Needs Node 20.19+ or 22.12+.

```sh
npm install
npm run dev        # play at http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
npm test           # engine, content and persistence tests (Vitest)
npm run typecheck
npm run lint       # oxlint
```

The build uses relative asset paths, so `dist/` can be served from any static host or
subfolder. There's no backend and there are no keys. Progress saves to `localStorage` as you
play. To play a particular week again, add `?seed=1234` to the address (the drawer shows the
current week's number): the weather and visitors come back the same, and your choices do the
rest.

## A day at the Borrowburrow

1. **Morning.** Read the notice board, the weather and the gossip pinned to the wall. Choose
   what goes on today's counter from the Collection. It starts with 12 things and grows to 19
   as gifts arrive, and the counter goes from six places to eight as the village's Threads
   grow. Things that came back yesterday are tagged "just back" and show their new marks.
2. **Open hours.** Neighbours come in one at a time and say what they're after without naming
   an object ("I'm going to look at the Moon properly tonight"). Offer anything on the
   counter. They react to it, and if the thing remembers someone they'll notice ("Is that
   Barnaby's drip of candle wax?"). Stamp the card to lend it. Several answers usually fit,
   and none of them is wrong.
3. **Afternoon echoes.** The village map follows each lent thing to where it ended up, one
   illustrated Echo card at a time. Two loans can meet in the same scene.
4. **Evening returns.** Things come home with their new marks. Parcels turn up on the
   doorstep. New stitches go on the Threads hoop. Lock up and sleep.

Day 7 is Lantern Night. It's put together from whatever actually happened in your week, and
the Keeper's journal comes after it. You can keep the doors open or start a new week. There's
no fail state, no money and no score.

## How the systems fit together

- **Provenance is the state.** Each object holds an append-only history (who, with whom,
  where, when, weather, what happened), its marks and anything left inside it
  (`src/game/types.ts`). Nothing else records relationships.
- **Echoes are data.** About 210 echo definitions (`src/game/content/echoes.ts`) are written
  in a small condition/outcome DSL (`src/game/defs.ts`). Conditions can test the object, the
  borrower, the weather, a clear night, the request, the day, world flags, which places are
  open, the object's own history (`history`) and who it points to. For example, `prev` means
  "someone who borrowed this before" and `trace` means "whoever left the most recent mark or
  keepsake". Outcomes set the place and time, a mark, a keepsake, flags, delayed events and
  mending. The engine picks the best candidate for each loan and keeps everyone in one place
  per time of day.
- **History feeds back, visibly.** An object's past shows up in the morning gossip ("The
  lantern still has Barnaby's drip of candle wax on it — and Hollis is coming in today"), in
  what the visitor says when you offer it, in trace echoes where the new borrower follows the
  mark back to its owner, and in the borrower's signature mark added beside the old one.
- **Threads are derived.** Relationships are computed from shared moments in object histories
  (`deriveThreads` in `src/game/query.ts`). The Thread board and hoop are just views of that.
- **Consequences build up.** Some echoes plant things that bloom days later, and some unlock
  places (fixing the Glasshouse door opens the Glasshouse). World-level happenings fire from
  thread and flag state: the Astronomy Club forms once enough neighbours have stargazed and
  someone has seen Saturn, and Hollis's housewarming happens once he has friends to invite.
  Donations grow the collection when the village earns them. The Lantern Night segments
  come from these same flags.
- **Deterministic.** Each week has a seed. All randomness comes from hashed streams keyed by
  seed and context (`src/game/rng.ts`), so the same seed with the same choices gives the same
  week. The tests rely on this.

## Code layout

```
src/game/            pure engine: no React, no DOM
  types.ts defs.ts   state shape and the echo DSL
  engine.ts          actions (feature, open, lend, close, evening, sleep, festival) and echo resolution
  query.ts           derived views: threads, photos, borrowers…
  persistence.ts     versioned, validated localStorage saves
  content/           residents, objects, requests, echoes, joint echoes, happenings, festival, notices
src/state/useGame.ts reducer wrapper and autosave
src/art/             hand-drawn SVG residents, objects and marks; shared filters (wobble, paper grain)
src/ui/              the diorama: house/, village/, overlays/, screens/, threads/
src/audio/sfx.ts     procedural Web Audio cues (no audio files)
```

The UI is laid out on a fixed "diorama stage", 1600×900 in landscape and 900×1600 in
portrait, and scaled to fit the window, so every scene is composed by hand rather than
reflowed.

## Accessibility and comfort

- The whole game can be played with the keyboard. Every control is a real button with a
  label, and focus is always visible. When a scene changes, focus moves to its main action.
  Sheets trap focus and close with Escape.
- Reduced motion follows your device, and you can override it in the Keeper's drawer (the
  key icon). Sound can be muted from the bell icon, and the setting is remembered.
- The Keeper's drawer can also reset the save, after asking first.
- Layouts are composed for desktop and for phones or tablets held upright.

## Tests

`npm test` runs 35 tests: content integrity (every reference resolves and no template is left
unfilled), provenance and echo resolution (history is written, marks and keepsakes are found
by the next borrower, joint echoes, planting and unlocks, derived threads), determinism,
simulated whole weeks that must reach Lantern Night with no unfilled text, and saves that
round-trip mid-day while corrupted or foreign saves are ignored rather than crashing.
