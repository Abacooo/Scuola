import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

// Abaco Primaria — 4 colonne (k, h, da, u) con perline colorate e riporto opzionale
// NOTE: mantenuto tutto ASCII per evitare errori di compilazione

const PLACES = [
  { key: "k", label: "k", name: "Migliaia", color: "#f59e0b" }, // arancione
  { key: "h", label: "h", name: "Centinaia", color: "#22c55e" }, // verde
  { key: "da", label: "da", name: "Decine", color: "#ef4444" }, // rosso
  { key: "u", label: "u", name: "Unita'", color: "#3b82f6" }, // blu
];

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

function Cloud({ color, text }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 92, height: 56 }}>
      <svg width="92" height="56" viewBox="0 0 92 56" className="absolute inset-0">
        <path
          d="M22 42c-9.389 0-17-6.716-17-15s7.611-15 17-15c2.53 0 4.93.49 7.07 1.38C31.37 6.01 37.25 2 44 2c8.52 0 15.55 5.77 16.86 13.4C62.6 15.14 64.36 15 66.2 15 77.3 15 86 22.6 86 32s-8.7 20-19.8 20H28.5C25.2 52 22 48.7 22 45.4V42z"
          fill={color}
        />
      </svg>
      <span className="relative z-10 font-bold text-white text-lg select-none">{text}</span>
    </div>
  );
}

function Column({ place, value, onAdd }) {
  const inc = () => onAdd(+1);
  const dec = () => onAdd(-1);

  // Render palline su un'asta
  const rodHeight = 220;
  const beadSize = 16;
  const gap = 6;
  const baseY = rodHeight - beadSize - 6;

  return (
    <div className="flex flex-col items-center gap-2">
      <Cloud color={place.color} text={place.label} />

      <div className="relative" style={{ height: rodHeight, width: 60 }}>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-rose-200 rounded-full" />
        {Array.from({ length: value }).map((_, i) => {
          const y = baseY - i * (beadSize + gap);
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 rounded-full shadow"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: beadSize, height: beadSize, top: y, background: place.color }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 rounded-2xl px-3 py-2 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={dec}
          aria-label={`diminuisci ${place.name}`}
          className="h-9 w-9 rounded-full border bg-white grid place-items-center text-lg"
        >
          -
        </motion.button>
        <div className="tabular-nums text-2xl font-semibold w-6 text-center select-none">{value}</div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={inc}
          aria-label={`aumenta ${place.name}`}
          className="h-9 w-9 rounded-full border bg-white grid place-items-center text-lg"
        >
          +
        </motion.button>
      </div>

      <div className="text-xs text-neutral-500 select-none">{place.name}</div>
    </div>
  );
}

export default function AbacoPrimaria() {
  const [digits, setDigits] = useState({ k: 0, h: 0, da: 0, u: 0 });
  const [carryEnabled, setCarryEnabled] = useState(true);
  const containerRef = useRef(null);

  const total = useMemo(
    () => digits.k * 1000 + digits.h * 100 + digits.da * 10 + digits.u,
    [digits]
  );

  const setAll = (n) => {
    const v = clamp(Math.floor(Math.abs(n)), 0, 9999);
    setDigits({
      k: Math.floor(v / 1000) % 10,
      h: Math.floor(v / 100) % 10,
      da: Math.floor(v / 10) % 10,
      u: v % 10,
    });
  };

  const addWithCarry = (placeKey, delta) => {
    const value = digits.k * 1000 + digits.h * 100 + digits.da * 10 + digits.u;
    const amounts = { u: 1, da: 10, h: 100, k: 1000 };
    const next = clamp(value + delta * amounts[placeKey], 0, 9999);
    setAll(next);
  };

  const addNoCarry = (placeKey, delta) => {
    setDigits((prev) => {
      const nv = clamp(prev[placeKey] + delta, 0, 9);
      return { ...prev, [placeKey]: nv };
    });
  };

  const handleAdd = (placeKey, delta) => {
    if (carryEnabled) addWithCarry(placeKey, delta);
    else addNoCarry(placeKey, delta);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen();
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black">ABACO</h1>
            <p className="text-sm text-neutral-600">k = migliaia, h = centinaia, da = decine, u = unita'</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 text-sm bg-white border rounded-xl px-3 py-2">
              <input type="checkbox" checked={carryEnabled} onChange={(e) => setCarryEnabled(e.target.checked)} />
              Riporto automatico
            </label>
            <button onClick={toggleFullscreen} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-100" title="Schermo intero">
              Schermo intero
            </button>
            <button onClick={() => setDigits({ k: 0, h: 0, da: 0, u: 0 })} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-100">
              Azzera
            </button>
            <RandomButtons setAll={setAll} />
          </div>
        </div>

        <div className="bg-white/70 border border-sky-100 rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 items-end justify-items-center">
            {PLACES.map((p) => (
              <Column key={p.key} place={p} value={digits[p.key]} onAdd={(d) => handleAdd(p.key, d)} />
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm text-neutral-500">Numero</div>
          <div className="text-5xl sm:text-6xl font-extrabold tabular-nums tracking-wider">{total.toLocaleString("it-IT")}</div>
          <div className="mt-2 text-xs text-neutral-500">{carryEnabled ? "(Con riporto automatico attivo)" : "(Senza riporto: ogni colonna 0-9)"}</div>
        </div>
      </div>
    </div>
  );
}

function RandomButtons({ setAll }) {
  const [input, setInput] = useState(0);
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col">
        <label className="text-xs text-neutral-600">Imposta numero (0-9999)</label>
        <div className="flex gap-2">
          <input type="number" min={0} max={9999} value={input} onChange={(e) => setInput(Number(e.target.value || 0))} className="border rounded-xl px-3 py-2 w-36" />
          <button onClick={() => setAll(input)} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-100">Imposta</button>
        </div>
      </div>
      <button onClick={() => setAll(Math.floor(Math.random() * 10000))} className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-100">Numero casuale</button>
    </div>
  );
}
