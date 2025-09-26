import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";

export async function GET() {
  // Only select needed columns
  const { data: users, error } = await supabase
    .from("applications")
    .select("id, twitter, discord_username, erc20, invite_code, inviter_code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count referrals ignoring case
  const referralMap: Record<string, number> = {};
  users?.forEach((u) => {
    if (u.inviter_code) {
      const inviter = u.inviter_code.toLowerCase();
      referralMap[inviter] = (referralMap[inviter] || 0) + 1;
    }
  });

  // Build leaderboard, also match in lower case
  const leaderboard = users
    ?.map((u) => ({
      id: u.id,
      twitter: u.twitter,
      discord: u.discord_username,
      erc20: u.erc20,
      invite_code: u.invite_code,
      referrals: referralMap[u.invite_code.toLowerCase()] || 0,
    }))
    .sort((a, b) => b.referrals - a.referrals);

  return NextResponse.json({ leaderboard });
}
