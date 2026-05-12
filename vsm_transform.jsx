import { useState } from "react";

const CW = 650, CH = 445;
const NW = 140, NH = 58;

const PAL = {
  org: { bg: "#141e2e", border: "#2d4160", text: "#cbd5e1", sub: "#4d617e" },
  s1: { bg: "#032217", border: "#16a34a", text: "#bbf7d0", sub: "#4ade80", tag: "#15803d" },
  s2: { bg: "#3c0f04", border: "#ea580c", text: "#fed7aa", sub: "#fb923c", tag: "#c2410c" },
  s3: { bg: "#3c0909", border: "#dc2626", text: "#fecaca", sub: "#f87171", tag: "#b91c1c" },
  s3s: { bg: "#280505", border: "#f87171", text: "#fecaca", sub: "#fca5a5", tag: "#991b1b" },
  s4: { bg: "#061428", border: "#3b82f6", text: "#bfdbfe", sub: "#60a5fa", tag: "#1d4ed8" },
  s5: { bg: "#130a26", border: "#7c3aed", text: "#e9d5ff", sub: "#a78bfa", tag: "#6d28d9" },
};

const NODES = [
  { id:"directeur", label:"Directeur", orgSub:"Direction générale", vsmSub:"Pilotage · cohésion", vsmTag:"S3",
    org:{x:255,y:35,show:true}, vsm:{x:155,y:190,show:true}, orgC:PAL.org, vsmC:PAL.s3 },
  { id:"medecin", label:"Méd. coordonnateur", orgSub:"Coordination médicale", vsmSub:"Intelligence · veille", vsmTag:"S4",
    org:{x:480,y:35,show:true}, vsm:{x:255,y:105,show:true}, orgC:PAL.org, vsmC:PAL.s4 },
  { id:"soins", label:"Service soins", orgSub:"Infirmiers · Aides-soignants", vsmSub:"Unité opérationnelle", vsmTag:"S1",
    org:{x:20,y:170,show:true}, vsm:{x:20,y:368,show:true}, orgC:PAL.org, vsmC:PAL.s1 },
  { id:"hebergement", label:"Hébergement", orgSub:"ASH · Animation", vsmSub:"Unité opérationnelle", vsmTag:"S1",
    org:{x:255,y:170,show:true}, vsm:{x:255,y:368,show:true}, orgC:PAL.org, vsmC:PAL.s1 },
  { id:"admin", label:"Administratif", orgSub:"Comptabilité · RH", vsmSub:"Unité opérationnelle", vsmTag:"S1",
    org:{x:470,y:170,show:true}, vsm:{x:490,y:368,show:true}, orgC:PAL.org, vsmC:PAL.s1 },
  { id:"ca", label:"Conseil d'admin.", orgSub:"", vsmSub:"Identité · valeurs", vsmTag:"S5",
    org:{x:255,y:-90,show:false}, vsm:{x:255,y:15,show:true}, orgC:PAL.org, vsmC:PAL.s5 },
  { id:"s2", label:"Coordination", orgSub:"", vsmSub:"Régulation inter-unités", vsmTag:"S2",
    org:{x:255,y:550,show:false}, vsm:{x:255,y:278,show:true}, orgC:PAL.org, vsmC:PAL.s2 },
  { id:"s3star", label:"Audit qualité", orgSub:"", vsmSub:"Contrôle intermittent", vsmTag:"S3*",
    org:{x:660,y:190,show:false}, vsm:{x:380,y:190,show:true}, orgC:PAL.org, vsmC:PAL.s3s },
];

const nmap = {};
NODES.forEach(n => { nmap[n.id] = n; });

function pt(node, a, mode) {
  const p = mode === "org" ? node.org : node.vsm;
  const cx = p.x + NW / 2, cy = p.y + NH / 2;
  if (a === "top")    return [cx, p.y];
  if (a === "bottom") return [cx, p.y + NH];
  if (a === "left")   return [p.x, cy];
  if (a === "right")  return [p.x + NW, cy];
  return [cx, cy];
}

function curve([x1, y1], [x2, y2]) {
  const adx = Math.abs(x2 - x1), ady = Math.abs(y2 - y1);
  if (ady >= adx) {
    const my = (y1 + y2) / 2;
    return `M${x1},${y1}C${x1},${my} ${x2},${my} ${x2},${y2}`;
  } else {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1}C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  }
}

const ORG_LINES = [
  { f:"directeur", fa:"bottom", t:"soins",       ta:"top",  dash:false },
  { f:"directeur", fa:"bottom", t:"hebergement", ta:"top",  dash:false },
  { f:"directeur", fa:"right",  t:"medecin",     ta:"left", dash:true  },
  { f:"directeur", fa:"bottom", t:"admin",       ta:"top",  dash:false },
];

const VSM_LINES = [
  { f:"ca",        fa:"bottom", t:"medecin",     ta:"top",  dash:false },
  { f:"medecin",   fa:"bottom", t:"directeur",   ta:"top",  dash:false },
  { f:"directeur", fa:"right",  t:"s3star",      ta:"left", dash:true  },
  { f:"directeur", fa:"bottom", t:"s2",          ta:"top",  dash:false },
  { f:"s2",        fa:"bottom", t:"soins",       ta:"top",  dash:false },
  { f:"s2",        fa:"bottom", t:"hebergement", ta:"top",  dash:false },
  { f:"s2",        fa:"bottom", t:"admin",       ta:"top",  dash:false },
];

