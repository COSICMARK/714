"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Leaderboard from "../components/Leaderboard";


export default function Application() {
  const [passcode, setPasscode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Tasks state
  const [tasks, setTasks] = useState({
    twitter: false,
    discord: false,
    retweet: false,
  });

  // Form state
  const [form, setForm] = useState({
    fullname: "",
    twitter: "",
    discord: "",
    erc20: "",
    inviterCode: "",
    bullishReason: "",
    whitelistChoice: "no",
  });

  const allTasksCompleted = Object.values(tasks).every(Boolean);

  // 🔑 Passcode check
  const handleCheckPasscode = async () => {
    try {
      const res = await fetch("/api/check-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (res.ok) {
        setAuthorized(true);
      } else {
        alert("❌ Wrong passcode. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error verifying passcode.");
    }
  };

  // Input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form → Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // don't alter logic — write invite_code as twitter handle (as requested)
    const payload = {
      fullname: form.fullname,
      twitter: form.twitter,
      discord_username: form.discord,
      erc20: form.erc20,
      inviter_code: form.inviterCode,
      bullish_reason: form.bullishReason,
      whitelist_choice: form.whitelistChoice,
      invite_code: form.twitter,
    };

    const { error, data } = await supabase.from("applications").insert([payload]).select("*").single();

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      setUserData(data); // save data → switch to referral interface
    }
  };

  // On reload → check if user exists
  useEffect(() => {
    const checkExistingUser = async () => {
      if (!form.erc20 && !form.discord && !form.twitter) return;

      const { data } = await supabase
        .from("applications")
        .select("*")
        .or(
          `erc20.eq.${form.erc20},discord_username.eq.${form.discord},twitter.eq.${form.twitter}`
        )
        .maybeSingle();

      if (data) {
        setUserData(data); // Skip form → load referral/leaderboard
      }
    };
    checkExistingUser();
  }, [form.erc20, form.discord, form.twitter]);

  // If not authorized → show passcode entry
  if (!authorized) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto text-center">
        <h2 className="text-2xl font-extrabold italic text-blue-700 mb-4 tracking-wide">
          🔑 Enter Passcode
        </h2>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter passcode..."
          className="border-2 border-blue-500 rounded-md p-3 w-72 focus:outline-none focus:ring-4 focus:ring-blue-300 font-mono text-center text-blue-800"
        />
        <button
          onClick={handleCheckPasscode}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:scale-105 hover:shadow-xl transition font-bold tracking-wider"
        >
          Unlock Application
        </button>
      </div>
    );
  }

 // 🚀 If user exists → show referral panel + inline leaderboard
if (userData) {
  const shortWallet = userData.erc20
    ? `${userData.erc20.slice(0, 6)}...${userData.erc20.slice(-4)}`
    : "N/A";

  const inviteCode =
    userData.discord?.trim() ||
    userData.twitter?.trim() ||
    "guest";

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => alert("✅ Copied to clipboard!"))
      .catch(() => alert("⚠️ Failed to copy"));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-blue-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* 🔹 Left: wallet + invite */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-blue-700 text-center">
              🎉 Welcome, {userData.fullname || "friend"}!
            </h2>

            {/* Wallet */}
            <button
              onClick={() => userData.erc20 && copyToClipboard(userData.erc20)}
              className="w-full flex justify-between items-center px-4 py-2 bg-blue-600 text-white font-mono rounded-lg shadow hover:bg-blue-700 transition"
            >
              <span>{shortWallet}</span>
              <span className="text-xs">⧉</span>
            </button>

            {/* Invite Code */}
            <button
              onClick={() => copyToClipboard(inviteCode)}
              className="w-full flex justify-between items-center px-4 py-2 bg-indigo-600 text-white font-mono rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <span>@{inviteCode}</span>
              <span className="text-xs">⧉</span>
            </button>

            <p className="text-xs text-gray-500 text-center">
              Share this username to earn referrals, Invite code is your Twitter username
            </p>
          </div>

          {/* 🔹 Right: Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard currentInviteCode={inviteCode} />
          </div>
        </div>
      </div>
    </div>
  );
}


  // Otherwise → Show application form
  return (
    <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-6 overflow-y-auto max-h-[80vh]">
      <h2 className="text-3xl font-extrabold mb-6 italic text-blue-800 drop-shadow-md">
        📝 Application Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 font-serif text-blue-900">
        {/* Full Name */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            className="w-full border-2 border-blue-400 rounded-md p-3 text-blue-900"
            required
          />
        </div>

        {/* Twitter */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">Twitter Handle</label>
          <input
            type="text"
            name="twitter"
            placeholder="@yourhandle"
            value={form.twitter}
            onChange={handleChange}
            className="w-full border-2 border-blue-400 rounded-md p-3 text-blue-900"
            required
          />
        </div>

        {/* Discord */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">Discord Username</label>
          <input
            type="text"
            name="discord"
            placeholder="username#1234"
            value={form.discord}
            onChange={handleChange}
            className="w-full border-2 border-indigo-400 rounded-md p-3 text-blue-900"
            required
          />
        </div>

        {/* ERC20 */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">ERC20 Wallet Address</label>
          <input
            type="text"
            name="erc20"
            placeholder="0x..."
            value={form.erc20}
            onChange={handleChange}
            className="w-full border-2 border-blue-400 rounded-md p-3 font-mono text-blue-900"
            required
          />
        </div>

        {/* Inviter Code */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">Inviter Code</label>
          <input
            type="text"
            name="inviterCode"
            placeholder="Enter inviter's Twitter handle"
            value={form.inviterCode}
            onChange={handleChange}
            className="w-full border-2 border-green-400 rounded-md p-3 text-blue-900"
          />
        </div>

        {/* Bullish Reason */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">Why do you believe in ZEVRU?</label>
          <textarea
            name="bullishReason"
            rows={3}
            value={form.bullishReason}
            onChange={handleChange}
            className="w-full border-2 border-blue-400 rounded-md p-3 text-blue-900"
          />
        </div>

        {/* Whitelist */}
        <div>
          <label className="block text-sm mb-1 font-bold text-blue-700">
            Do you want to be whitelisted for ZEVRU mint?
          </label>
          <select
            name="whitelistChoice"
            value={form.whitelistChoice}
            onChange={handleChange}
            className="w-full border-2 border-indigo-400 rounded-md p-3 text-blue-900"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {/* Social Tasks */}
        <div className="space-y-3">
          <p className="font-bold text-blue-700">✅ Complete the social tasks:</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTasks({ ...tasks, twitter: true })}
              className={`px-4 py-2 rounded-md shadow font-bold ${
                tasks.twitter ? "bg-green-500 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {tasks.twitter ? "✔ Followed Twitter" : "Follow Twitter"}
            </button>
            <button
              type="button"
              onClick={() => setTasks({ ...tasks, discord: true })}
              className={`px-4 py-2 rounded-md shadow font-bold ${
                tasks.discord ? "bg-green-500 text-white" : "bg-indigo-600 text-white"
              }`}
            >
              {tasks.discord ? "✔ Joined Discord" : "Join Discord"}
            </button>
            <button
              type="button"
              onClick={() => setTasks({ ...tasks, retweet: true })}
              className={`px-4 py-2 rounded-md shadow font-bold ${
                tasks.retweet ? "bg-green-500 text-white" : "bg-yellow-600 text-white"
              }`}
            >
              {tasks.retweet ? "✔ Retweeted" : "Retweet"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!allTasksCompleted}
          className={`w-full py-3 rounded-lg font-extrabold transition ${
            allTasksCompleted
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
