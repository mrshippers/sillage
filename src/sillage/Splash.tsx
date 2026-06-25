import { useEffect, useState } from 'react'
import Smoke from './Smoke'

// The open. Smoke, three palette auras blooming, the SILLAGE wordmark drawing
// in under a sheen sweep, a gold rule, then the whole thing dissolves into Home.
// Tap anywhere to skip. CSS-timeline driven (no anime.js dependency).
export default function Splash({ onDone }: { onDone: () => void }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const fade = setTimeout(() => setGone(true), 3000)
    const done = setTimeout(onDone, 3850)
    return () => { clearTimeout(fade); clearTimeout(done) }
  }, [onDone])

  const skip = () => { setGone(true); setTimeout(onDone, 500) }

  return (
    <div onClick={skip} style={{
      position: 'absolute', inset: 0, zIndex: 50, cursor: 'pointer',
      background: 'radial-gradient(120% 90% at 50% 60%, #1a0f1a 0%, #0a070c 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: gone ? 0 : 1, transform: gone ? 'scale(1.18)' : 'scale(1)', filter: gone ? 'blur(10px)' : 'blur(0)',
      transition: 'opacity 0.85s ease-in, transform 0.85s ease-in, filter 0.85s ease-in',
    }}>
      <Smoke opacity={0.85} count={26} centered style={{ filter: 'blur(20px) contrast(115%)' }} />
      <div className="aura a1" /><div className="aura a2" /><div className="aura a3" />
      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span className="wmword">SILLAGE</span>
          <span className="wmsheen" />
        </span>
        <div className="wmline" />
        <div className="wmtag">intentional imprints</div>
      </div>
      <style>{`
        .aura{position:absolute;border-radius:50%;filter:blur(40px);left:50%;top:52%;transform:translate(-50%,-50%) scale(.4);opacity:0;}
        .a1{width:260px;height:260px;background:radial-gradient(circle,#caa25f,transparent 70%);animation:bloom 1.3s ease .2s forwards;}
        .a2{width:240px;height:240px;background:radial-gradient(circle,#8b5c8f,transparent 70%);animation:bloom 1.3s ease .36s forwards;}
        .a3{width:220px;height:220px;background:radial-gradient(circle,#3f7f76,transparent 70%);animation:bloom 1.3s ease .52s forwards;}
        @keyframes bloom{to{opacity:.55;transform:translate(-50%,-50%) scale(1.1);}}
        .wmword{font-family:'Fraunces',serif;font-weight:300;font-size:46px;letter-spacing:.30em;padding-left:.30em;
          background:linear-gradient(180deg,#fff5e0,#d8b780 55%,#9a7a45);-webkit-background-clip:text;background-clip:text;
          -webkit-text-fill-color:transparent;opacity:0;transform:translateY(18px);animation:wmin 1.1s cubic-bezier(.2,.7,.3,1) .6s forwards;}
        @keyframes wmin{to{opacity:1;transform:translateY(0);}}
        .wmsheen{position:absolute;top:0;left:-40%;width:40%;height:100%;mix-blend-mode:overlay;opacity:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);animation:sheen 1.3s ease-in-out 1.0s forwards;}
        @keyframes sheen{0%{opacity:0;left:-40%;}30%{opacity:.9;}100%{opacity:0;left:140%;}}
        .wmline{height:1px;width:0;margin:16px auto 0;opacity:0;background:linear-gradient(90deg,transparent,#caa25f,transparent);animation:line .8s ease .9s forwards;}
        @keyframes line{to{width:62%;opacity:.8;}}
        .wmtag{font-family:'Archivo',sans-serif;font-size:9px;letter-spacing:.42em;text-transform:uppercase;color:rgba(251,248,243,.7);margin-top:13px;opacity:0;animation:tagin .9s ease 1.4s forwards;}
        @keyframes tagin{from{letter-spacing:.20em;}to{opacity:1;letter-spacing:.42em;}}
      `}</style>
    </div>
  )
}
