import { useEffect, useState } from 'react'
import { ObjectArt } from '../../art/objects'
import { COUNTER_LIFT, HEAD_TOP } from '../../art/poses'
import { ResidentArt, type Mood } from '../../art/residents'
import type { Reaction } from '../../game/engine'
import type { RequestDef } from '../../game/content/requests'
import { RESIDENTS } from '../../game/content/residents'
import type { ObjectId, ResidentId } from '../../game/types'
import type { Orient } from '../Stage'

/** Where the visitor stands, in stage units. */
const VISITOR_BOX: Record<Orient, { cx: number; top: number; h: number; stageH: number }> = {
  wide: { cx: 1030, top: 392, h: 500, stageH: 900 },
  tall: { cx: 380, top: 372, h: 470, stageH: 1600 },
}

function headY(id: ResidentId, orient: Orient): number {
  const b = VISITOR_BOX[orient]
  return b.top + ((HEAD_TOP[id] - COUNTER_LIFT[id]) * b.h) / 300
}

function useTypewriter(text: string, enabled: boolean): [string, boolean, () => void] {
  const [typed, setTyped] = useState({ text, n: enabled ? 0 : text.length })
  // A new line starts typing afresh (adjusted during render, so there's no flash of the old line).
  if (typed.text !== text) setTyped({ text, n: enabled ? 0 : text.length })
  const n = !enabled ? text.length : typed.text === text ? typed.n : 0
  useEffect(() => {
    if (n >= text.length) return
    const t = window.setTimeout(() => setTyped((p) => (p.text === text ? { text, n: Math.min(text.length, p.n + 2) } : p)), 22)
    return () => window.clearTimeout(t)
  }, [n, text])
  return [text.slice(0, n), n >= text.length, () => setTyped({ text, n: text.length })]
}

interface VisitorProps {
  orient: Orient
  resident: ResidentId
  request: RequestDef
  reaction?: Reaction
  offered?: ObjectId
  stage: 'arriving' | 'here' | 'leaving'
  motion: boolean
  onDecline: () => void
}

/** A neighbour at the counter, saying what they're after without naming it. */
export function Visitor({ orient, resident, request, reaction, offered, stage, motion, onDecline }: VisitorProps) {
  const r = RESIDENTS[resident]
  const text = reaction ? reaction.line : request.text
  const [shown, done, skip] = useTypewriter(text, motion)
  const mood: Mood = !done ? 'talk' : reaction ? (reaction.tone === 'yes' ? 'happy' : reaction.tone === 'huh' ? 'surprised' : 'idle') : 'idle'
  const b = VISITOR_BOX[orient]
  const lift = (COUNTER_LIFT[resident] * b.h) / 300
  const bubbleBottom = b.stageH - headY(resident, orient) + 16
  return (
    <div className={`visitor visitor--${stage}`} aria-live="polite">
      <div
        className="visitor__figure"
        style={{ left: b.cx - (b.h * 2) / 3 / 2, top: b.top - lift, width: (b.h * 2) / 3, height: b.h }}
      >
        <ResidentArt id={resident} mood={stage === 'leaving' ? 'happy' : mood} title={`${r.name}, ${r.species.toLowerCase()}`} />
      </div>
      {offered && stage !== 'arriving' && (
        <div className={`visitor__offered ${stage === 'leaving' ? 'is-taken' : ''}`} style={{ left: b.cx + (orient === 'wide' ? 90 : 100), top: headY(resident, orient) + 70 }}>
          <ObjectArt id={offered} />
        </div>
      )}
      {stage === 'here' && (
        <div className={`bubble ${reaction ? 'bubble--reaction' : ''}`} style={{ bottom: bubbleBottom }} onClick={skip}>
          <div className="bubble__who">
            <strong>{r.short}</strong> <span>{r.role}</span>
          </div>
          <p className="bubble__text">
            {shown}
            {!done && <span className="bubble__caret" aria-hidden="true" />}
          </p>
          {reaction && done && (
            <p className="bubble__plan">
              {reaction.memory && <span className="bubble__memory hand">{reaction.memory} </span>}
              <span className="hand">{reaction.plan}</span>
            </p>
          )}
          {!reaction && done && (
            <button className="bubble__decline" onClick={onDecline}>
              Sorry — nothing for you today
            </button>
          )}
        </div>
      )}
    </div>
  )
}
