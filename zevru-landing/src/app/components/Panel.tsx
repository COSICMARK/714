"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tokenomics from "./Tokenomics";
import Application from "./Application";

interface PanelProps {
  onClose: () => void;
  backgroundUrl?: string;
}

export default function Panel({ onClose, backgroundUrl }: PanelProps) {
  const [activeTab, setActiveTab] = useState<"tokenomics" | "application">(
    "tokenomics"
  );

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl shadow-2xl w-full max-w-6xl lg:max-w-7xl p-6 bg-white/95 backdrop-blur-md overflow-y-auto max-h-[90vh] border border-blue-200"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        ✕
      </button>

      {/* Tabs */}
      <div className="flex justify-center gap-10 mb-6 border-b border-blue-100">
        {["tokenomics", "application"].map((tab) => (
          <button
            key={tab}
            className={`relative pb-2 transition-all ${
              activeTab === tab
                ? "font-outfit text-blue-700"
                : "font-outfit text-blue-400"
            }`}
            onClick={() => setActiveTab(tab as "tokenomics" | "application")}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "tokenomics" && (
          <motion.div
            key="tokenomics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 p-6 rounded-xl border border-blue-100"
          >
            <Tokenomics />
          </motion.div>
        )}
        {activeTab === "application" && (
          <motion.div
            key="application"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 p-6 rounded-xl border border-blue-100"
          >
            <Application />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
