"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative w-full py-4 px-6 flex flex-col sm:flex-row items-center justify-between border-t border-blue-400/30 text-blue-100 bg-black/30 backdrop-blur-md font-[Patrick_Hand]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="https://i.postimg.cc/8c3bpbwD/main-zevru-logo.png"
          alt="Zevru Logo"
          width={38}
          height={38}
          className="drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
        />
        <span className="font-bold text-blue-300 text-lg tracking-wide">
          ZEVRU
        </span>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-6 text-sm sm:text-base mt-3 sm:mt-0">
        <Link
          href="https://x.com/Zevrucoin"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          Twitter
        </Link>

        <Link
          href="#"
          className="text-blue-300/60 cursor-not-allowed"
          title="Discord link coming soon"
        >
          Discord
        </Link>
      </div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-[12px] sm:text-sm text-blue-200/80 mt-3 sm:mt-0 max-w-md text-center sm:text-right leading-snug italic drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
      >
        ⚠️ We will never ask you to connect your wallet or sign any transaction here.
        Airdrops are only claimable via a trusted third-party site on TGE.
      </motion.p>

      {/* Glow Accent */}
      <div
        className="absolute bottom-0 w-full h-[35px] blur-2xl -z-10"
        style={{
          background:
            "radial-gradient(circle at bottom center, rgba(59,130,246,0.35), transparent 70%)",
        }}
      />
    </footer>
  );
}
