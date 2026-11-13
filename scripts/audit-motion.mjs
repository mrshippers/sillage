// Emil checklist over the stylesheet. Exit 1 on any finding. Rare surfaces (the welcome, the open bottle's
// first draw, ambient loops) may run long; they are named here and nowhere else.
import { readFileSync } from 'node:fs'
const css = readFileSync(new URL('../src/sillage/atelier.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RARE = /\b(splash|welcome|wm-|mist|soak|drift|wake|waft|bloom|sheen|vol|grow|roam|bob|haze|smoke|holo-vol|chroma|bar > i|trail|dip|word-in|ripple)\b|view-transition-group\(bottle\)/
const out = []
// walk rules, tracking whether we are inside a hover-capable media block
let depth = 0, hoverDepth = -1, rmDepth = -1
const re = /([^{}]*)\{|\}/g
let m, stack = []
while ((m = re.exec(css))) {
  if (m[0] === '}') { const s = stack.pop(); if (s && s.endsWith('hover')) hoverDepth = -1; if (s === 'rm') rmDepth = -1; continue }
  const sel = m[1].trim()
  const media = sel.startsWith('@media')
  stack.push(media && /hover:\s*hover/.test(sel) ? 'hover' : media && /prefers-reduced-motion/.test(sel) ? 'rm' : 'x')
  if (media && /hover:\s*hover/.test(sel)) hoverDepth = stack.length
  if (media && /prefers-reduced-motion/.test(sel)) rmDepth = stack.length
  if (media || sel.startsWith('@')) continue
  const body = css.slice(re.lastIndex, css.indexOf('}', re.lastIndex))
  const line = css.slice(0, m.index).split('\n').length
  if (/transition:\s*all\b/.test(body)) out.push(`transition: all  | ${sel}`)
  if (/\bease-in\b(?!-out)/.test(body)) out.push(`ease-in on UI    | ${sel}`)
  if (/:hover/.test(sel) && hoverDepth < 0) out.push(`ungated :hover   | ${sel}`)
  if (rmDepth < 0 && !RARE.test(sel + ' ' + body)) {
    for (const d of body.matchAll(/(transition|animation)[^;]*?(\d+(?:\.\d+)?)(ms|s)\b/g)) {
      const ms = d[3] === 's' ? +d[2] * 1000 : +d[2]
      if (ms > 300) out.push(`${d[1]} ${ms}ms > 300 | ${sel}`)
    }
  }
}
console.log(out.length ? out.join('\n') : 'motion audit: clean')
process.exit(out.length ? 1 : 0)
