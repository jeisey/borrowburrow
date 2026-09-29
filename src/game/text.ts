import { LOCATIONS } from './content/world'
import { OBJECTS } from './content/objects'
import { RESIDENTS } from './content/residents'
import type { LocationId, ObjectId, ResidentId } from './types'

export interface TemplateCtx {
  borrower?: ResidentId
  other?: ResidentId
  objectId?: ObjectId
  location?: LocationId
  extra?: Record<string, string>
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/** Fill {placeholders}. Unknown placeholders are left visible so tests can catch them. */
export function fill(template: string, ctx: TemplateCtx): string {
  const b = ctx.borrower ? RESIDENTS[ctx.borrower] : undefined
  const o = ctx.other ? RESIDENTS[ctx.other] : undefined
  const obj = ctx.objectId ? OBJECTS[ctx.objectId] : undefined
  const loc = ctx.location ? LOCATIONS[ctx.location] : undefined
  const values: Record<string, string | undefined> = {
    name: b?.short,
    NAME: b?.short.toUpperCase(),
    they: b?.pronouns.they,
    them: b?.pronouns.them,
    their: b?.pronouns.their,
    They: b && cap(b.pronouns.they),
    Their: b && cap(b.pronouns.their),
    other: o?.short,
    OTHER: o?.short.toUpperCase(),
    obj: obj?.short,
    Obj: obj && cap(obj.short),
    objName: obj?.name,
    place: loc?.name,
    Place: loc && cap(loc.name),
    ...ctx.extra,
  }
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole)
}

export function listNames(ids: ResidentId[]): string {
  const n = ids.map((id) => RESIDENTS[id].short)
  if (n.length <= 1) return n.join('')
  return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}
