import { afterEach, describe, expect, it, vi } from 'vitest'
import { morph } from './motion'

afterEach(() => {
  vi.unstubAllGlobals()
  delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
})

describe('morph', () => {
  it('just runs the update where view transitions are missing', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const update = vi.fn()
    morph(update, 'a')
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('does not animate when motion is reduced, even if the browser can', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const start = vi.fn()
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = start
    const update = vi.fn()
    morph(update)
    expect(start).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('names the bottle strip before the transition starts', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal('CSS', { escape: (s: string) => s })
    document.body.innerHTML = '<button data-bottle="a"></button>'
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = vi.fn()
    morph(() => {}, 'a')
    expect((document.querySelector('[data-bottle="a"]') as HTMLElement).style.viewTransitionName).toBe('bottle')
  })
})
