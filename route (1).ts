import { NextResponse } from "next/server";
import { passwordOk, makeToken } from "@/lib/auth";
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!passwordOk(String(password ?? ""))) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sucf_admin", makeToken(), { httpOnly: true, secure: true, sameSite: "strict", maxAge: 8 * 3600, path: "/" });
  return res;
}
