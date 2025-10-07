export default function Tokenomics() {
  return (
    <div className="notebook space-y-8 text-center">
      {/* Centered heading with emoji + neon glow */}
      <h2 className="flex items-center justify-center gap-2 text-4xl md:text-5xl font-bold text-pink-600 font-sans drop-shadow-[0_0_10px_rgba(255,105,180,0.8)]">
        <span role="img" aria-label="scroll">📜</span>
        <span className="tracking-wide">ZEVRU TOKENOMICS</span>
      </h2>

      <p className="text-xl font-sans text-gray-800 max-w-2xl mx-auto leading-relaxed">
        Zevru is more than just a coin on Base.  
        It’s like old-school energy crashing into the modern blockchain world –  
        wild, fun, and made for people who vibe with culture and community.
      </p>

      <p className="text-xl font-sans text-gray-800 max-w-2xl mx-auto leading-relaxed">
        The tokenomics are super simple, totally clear,  
        and built to grow a strong crew of holders.
      </p>

      <ul className="list-none space-y-3 text-lg font-sans text-gray-900 text-left max-w-md mx-auto">
        <li>
          ➤ Community – 70%
          <ul className="ml-6 list-none space-y-1">
            <li>✏️ NFT Holders: 10%</li>
            <li>✏️ Airdrop: 60%</li>
            <li>✏️ All unlocked at launch</li>
          </ul>
        </li>
        <li>➤ Team – 10%</li>
        <li>➤ Liquidity – 20%</li>
      </ul>

      <p className="text-lg font-sans text-gray-700 max-w-2xl mx-auto">
        Total supply: TBA ✍️
      </p>

      <p className="text-xl font-sans text-gray-800 max-w-2xl mx-auto leading-relaxed">
        Balance is key — the community holds most of it,  
        the team just a little, and liquidity is locked tight  
        so trading stays chill.  
        Fair, fun, and fueled by the people who believe in it.
      </p>
    </div>
  );
}
