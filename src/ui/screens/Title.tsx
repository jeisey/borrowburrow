import { ResidentArt } from '../../art/residents'
import { WEEKDAYS } from '../../game/content/world'
import type { GameState } from '../../game/types'
import type { Orient } from '../Stage'
import { VillageMap } from '../village/VillageMap'
import { HOME_AT } from '../village/mapGeo'

interface Props {
  orient: Orient
  save: GameState | null
  onNew: () => void
  onContinue: () => void
}

/** The title: Mosswick at dusk, the Borrowburrow's lamp lit. */
export function Title({ orient, save, onNew, onContinue }: Props) {
  const figures = (['tansy', 'barnaby', 'odile', 'tobias', 'margo'] as const).map((id) => ({ id, at: HOME_AT[id], flip: HOME_AT[id][0] > 800 }))
  const where = save
    ? save.festivalDone && save.phase === 'epilogue'
      ? 'the week is done'
      : `${WEEKDAYS[(save.day - 1) % 7]}, day ${save.day}`
    : ''
  return (
    <div className={`title title--${orient}`}>
      <div className="title__map">
        <VillageMap time="dusk" weather="sunny" figures={figures} showSigns={false} />
      </div>
      <div className="title__sign">
        <svg className="title__strings" viewBox="0 0 600 70" aria-hidden="true">
          <path d="M300 6 L90 66 M300 6 L510 66" stroke="#2b211c" strokeWidth={3} fill="none" />
          <circle cx={300} cy={8} r={7} fill="#c9a24a" stroke="#2b211c" strokeWidth={2.4} />
        </svg>
        <div className="title__board">
          <h1 className="title__word" aria-label="Borrowburrow">
            {'Borrowburrow'.split('').map((ch, i) => (
              <span key={i} style={{ transform: `rotate(${((i * 37) % 7) - 3}deg) translateY(${((i * 13) % 5) - 2}px)` }}>
                {ch}
              </span>
            ))}
          </h1>
          <p className="title__sub hand">a Library of Things</p>
        </div>
      </div>
      <div className="title__menu">
        {save ? (
          <>
            <button className="tag-button tag-button--main" onClick={onContinue} data-autofocus>
              <span>Continue</span>
              <small className="hand">{where}</small>
            </button>
            <button className="tag-button" onClick={onNew}>
              <span>Start a new week</span>
            </button>
          </>
        ) : (
          <button className="tag-button tag-button--main" onClick={onNew} data-autofocus>
            <span>Open the doors</span>
            <small className="hand">a new week in Mosswick</small>
          </button>
        )}
        <p className="title__blurb">
          Lend things to your neighbours. They come back with stories — and the village grows around what it shares.
        </p>
      </div>
      <div className="title__hollis" aria-hidden="true">
        <ResidentArt id="hollis" />
      </div>
    </div>
  )
}
