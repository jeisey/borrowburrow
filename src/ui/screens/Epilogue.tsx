import { ObjectArt } from '../../art/objects'
import { weekSummary } from '../../game/content/festival'
import { OBJECTS } from '../../game/content/objects'
import { RESIDENTS } from '../../game/content/residents'
import { borrowersOf, deriveThreads, timesBorrowed } from '../../game/query'
import type { GameState } from '../../game/types'
import { RESIDENT_IDS } from '../../game/types'
import { MiniPortrait } from '../house/ThreadHoop'
import type { Orient } from '../Stage'
import { ringPositions, strandColor, yarnPath } from '../threads/layout'
import { VillageMap } from '../village/VillageMap'

interface Props {
  state: GameState
  orient: Orient
  onKeepGoing: () => void
  onNewWeek: () => void
  onCard: (id: keyof typeof OBJECTS) => void
}

/** The Keeper's journal, the morning after Lantern Night. */
export function Epilogue({ state, orient, onKeepGoing, onNewWeek, onCard }: Props) {
  const sum = weekSummary(state)
  const threads = deriveThreads(state)
  const pos = ringPositions(160, 160, 110)
  const travelled = [...state.collection].filter((id) => timesBorrowed(state.objects[id]!) > 0).sort((a, b) => timesBorrowed(state.objects[b]!) - timesBorrowed(state.objects[a]!))
  const names = (ids: string[]) => ids.map((i) => RESIDENTS[i as keyof typeof RESIDENTS].short).join(', ')
  return (
    <div className={`epilogue epilogue--${orient}`}>
      <div className="epilogue__map">
        <VillageMap state={state} time="night" weather="sunny" festival showSigns={false} />
      </div>
      <article className="journal">
        <div className="journal__scroll">
        <p className="journal__kicker">From the Keeper’s journal</p>
        <h2>A week at the Borrowburrow</h2>
        <div className="journal__cols">
          <div className="journal__text">
            <p className="hand journal__line">
              {sum.lends} things lent. {sum.strands} shared moments. {sum.threads} Threads tied between neighbours who, a week ago, mostly
              said “morning.”
            </p>
            {sum.mostTravelled && (
              <p className="hand journal__line">
                The most travelled thing was the {OBJECTS[sum.mostTravelled.id].short}, which went out with {names(sum.mostTravelled.borrowers)}.
              </p>
            )}
            {sum.closest && (
              <p className="hand journal__line">
                {RESIDENTS[sum.closest.a].short} and {RESIDENTS[sum.closest.b].short} share the most: {sum.closest.strands} strands of thread.
              </p>
            )}
            <p className="hand journal__line">
              {sum.hollisFriends >= 3
                ? `Hollis arrived knowing nobody. He knows ${sum.hollisFriends} neighbours now, by their footsteps and by name.`
                : sum.hollisFriends > 0
                  ? `Hollis arrived knowing nobody. He knows ${sum.hollisFriends} now. It’s a start; he says “sorry” less.`
                  : 'Hollis is still getting his bearings. Perhaps next week.'}
            </p>
            <p className="hand journal__line">
              {sum.tansyBrave ? 'Tansy walked out into the dark this week, lantern high. She says it was nothing.' : 'Tansy still thinks the dark could be a bit less dark. There’s time.'}
            </p>
          </div>
          <svg className="journal__threads" viewBox="0 0 320 320" aria-label={`${threads.length} Threads`}>
            <circle cx={160} cy={160} r={150} fill="#efe2c4" stroke="#2b211c" strokeWidth={3} />
            {threads.map((t) =>
              t.strands.slice(0, 4).map((_, i, arr) => (
                <path key={`${t.key}-${i}`} d={yarnPath(pos[t.a], pos[t.b], i, arr.length, 45, [160, 160])} stroke={strandColor(t, i)} strokeWidth={3.4} fill="none" strokeLinecap="round" />
              )),
            )}
            {RESIDENT_IDS.map((id) => (
              <MiniPortrait key={id} id={id} x={pos[id][0]} y={pos[id][1]} r={28} present={state.present.includes(id)} />
            ))}
          </svg>
        </div>
        <h3>The well-travelled shelf</h3>
        <ul className="journal__shelf">
          {travelled.map((id) => (
            <li key={id}>
              <button onClick={() => onCard(id)} aria-label={`${OBJECTS[id].name}: borrowed ${timesBorrowed(state.objects[id]!)} times. Read its card.`}>
                <ObjectArt id={id} marks={state.objects[id]!.marks} />
                <small>
                  {OBJECTS[id].short} · {borrowersOf(state.objects[id]!).length} borrower{borrowersOf(state.objects[id]!).length === 1 ? '' : 's'}
                </small>
              </button>
            </li>
          ))}
        </ul>
        <p className="journal__note">Keep lending in this village, or start a new week: different things lent to different people make a different Mosswick.</p>
        </div>
        <div className="journal__actions">
          <button className="paper-button" onClick={onKeepGoing} data-autofocus>
            Keep the doors open
          </button>
          <button className="paper-button" onClick={onNewWeek}>
            Begin a new week
          </button>
        </div>
      </article>
    </div>
  )
}
