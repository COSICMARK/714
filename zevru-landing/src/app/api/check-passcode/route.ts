import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { passcode } = await req.json();
  const correct = process.env.ZEVRU_PASSCODE;

  if (passcode === correct) {
    return NextResponse.json({ authorized: true });
  }
  return NextResponse.json({ authorized: false }, { status: 401 });
}
