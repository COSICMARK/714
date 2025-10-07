"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative w-full mt-20 py-10 px-6 flex flex-col items-center justify-center border-t border-blue-500/20 text-blue-100 bg-black/20 backdrop-blur-md">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <Image
          src="https://i.postimg.cc/8c3bpbwD/main-zevru-logo.png"
          alt="Zevru Logo"
          width={120}
          height={120}
          className="drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        />

        {/* Socials */}
        <div className="flex gap-6 mt-3">
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
        <p className="max-w-2xl text-sm mt-6 text-blue-200/80 leading-relaxed">
          ⚠️ WARNING: We will never ask you to connect your wallet or sign any transaction here.
          All airdrops will only be claimable via a trusted third-party site on TGE.
        </p>
      </motion.div>

      {/* Glow underline */}
      <div
        className="absolute bottom-0 w-full h-[80px] blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(circle at bottom center, rgba(59,130,246,0.4), transparent 70%)",
        }}
      />
    </footer>
  );
}