function Lines({ lines, mode, vis }) {
  return (
    <g style={{ opacity: vis ? 1 : 0, transition: "opacity 0.45s ease" }}>
      {lines.map((l, i) => {
        const fn = nmap[l.f], tn = nmap[l.t];
        if (!fn || !tn) return null;
        const p1 = pt(fn, l.fa, mode);
        const p2 = pt(tn, l.ta, mode);
        const col = mode === "vsm" ? fn.vsmC.border + "99" : "#2d4160";
        return (
          <path key={i} d={curve(p1, p2)}
            stroke={col} strokeWidth={1.5}
            strokeDasharray={l.dash ? "5 4" : undefined}
            fill="none" />
        );
      })}
    </g>
  );
}

export default function App() {
  const [vsm, setVsm] = useState(false);
  const TR = "all 0.75s cubic-bezier(0.4,0,0.2,1)";

  return (
    <div style={{
      fontFamily: "'Sora', system-ui, sans-serif",
      background: "#060c18",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{
          fontSize: 9.5, color: "#2d4160", letterSpacing: "0.22em",
          textTransform: "uppercase", marginBottom: 7, fontFamily: "'IBM Plex Mono', monospace"
        }}>
          {vsm ? "modèle des systèmes viables" : "structure organisationnelle"}
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", letterSpacing: "-0.02em", marginBottom: 5 }}>
          {vsm ? "Lecture fonctionnelle · EHPAD" : "Organigramme · EHPAD"}
        </h1>
        <p style={{ fontSize: 11, color: "#3d5278", maxWidth: 500, lineHeight: 1.6 }}>
          {vsm
            ? "Chaque boîte désigne une fonction systémique. Les liaisons montrent les flux de régulation et de variété."
            : "Hiérarchie des postes. Les cases désignent des personnes, pas des fonctions de régulation."}
        </p>
      </div>

      {/* Canvas */}
      <div style={{
        position: "relative", width: CW, height: CH,
        background: "#080e1a",
        borderRadius: 14,
        border: "1px solid #141e2e",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>

        {/* Grid background */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#0c1422" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connections */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <Lines lines={ORG_LINES} mode="org" vis={!vsm} />
          <Lines lines={VSM_LINES} mode="vsm" vis={vsm} />
        </svg>

        {/* Nodes */}
        {NODES.map(node => {
          const pos = vsm ? node.vsm : node.org;
          const col = vsm ? node.vsmC : node.orgC;
          const show = pos.show;
          const sub = vsm ? node.vsmSub : node.orgSub;
          return (
            <div key={node.id} style={{
              position: "absolute",
              width: NW, height: NH,
              left: pos.x, top: pos.y,
              opacity: show ? 1 : 0,
              pointerEvents: show ? "auto" : "none",
              transition: TR,
              borderRadius: 9,
              border: `1.5px solid ${col.border}`,
              background: col.bg,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "0 10px",
              boxShadow: vsm && show ? `0 4px 22px ${col.border}28` : "none",
            }}>
              {/* VSM system badge */}
              {vsm && node.vsmTag && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: node.vsmC.tag,
                  color: "#fff", fontSize: 8, fontWeight: 600,
                  padding: "2px 6px", borderRadius: "0 8px 0 5px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.05em",
                }}>
                  {node.vsmTag}
                </div>
              )}
              <div style={{ fontSize: 11.5, fontWeight: 600, color: col.text, textAlign: "center", lineHeight: 1.3 }}>
                {node.label}
              </div>
              {sub && (
                <div style={{ fontSize: 9.5, color: col.sub, marginTop: 3, textAlign: "center" }}>
                  {sub}
                </div>
              )}
            </div>
          );
        })}

        {/* Mode stamp */}
        <div style={{
          position: "absolute", bottom: 10, right: 12,
          fontSize: 8.5, color: "#1a2840",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {vsm ? "Beer · MSV 1985" : "organigramme classique"}
        </div>
      </div>

      {/* Toggle button */}
      <button onClick={() => setVsm(v => !v)} style={{
        marginTop: 16,
        padding: "9px 24px",
        border: `1.5px solid ${vsm ? PAL.s3.border : "#1e3045"}`,
        borderRadius: 99,
        background: vsm ? PAL.s3.bg : "#0c1526",
        color: vsm ? PAL.s3.sub : "#3d5278",
        fontSize: 11.5, fontWeight: 500,
        cursor: "pointer", transition: "all 0.4s ease",
        fontFamily: "inherit", letterSpacing: "0.03em",
      }}>
        {vsm ? "← Retour à l'organigramme" : "→ Basculer en lecture VSM"}
      </button>

      {/* Legend */}
      <div style={{
        marginTop: 12,
        opacity: vsm ? 1 : 0,
        transition: "opacity 0.6s ease 0.3s",
        display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
        pointerEvents: vsm ? "auto" : "none",
      }}>
        {[
          { k: "S5", l: "Identité",     c: PAL.s5.border },
          { k: "S4", l: "Intelligence", c: PAL.s4.border },
          { k: "S3", l: "Pilotage",     c: PAL.s3.border },
          { k: "S3*",l: "Audit",        c: PAL.s3s.border },
          { k: "S2", l: "Coordination", c: PAL.s2.border },
          { k: "S1", l: "Opérations",   c: PAL.s1.border },
        ].map(({ k, l, c }) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: c, flexShrink: 0 }} />
            <span style={{ color: "#2d4160" }}>
              <span style={{ color: c, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9 }}>{k}</span>
              {" "}{l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
