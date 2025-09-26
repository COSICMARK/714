"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Panel from "./components/Panel";

const FONT_CLASSES = [
  "font-comic",
  "font-lobster",
  "font-press",
  "font-paprika",
  "font-courier",
];

export default function HomePage() {
  const [showPanel, setShowPanel] = useState(false);
  const [activated, setActivated] = useState(false);
  const [sounds, setSounds] = useState<Record<string, HTMLAudioElement>>({});
  const [fontClass, setFontClass] = useState(FONT_CLASSES[0]);
  const [emojiPositions, setEmojiPositions] = useState<
    { top: string; left: string }[]
  >([]);
  const [orbs, setOrbs] = useState<
    { top: string; left: string; size: number; hue: number }[]
  >([]);
  const [bgVolume, setBgVolume] = useState(0.35);
  const [muted, setMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // audio setup
  useEffect(() => {
    const bg = new Audio("/sound/cinematic.mp3");
    const chime = new Audio("/sound/chime.mp3");
    const whoosh = new Audio("/sound/whoosh.mp3");

    bg.loop = true;
    bg.preload = "auto";
    chime.preload = "auto";
    whoosh.preload = "auto";

    bg.volume = bgVolume;
    chime.volume = 0.8;
    whoosh.volume = 0.85;

    setSounds({ bg, chime, whoosh });

    return () => {
      bg.pause();
      chime.pause();
      whoosh.pause();
    };
  }, []);

  // client-only random elements
  useEffect(() => {
    setFontClass(FONT_CLASSES[Math.floor(Math.random() * FONT_CLASSES.length)]);

    setEmojiPositions(
      Array.from({ length: 7 }).map(() => ({
        top: `${10 + Math.random() * 80}%`,
        left: `${5 + Math.random() * 90}%`,
      }))
    );

    // generate ~10 optimized static orbs (lighter load)
    setOrbs(
      Array.from({ length: 10 }).map(() => ({
        size: 40 + Math.random() * 80,
        top: `${5 + Math.random() * 85}%`,
        left: `${5 + Math.random() * 90}%`,
        hue: [190, 200, 210, 220, 230][
          Math.floor(Math.random() * 5)
        ], // different blue tones
      }))
    );
  }, []);

  // simple parallax
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * -8;
      el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateZ(0)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const playSound = (name: "chime" | "whoosh" | "bg") => {
    const s = sounds[name];
    if (!s) return;
    if (name === "bg") {
      s.volume = muted ? 0 : bgVolume;
      s.currentTime = 0;
      s.play().catch(() => {});
      return;
    }
    s.currentTime = 0;
    s.play().catch(() => {});
  };

  const startVibes = () => {
    setActivated(true);
    playSound("chime");
    setTimeout(() => playSound("bg"), 200);
  };

  const handleOpenPortal = () => {
    playSound("whoosh");
    setShowPanel(true);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (sounds.bg) sounds.bg.volume = next ? 0 : bgVolume;
      return next;
    });
  };

  const changeBgVolume = (v: number) => {
    setBgVolume(v);
    if (!muted && sounds.bg) sounds.bg.volume = v;
  };

  return (
    <main
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center ${fontClass}`}
      style={{ backfaceVisibility: "hidden" }}
    >
      {/* White background layer */}
      <div className="absolute inset-0 bg-white -z-30" />

      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
        style={{ filter: "brightness(0.95) contrast(1.03)", transform: "scale(1.02)" }}
      >
        <source src="/cat.mp4" type="video/mp4" />
      </video>

      {/* Blur overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,21,60,0.55) 0%, rgba(4,12,30,0.65) 60%)",
          backdropFilter: "blur(4px) saturate(140%)",
        }}
      />

      {/* Static neon orbs (lighter load, no infinite animation) */}
      {orbs.map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-70 blur-md mix-blend-screen"
          style={{
            width: `${o.size}px`,
            height: `${o.size}px`,
            top: o.top,
            left: o.left,
            boxShadow: `0 0 ${o.size / 2}px rgba(180,220,255,0.12), 0 0 ${
              o.size
            }px hsla(${o.hue}, 95%, 65%, 0.25)`,
            background: `radial-gradient(circle, hsla(${o.hue},95%,65%,0.35), transparent 70%)`,
          }}
        />
      ))}

      {/* Hero title */}
      <motion.h1
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2"
        style={{
          color: "white",
          textShadow:
            "0 4px 30px rgba(2,6,23,0.6), 0 0 18px rgba(59,130,246,0.25), 0 0 40px rgba(34,211,238,0.15)",
          WebkitTextStroke: "0.8px rgba(0,0,0,0.18)",
        }}
      >
        🌌 ZEVRU BASED
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.8 }}
        className="text-lg sm:text-2xl font-semibold mb-6"
        style={{
          color: "rgba(200, 245, 255, 0.94)",
          textShadow: "0 6px 18px rgba(2,6,23,0.45)",
        }}
      >
        Ancient vibes · internet cute · neon portal
      </motion.p>

      {/* Emoji confetti */}
      {emojiPositions.map((pos, i) => (
        <motion.div
          key={i}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: [0, -20, 0], opacity: [1, 0.7, 1] }}
          transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute text-3xl"
          style={{ top: pos.top, left: pos.left }}
        >
          {["😼", "💙", "✨", "🌐", "🎶", "🐾", "⚡"][i % 7]}
        </motion.div>
      ))}

      {/* Controls */}
      <div className="relative z-10 flex flex-col items-center gap-4 mt-6">
        {!activated ? (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={startVibes}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-300 to-indigo-600 text-black font-extrabold shadow-[0_16px_40px_rgba(59,130,246,0.22)] border-2 border-white/20"
          >
            🔊 Start Vibes
          </motion.button>
        ) : (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenPortal}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow-lg border border-white/10"
            >
              🚪 Open Portal
            </motion.button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/10">
              <button
                onClick={toggleMute}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10"
              >
                {muted ? "🔇" : "🔊"}
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-sky-100">Volume</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={bgVolume}
                  onChange={(e) => changeBgVolume(parseFloat(e.target.value))}
                  className="w-36"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-8 right-6 z-20 p-3 rounded-lg bg-gradient-to-r from-white/6 to-white/4 backdrop-blur-sm border border-white/8 text-sm"
        style={{
          boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
          color: "rgba(220,240,255,0.95)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-xs font-bold shadow-sm">
            🎵
          </div>
          <div>
            <div className="font-bold text-[13px]">Cinematic loop</div>
            <div className="text-xs text-white/80">Chime & whoosh SFX ready</div>
          </div>
        </div>
      </motion.div>

      {/* Panel modal */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <Panel onClose={() => setShowPanel(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
