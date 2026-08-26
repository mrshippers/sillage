import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { markSvgString } from '../src/sillage/markGeometry'

/* Writes public/favicon.svg from the same geometry the in-app <Mark/> renders,
 * so the tab icon and the logo can never drift apart. Run `npm run gen:favicon`
 * whenever the mark changes; Mark.test.ts fails if you forget. */

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/favicon.svg')
writeFileSync(out, markSvgString(), 'utf8')
console.log(`wrote ${out}`)
