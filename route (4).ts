import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// body: { subject, message, level?: number, unit?: string }  (omit both to email everyone)
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { subject, message, level, unit } = await req.json();
  if (!subject || !message) return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });

  let q = db.from("members").select("email");
  if (level) q = q.eq("level", level);
  if (unit) q = q.contains("join_units", [unit]);
  const { data } = await q;
  const emails = [...new Set((data ?? []).map(m => String(m.email).trim()).filter(Boolean))];
  if (!emails.length) return NextResponse.json({ error: "No members match" }, { status: 404 });
  if (emails.length > 450) return NextResponse.json({ error: "Gmail allows about 500 emails a day. Send to a level or unit instead of everyone." }, { status: 400 });

  const user = process.env.GMAIL_USER!;
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass: process.env.GMAIL_APP_PASSWORD } });
  const esc = (s: string) => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  try {
    for (let i = 0; i < emails.length; i += 50) {
      await transporter.sendMail({
        from: `"SUCF Uniuyo" <${user}>`,
        to: user,
        bcc: emails.slice(i, i + 50),
        subject,
        text: message,
        html: `<div style="font-family:sans-serif;white-space:pre-wrap">${esc(message)}</div>`,
      });
    }
  } catch {
    return NextResponse.json({ error: "Gmail rejected the send. Check GMAIL_USER and the app password." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sent: emails.length });
}
