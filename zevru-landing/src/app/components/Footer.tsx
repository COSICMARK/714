"use client";

import { FaDiscord, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="font-outfit fixed bottom-0 left-0 w-full flex flex-col items-center justify-center py-3 bg-black/60 backdrop-blur-md border-t border-white/10 text-white text-sm z-50">
      {/* Social Icons */}
      <div className="flex items-center justify-center gap-6 mb-2">
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors duration-200"
          aria-label="Twitter"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="https://discord.gg/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-400 transition-colors duration-200"
          aria-label="Discord"
        >
          <FaDiscord size={22} />
        </a>
      </div>

      {/* Notice */}
      <div className="text-center text-red-400 text-[11px] max-w-lg px-4 leading-relaxed opacity-90">
        ⚠️ We will never ask you to connect your wallet or sign any transaction here.
        Airdrops are only claimable via a trusted third-party site on TGE.
      </div>
    </footer>
  );
}
