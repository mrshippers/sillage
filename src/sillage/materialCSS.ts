import { GRAIN_URI, FOIL, gold, white } from './tokens'

/* Style block for the material primitives. Mounted once by the app shell.
 * Lives apart from Material.tsx so that file only exports components (the
 * react-refresh rule) and so every value still resolves through ./tokens. */
export const materialCSS = `
  .surface{isolation:isolate;}
  .surface-tap{cursor:pointer;}
  .grain{position:absolute;inset:0;opacity:.11;mix-blend-mode:overlay;pointer-events:none;
    background-image:${GRAIN_URI};}
  .foil{position:absolute;inset:0;pointer-events:none;mix-blend-mode:color-dodge;opacity:.10;
    background:${FOIL};background-size:260% 260%;animation:sil-foil 14s ease-in-out infinite;}
  @keyframes sil-foil{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .rim{position:absolute;inset:0;pointer-events:none;padding:1px;
    background:linear-gradient(140deg,${white(0.42)},${white(0)} 36%,${white(0)} 64%,${gold(0.3)});
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    mask-composite:exclude;}
  .mesh-wrap{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
  .mesh{position:absolute;inset:0;width:100%;height:100%;filter:blur(44px) saturate(125%);}
  .mesh-sheen{position:absolute;inset:0;mix-blend-mode:screen;opacity:.10;
    background:${FOIL};background-size:300% 300%;animation:sil-foil 18s ease-in-out infinite;}
  @media (prefers-reduced-motion: reduce){
    .foil{animation:none;}
    .mesh-sheen{animation:none;}
  }
`
