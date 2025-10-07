"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaTwitter, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative w-full py-4 px-6 flex flex-col sm:flex-row items-center justify-between border-t border-blue-400/30 text-blue-100 bg-black/30 backdrop-blur-md font-[Patrick_Hand] mt-auto">
      
      {/* Social Links */}
      <div className="flex items-center gap-6 text-sm sm:text-base mt-2 sm:mt-0">
        <Link
          href="https://x.com/Zevrucoin"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-sky-400 transition-colors"
        >
          <FaTwitter size={18} /> Twitter
        </Link>

        <Link
          href="https://discord.gg/your-link-here"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
        >
          <FaDiscord size={18} /> Discord
        </Link>
      </div>

      {/* Centered Warning */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-[12px] sm:text-sm text-red-400 font-semibold text-center max-w-md leading-snug italic mt-3 sm:mt-0"
      >
        ⚠️ We will never ask you to connect your wallet or sign any transaction here.  
        Airdrops are only claimable via a trusted third-party site on TGE.
      </motion.p>

      {/* Rights Reserved */}
      <div className="text-[12px] sm:text-sm text-blue-200/70 mt-3 sm:mt-0">
        © {new Date().getFullYear()} Zevru. All rights reserved.
      </div>

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
