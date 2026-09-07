import { describe, it, expect } from 'vitest'
import committedFavicon from '../../public/favicon.svg?raw'
import { buildSpritz, markSvgString, seeded, bezier } from './markGeometry'

describe('the Sillage mark', () => {
  it('is deterministic - the same spritz on every render', () => {
    // An unseeded random would make the logo shimmer between renders and would
    // make the favicon differ from the in-app mark on every build.
    expect(buildSpritz()).toEqual(buildSpritz())
  })

  it('seeds reproducibly', () => {
    const a = seeded(11)
    const b = seeded(11)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('runs the trail from the nozzle down to the lower left', () => {
    const [x0, y0] = bezier(0)
    const [x1, y1] = bezier(1)
    expect([x0, y0]).toEqual([150, 52]) // the nozzle
    expect(x1).toBeLessThan(x0) // travels left
    expect(y1).toBeGreaterThan(y0) // and down
  })

  it('fades and narrows along the trail', () => {
    const motes = buildSpritz()
    const first = motes[0]
    const last = motes[motes.length - 1]
    expect(last.o).toBeLessThan(first.o)
    expect(last.r).toBeLessThan(first.r)
  })

  it('matches the committed favicon - if this fails run `npm run gen:favicon`', () => {
    // Drift guard: public/favicon.svg is generated from markSvgString(). If the
    // mark changes and the favicon is not regenerated, the tab icon silently
    // stops being the logo. This test is the thing that notices.
    expect(committedFavicon.trim()).toBe(markSvgString().trim())
  })
})
