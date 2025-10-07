"use client";

import { useEffect, useState } from "react";

type LeaderEntry = {
  id: string;
  fullname?: string;
  twitter: string;
  discord?: string;
  erc20?: string;
  invite_code?: string;
  referrals: number;
  inviter_code?: string | null;
};

export default function Leaderboard({
  currentInviteCode,
}: {
  currentInviteCode?: string;
}) {
  const [data, setData] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LeaderEntry[] | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const json = await res.json();
        setData(json.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const q = query.toLowerCase().replace(/^@/, ""); // remove @ if pasted
    const rankNumber = parseInt(q.replace("#", ""), 10);

    // if query is a valid number, find by rank
    const byRank =
      !isNaN(rankNumber) && rankNumber > 0 && rankNumber <= data.length
        ? [data[rankNumber - 1]] // ranks are 1-based
        : [];

    const byFields = data.filter(
      (u) =>
        (u.twitter || "").toLowerCase().replace(/^@/, "") === q ||
        (u.discord || "").toLowerCase() === q ||
        (u.erc20 || "").toLowerCase() === q ||
        (u.invite_code || "").toLowerCase() === q
    );

    // combine unique results
    const combined = [...new Set([...byRank, ...byFields])];
    setSearchResults(combined.length ? combined : []);
  };

  const formatUsername = (u: LeaderEntry) => {
    if (u.discord) return u.discord;
    if (u.twitter) return u.twitter.startsWith("@") ? u.twitter : `@${u.twitter}`;
    if (u.fullname) return u.fullname;
    return "Anonymous";
  };

  if (loading) return <div className="text-blue-700">Loading leaderboard…</div>;

  const listToShow =
    searchResults !== null ? searchResults : data.slice(0, 3);

  const rankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="w-full bg-white border border-blue-100 rounded-2xl p-6 shadow-lg">
      <h3 className="text-2xl font-sans text-blue-800 mb-6 flex items-center gap-2">
        🏆 Leaderboard (Top 5)
      </h3>

      {/* Cards Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {listToShow.length === 0 && (
          <div className="text-center col-span-full text-blue-600">
            No results found.
          </div>
        )}

        {listToShow.map((u, idx) => {
          // find actual rank from full data
          const rank =
            data.findIndex((x) => x.id === u.id) + 1 || idx + 1;
          const isCurrent =
            currentInviteCode &&
            (u.invite_code || u.twitter || u.discord) === currentInviteCode;

          return (
            <div
              key={u.id}
              className={`p-5 rounded-xl shadow-md border ${
                isCurrent
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-sans text-blue-700">
                  {rankBadge(rank)}
                </span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-sans">
                  {u.referrals} invites
                </span>
              </div>

              <div className="text-lg font-sans text-blue-800 truncate">
                {formatUsername(u)}
              </div>

              {u.fullname && (
                <div className="text-sm text-gray-500 truncate">
                  ({u.fullname})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🔍 Search Section */}
      <div className="border-t border-blue-100 pt-6 mt-4">
        <h4 className="text-lg font-sans text-blue-700 mb-3">
          Find by Twitter, Discord, Wallet or Rank
        </h4>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste @twitter, discord, wallet, or rank number..."
            className="px-3 py-2 border border-blue-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-200 text-blue-800"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-sans hover:scale-105 transition w-full sm:w-auto"
            >
              🔍
            </button>
            <button
              onClick={() => {
                setQuery("");
                setSearchResults(null);
              }}
              className="px-3 py-2 border border-blue-200 rounded-lg text-blue-700 bg-white w-full sm:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {searchResults && (
          <div className="mt-4 text-sm text-blue-700">
            Showing {searchResults.length} result(s) for{" "}
            <span className="font-sans">"{query}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
