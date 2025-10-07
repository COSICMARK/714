"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";

const PRESALE_ADDRESS = "0xREPLACE_WITH_YOUR_PRESALE_CONTRACT"; 
const TOKEN_ADDRESS = "0xREPLACE_WITH_YOUR_ZEVRU_TOKEN"; 

// Base explorer tx prefix
const BASE_SCAN_TX_PREFIX = "https://basescan.org/tx/";

// Stable addresses
const USDT_ADDRESS = "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2";
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

const PRICE_MICRO = 1000; // $0.001
const STABLE_DECIMALS = 6;
const TOKEN_DECIMALS = 18;
const MIN_USD = 1;
const MAX_USD = 250;

const ERC20_MIN_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];
const PRESALE_ABI = [
  "function buyWithUSDT(uint256 amount) external",
  "function buyWithUSDC(uint256 amount) external",
  "function purchasedAmount(address) view returns (uint256)",
  "function tokensSold() view returns (uint256)",
  "function PRESALE_CAP() view returns (uint256)",
];

export default function PresalePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const termsRef = useRef<HTMLDivElement>(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const [stable, setStable] = useState<"USDT" | "USDC">("USDC");
  const [inputAmount, setInputAmount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [userPurchasedRaw, setUserPurchasedRaw] = useState<bigint | null>(null);
  const [tokensSoldRaw, setTokensSoldRaw] = useState<bigint | null>(null);
  const [presaleCapRaw, setPresaleCapRaw] = useState<bigint | null>(null);
  const [tokenTotalSupplyRaw, setTokenTotalSupplyRaw] = useState<bigint | null>(null);

  const presaleContractRead = useMemo(() => {
    if (typeof window === "undefined" || !("ethereum" in window)) return null;
    try {
      const provider = new BrowserProvider(window.ethereum as any);
      return new Contract(PRESALE_ADDRESS, PRESALE_ABI, provider);
    } catch {
      return null;
    }
  }, []);

  const tokenContractRead = useMemo(() => {
    if (typeof window === "undefined" || !("ethereum" in window)) return null;
    try {
      const provider = new BrowserProvider(window.ethereum as any);
      return new Contract(TOKEN_ADDRESS, ["function totalSupply() view returns (uint256)"], provider);
    } catch {
      return null;
    }
  }, []);

  const calcTokenUnitsFromUSD = (usdStr: string) => {
    if (!usdStr) return 0n;
    const n = Number(usdStr);
    if (Number.isNaN(n) || n <= 0) return 0n;
    const stableUnits = BigInt(Math.round(n * 10 ** STABLE_DECIMALS));
    return (stableUnits * (10n ** BigInt(TOKEN_DECIMALS))) / BigInt(PRICE_MICRO);
  };

  const receiveString = useMemo(() => {
    try {
      const units = calcTokenUnitsFromUSD(inputAmount);
      return units === 0n ? "0" : formatUnits(units, TOKEN_DECIMALS);
    } catch {
      return "0";
    }
  }, [inputAmount]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!presaleContractRead) return;
      try {
        if (address) {
          const bought: bigint = await presaleContractRead.purchasedAmount(address);
          if (mounted) setUserPurchasedRaw(bought);
        }
        const sold: bigint = await presaleContractRead.tokensSold();
        const cap: bigint = await presaleContractRead.PRESALE_CAP();
        if (mounted) {
          setTokensSoldRaw(sold);
          setPresaleCapRaw(cap);
        }
        if (tokenContractRead) {
          const ts: bigint = await tokenContractRead.totalSupply();
          if (mounted) setTokenTotalSupplyRaw(ts);
        }
      } catch (err) {
        console.error("read error", err);
      }
    };
    load();
    const interval = setInterval(load, 10_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [presaleContractRead, tokenContractRead, address]);

  const userPurchasedUSD = userPurchasedRaw
    ? Number(userPurchasedRaw) / 10 ** STABLE_DECIMALS
    : 0;

  const userPurchasedDisplay = userPurchasedRaw ? formatUnits(userPurchasedRaw, STABLE_DECIMALS) : "0";
  const tokensSoldDisplay = tokensSoldRaw ? formatUnits(tokensSoldRaw, TOKEN_DECIMALS) : "0";
  const presaleCapDisplay = presaleCapRaw ? formatUnits(presaleCapRaw, TOKEN_DECIMALS) : "0";
  const tokenSupplyDisplay = tokenTotalSupplyRaw ? formatUnits(tokenTotalSupplyRaw, TOKEN_DECIMALS) : "0";

  const usdRaised = tokensSoldRaw ? Number(formatUnits(tokensSoldRaw, TOKEN_DECIMALS)) * 0.001 : 0;
  const progressPercent = Math.min(Math.max(((usdRaised - 200000) / (400000 - 200000)) * 100, 0), 100);

  const handleBuy = async () => {
    setStatus(null);
    setTxHash(null);
    setShowCongrats(false);

    if (!agreed) {
      setStatus("You must agree to the presale terms to proceed.");
      return;
    }
    const n = Number(inputAmount);
    if (Number.isNaN(n) || n < MIN_USD || n > MAX_USD) {
      setStatus(`Amount must be between $${MIN_USD} and $${MAX_USD}.`);
      return;
    }
    if (userPurchasedUSD > 0) {
      setStatus("You have already purchased in this presale. One purchase per wallet.");
      return;
    }
    if (!("ethereum" in window)) {
      setStatus("No web3 provider found.");
      return;
    }

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const stableAddr = stable === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
      const stableContract = new Contract(stableAddr, ERC20_MIN_ABI, signer);
      const presaleContract = new Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
      const amountInSmallest = parseUnits(inputAmount || "0", STABLE_DECIMALS);

      const allowance: bigint = await stableContract.allowance(address, PRESALE_ADDRESS);
      if (allowance < amountInSmallest) {
        const approveTx = await stableContract.approve(PRESALE_ADDRESS, amountInSmallest);
        await approveTx.wait();
      }

      let tx;
      if (stable === "USDT") {
        tx = await presaleContract.buyWithUSDT(amountInSmallest);
      } else {
        tx = await presaleContract.buyWithUSDC(amountInSmallest);
      }
      const receipt = await tx.wait();
      const hash = receipt.transactionHash || tx.hash;
      setTxHash(hash);
      setShowCongrats(true);

      const bought: bigint = await presaleContractRead!.purchasedAmount(address);
      setUserPurchasedRaw(bought);
      const sold: bigint = await presaleContractRead!.tokensSold();
      setTokensSoldRaw(sold);

    } catch (err: any) {
      setStatus(err?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow min-h-screen bg-[#0066cc] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white border border-[#004c99] rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-3xl sm:text-4xl font-sans text-center mb-6 text-[#003366]">
          🐱 Zevru Presale
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT SIDE DETAILS */}
          <div className="space-y-4 p-5 bg-[#f4f9ff] rounded-xl border border-[#0066cc]">
            <div className="mb-4">
              <ConnectButton />
              {hasMounted && isConnected && (
                <p className="text-xs text-gray-600 mt-2">
                  Connected Network: {chainId === 8453 ? "Base" : chainId}
                </p>
              )}
            </div>

            <h2 className="text-lg font-sans text-[#0066cc]">Presale Details</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total Token Supply</span>
                <div className="font-sans text-[#003366]">{tokenSupplyDisplay}</div>
              </div>
              <div>
                <span className="text-gray-600">Presale Supply</span>
                <div className="font-sans text-[#003366]">{presaleCapDisplay}</div>
              </div>
              <div>
                <span className="text-gray-600">Valuation (FDV)</span>
                <div className="font-sans text-[#003366]">$2,000,000</div>
              </div>
              <div>
                <span className="text-gray-600">Price per Token</span>
                <div className="font-sans text-[#003366]">$0.001</div>
              </div>
              <div>
                <span className="text-gray-600">Pair</span>
                <div className="font-sans text-[#003366]">USDT / USDC (Base)</div>
              </div>
              <div>
                <span className="text-gray-600">Tokens Sold</span>
                <div className="font-sans text-[#003366]">{tokensSoldDisplay}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm font-sans mb-1 text-[#003366]">
                <span>Min $200k</span>
                <span>${usdRaised.toLocaleString()} Raised</span>
                <span>Max $400k</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-[#0066cc] h-4 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Total Purchased:</strong> ${userPurchasedDisplay}
              </p>
              <p className="mt-2">
                Min per wallet: <strong>${MIN_USD}</strong> — Max per wallet:{" "}
                <strong>${MAX_USD}</strong>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE BUY BOX */}
          <div className="p-5 bg-[#f8fbff] rounded-xl border border-[#0066cc]">
            <div ref={termsRef} className="mb-4 bg-white p-3 rounded text-sm border">
              <h3 className="font-sans mb-2 text-[#0066cc]">Terms & Conditions</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>No refunds after purchase.</li>
                <li>Tokens distributed after purchase, but paused until listing.</li>
                <li>Purchase limits apply per wallet.</li>
                <li>I participate at my own risk.</li>
                <li>By purchasing, you agree to our policies.</li>
              </ul>
            </div>

            {hasMounted && isConnected ? (
              <>
                <div className="mb-3">
                  <label className="block mb-1 text-sm">Choose stable</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStable("USDT")}
                      className={`px-3 py-2 rounded ${stable === "USDT" ? "bg-[#0066cc] text-white" : "bg-white border"}`}
                    >
                      USDT
                    </button>
                    <button
                      onClick={() => setStable("USDC")}
                      className={`px-3 py-2 rounded ${stable === "USDC" ? "bg-[#0066cc] text-white" : "bg-white border"}`}
                    >
                      USDC
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block mb-1 text-sm">Amount (USD)</label>
                  <input
                    type="number"
                    min={MIN_USD}
                    max={MAX_USD}
                    step="0.01"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder={`${MIN_USD} - ${MAX_USD}`}
                    className="w-full p-3 rounded border bg-white text-[#003366] text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Receive: <span className="font-sans">{receiveString} Zevru</span>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-[#0066cc]"
                    />
                    <span className="text-sm">
                      I agree to the{" "}
                      <a
                        className="text-[#0066cc] underline cursor-pointer"
                        onClick={() => termsRef.current?.scrollIntoView({ behavior: "smooth" })}
                      >
                        Terms & Conditions
                      </a>
                      .
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!agreed || loading}
                  className={`w-full py-3 font-sans rounded ${!agreed || loading ? "bg-gray-300 text-gray-500" : "bg-[#0066cc] text-white hover:opacity-90"}`}
                >
                  {loading ? "Processing..." : "Approve & Buy"}
                </button>

                {status && <p className="mt-3 text-sm text-[#cc3300]">{status}</p>}

                {txHash && (
                  <div className="mt-4 text-sm bg-white p-3 rounded border">
                    <p className="font-sans text-[#00aa66]">Success 🎉</p>
                    <p>
                      View transaction:{" "}
                      <a
                        className="text-[#0066cc] underline"
                        href={`${BASE_SCAN_TX_PREFIX}${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                      </a>
                    </p>
                    <p className="mt-2">
                      You received <strong>{receiveString}</strong> Zevru for{" "}
                      <strong>${inputAmount}</strong>.
                    </p>
                  </div>
                )}

                {showCongrats && (
                  <div className="mt-6 p-4 bg-[#0066cc] text-white rounded-lg text-center">
                    <h3 className="text-lg font-sans">🎉 Congratulations!</h3>
                    <p className="mt-2">Your purchase was successful. Tokens should be in your wallet shortly.</p>
                  </div>
                )}
              </>
            ) : (
              hasMounted && (
                <p className="text-sm text-gray-600">Please connect your wallet to participate in the presale.</p>
              )
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
