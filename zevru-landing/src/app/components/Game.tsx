"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Tilt from "react-parallax-tilt";

// --------------------
// Supabase
// --------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --------------------
// Constants
// --------------------
const COIN_URL = "https://i.postimg.cc/Dz2Xz5nT/favicon.png"; 
const ENERGY_PER_TAP = 2;
const FLUSH_INTERVAL_MS = 600;
const MAX_PENDING_PER_FLUSH = 1500;
const TAP_SFX_URL = "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg";
const TIMER_SFX_URL = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";
const PARTICLES = 14;
const POPUP_LIFE = 800;

// --------------------
// Types
// --------------------
type Popup = { id: number; x: number; y: number; text: string };
type Particle = { id: number; angle: number; dist: number };

// --------------------
// Component
// --------------------
export default function ZevruQuickTap() {
  // Wallet
  const [walletInput, setWalletInput] = useState("");
  const [wallet, setWallet] = useState<string | null>(null);

  // Player state
  const [energy, setEnergy] = useState<number>(0);
  const energyRef = useRef<number>(0);
  const [stage, setStage] = useState<number>(0);
  const [tapsThisStage, setTapsThisStage] = useState<number>(0);

  // UI FX
  const [popups, setPopups] = useState<Popup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flash, setFlash] = useState(false);
  const popupId = useRef(0);
  const particleId = useRef(0);

  // pending taps
  const pendingTaps = useRef<number>(0);

  // audio
  const TAP_POOL = 8;
  const tapPool = useRef<HTMLAudioElement[]>([]);
  const tapIdx = useRef(0);
  const timerSfx = useRef<HTMLAudioElement | null>(null);

  // stages
  const evolutionStages = useMemo(
    () => [
      { id: 0, name: "Zevru Coin" },
      { id: 1, name: "Ancient Scroll" },
      { id: 2, name: "Chain Link" },
    ],
    []
  );

  // ------------ init audio pool
  useEffect(() => {
    tapPool.current = Array.from({ length: TAP_POOL }, () => {
      const a = new Audio(TAP_SFX_URL);
      a.volume = 0.8;
      return a;
    });
    timerSfx.current = new Audio(TIMER_SFX_URL);
    if (timerSfx.current) timerSfx.current.volume = 0.6;
  }, []);

  // ------------ DB init
  useEffect(() => {
    if (!wallet) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("zevru_players")
          .select("erc20, energy")
          .eq("erc20", wallet)
          .single();

        if (error && (error as any).code !== "PGRST116") return;

        if (data) {
          const e = Number(data.energy || 0);
          setEnergy(e);
          energyRef.current = e;
        } else {
          await supabase.from("zevru_players").insert({ erc20: wallet, energy: 0 });
          setEnergy(0);
          energyRef.current = 0;
        }
      } catch {}
    })();
  }, [wallet]);

  // ------------ Flush taps
  useEffect(() => {
    const id = setInterval(() => {
      flushPending();
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const flushPending = useCallback(async () => {
    const toFlush = Math.min(pendingTaps.current, MAX_PENDING_PER_FLUSH);
    if (!wallet || toFlush <= 0) return;

    pendingTaps.current -= toFlush;
    const deltaEnergy = toFlush * ENERGY_PER_TAP;
    energyRef.current += deltaEnergy;
    setEnergy(energyRef.current);

    try {
      const { data: serverRow } = await supabase
        .from("zevru_players")
        .select("energy")
        .eq("erc20", wallet)
        .single();

      const serverEnergy = Number(serverRow?.energy || 0);
      const newEnergy = serverEnergy + deltaEnergy;

      await supabase.from("zevru_players").update({ energy: newEnergy }).eq("erc20", wallet);

      energyRef.current = newEnergy;
      setEnergy(newEnergy);
    } catch {}
  }, [wallet]);

  // ------------ Queue a tap
  const queueTap = useCallback(() => {
    const pool = tapPool.current;
    if (pool.length) {
      const a = pool[tapIdx.current % pool.length];
      try {
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
      tapIdx.current = (tapIdx.current + 1) % pool.length;
    }

    pendingTaps.current += 1;
    setFlash((f) => !f);

    // popup
    popupId.current += 1;
    const id = popupId.current;
    const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 60;
    const centerY = window.innerHeight / 2 + (Math.random() - 0.5) * 60;
    setPopups((p) => [...p, { id, x: centerX, y: centerY, text: `+${ENERGY_PER_TAP}` }]);
    setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), POPUP_LIFE);

    // particles
    const burst: Particle[] = Array.from({ length: PARTICLES }, () => {
      particleId.current += 1;
      return { id: particleId.current, angle: Math.random() * Math.PI * 2, dist: 40 + Math.random() * 120 };
    });
    setParticles((prev) => [...prev, ...burst]);
    setTimeout(() => setParticles((prev) => prev.filter((x) => !burst.find((b) => b.id === x.id))), 500);

    setTapsThisStage((t) => {
      const newT = t + 1;
      if (newT % 5 === 0) {
        setStage((s) => Math.min(s + 1, evolutionStages.length - 1));
        return 0;
      }
      return newT;
    });
  }, []);

  const handleTap = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    queueTap();
  }, [queueTap]);

  // ------------ Login/logout
  const handleLogin = useCallback(() => {
    const cleaned = walletInput.trim();
    if (!cleaned) return;
    setWallet(cleaned);
  }, [walletInput]);

  const handleLogout = useCallback(async () => {
    await flushPending();
    setWallet(null);
    setWalletInput("");
    setEnergy(0);
    energyRef.current = 0;
    setStage(0);
    setTapsThisStage(0);
    pendingTaps.current = 0;
  }, [flushPending]);

  // ------------ Display energy
  const energyLabel = useMemo(() => energy.toLocaleString(), [energy]);

  // ------------ FX
  useEffect(() => {
    if (flash && timerSfx.current) {
      try {
        timerSfx.current.currentTime = 0;
        timerSfx.current.play().catch(() => {});
      } catch {}
    }
  }, [flash]);

  // -------------------- Render --------------------
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
      {/* animated background glow */}
      <motion.div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,rgba(0,128,255,0.6),transparent_70%)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-outfit bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
              Zevru — Tap to Charge ⚡
            </h1>
            <p className="text-slate-300 text-sm mt-1">White & Blue hyper-real arcade interface</p>
          </div>

          <div className="flex items-center gap-3">
            {wallet ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-500/30 shadow">
                <div className="text-right">
                  <div className="text-xs text-slate-300">Connected</div>
                  <div className="font-outfit text-sm truncate max-w-[140px]">{wallet}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md hover:scale-105 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="Paste ERC-20 wallet (0x...)"
                  className="px-4 py-2 rounded-xl w-72 bg-white/10 backdrop-blur-md border border-slate-500/30 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 shadow-sm transition"
                />
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105 hover:shadow-blue-400/40 transition"
                >
                  Enter
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Game Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-blue-400/20 p-6 shadow-2xl overflow-hidden"
        >
          {/* HUD */}
          <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 px-4 py-3 shadow-inner border border-blue-400/30">
                <div className="text-xs text-slate-300">Energy</div>
                <div className="text-3xl font-outfit text-blue-300 animate-pulse">{energyLabel}</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 px-4 py-3 border border-blue-400/30">
                <div className="text-xs text-slate-300">Stage</div>
                <div className="text-lg font-outfit">{stage + 1} / {evolutionStages.length}</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 px-4 py-3 border border-blue-400/30">
                <div className="text-xs text-slate-300">Taps (stage)</div>
                <div className="text-lg font-outfit">{tapsThisStage}</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">Auto-sync every {(FLUSH_INTERVAL_MS/1000).toFixed(1)}s</div>
          </div>

          {/* Coin */}
          <div className="flex items-center justify-center py-10">
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
              <motion.div
                onMouseDown={(e) => handleTap(e as any)}
                onTouchStart={(e) => handleTap(e as any)}
                whileTap={{ scale: 0.95 }}
                className="relative w-72 h-72 md:w-80 md:h-80 rounded-full shadow-[0_0_50px_rgba(0,128,255,0.5)] cursor-pointer flex items-center justify-center bg-gradient-to-br from-white/20 to-blue-200/20 border-4 border-blue-400/50"
              >
                <motion.img
                  src={COIN_URL}
                  alt="Zevru Coin"
                  className="w-44 h-44 md:w-56 md:h-56 object-contain pointer-events-none drop-shadow-[0_0_25px_rgba(0,128,255,0.6)]"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  style={{
                    background: "conic-gradient(from 0deg, rgba(255,255,255,0.15), rgba(255,255,255,0) 25%)",
                  }}
                />
                <AnimatePresence>
                  {flash && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 0.9, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 rounded-full ring-8 ring-blue-400/50"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Tilt>
          </div>

          {/* Popups */}
          <AnimatePresence>
            {popups.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: p.x, y: p.y, opacity: 0, scale: 0.8 }}
                animate={{ y: p.y - 90, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: p.y - 130 }}
                transition={{ duration: 0.8 }}
                className="pointer-events-none fixed z-50"
              >
                <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-outfit text-sm shadow-lg">
                  +{ENERGY_PER_TAP}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Particles */}
          <AnimatePresence>
            {particles.map((prt) => {
              const dx = Math.cos(prt.angle) * prt.dist;
              const dy = Math.sin(prt.angle) * prt.dist;
              return (
                <motion.span
                  key={prt.id}
                  initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                  animate={{ x: dx, y: dy, opacity: 0, scale: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-3 h-3 rounded-full blur-sm shadow-lg"
                  style={{
                    top: "50%",
                    left: "50%",
                    background: `hsl(${Math.random() * 60 + 200}, 90%, 65%)`,
                  }}
                />
              );
            })}
          </AnimatePresence>

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => flushPending()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-outfit shadow-lg hover:scale-105 active:scale-95 transition"
              >
                Sync Now
              </button>
              <button
                              onClick={async () => {
                  if (!wallet) return;
                  const { data } = await supabase
                    .from("zevru_players")
                    .select("energy")
                    .eq("erc20", wallet)
                    .single();
                  const e = Number(data?.energy || 0);
                  setEnergy(e);
                  energyRef.current = e;
                }}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>

            <div className="text-sm text-slate-300">Tip: Tap rapidly — UI batches updates for smoothness.</div>
          </div>
        </motion.div>

        {/* Small notes & footer */}
        <div className="mt-4 text-xs text-slate-300 flex items-center justify-between gap-4">
          <div>
            Energy earned is for fun — not a 1:1 airdrop. Make sure <code className="bg-white/6 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-white/6 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set in env.
          </div>

          <div className="flex items-center gap-3">
            {wallet && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(wallet);
                    // micro-feedback: small temporary popup
                    popupId.current += 1;
                    const id = popupId.current;
                    setPopups((p) => [...p, { id, x: window.innerWidth - 180, y: 120, text: "Copied" }]);
                    setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 900);
                  } catch {}
                }}
                className="px-3 py-1 rounded-md bg-white/8 hover:bg-white/12 transition"
              >
                Copy Wallet
              </button>
            )}

            <div className="text-slate-400">Built with ❤️ — UI: intense / neon / arcade</div>
          </div>
        </div>
      </div>
    </main>
  );
}
