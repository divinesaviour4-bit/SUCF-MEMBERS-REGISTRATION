import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  const b = await req.json();
  const need = ["name", "email", "phone", "gender", "level"];
  if (need.some(k => !b[k])) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  let photo_url: string | null = null;
  if (b.photo?.startsWith("data:image")) {
    const buf = Buffer.from(b.photo.split(",")[1], "base64");
    if (buf.length > 1_500_000) return NextResponse.json({ error: "Photo too large" }, { status: 400 });
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const up = await db.storage.from("photos").upload(path, buf, { contentType: "image/jpeg" });
    if (!up.error) photo_url = db.storage.from("photos").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await db.from("members").insert({
    name: b.name, email: b.email, phone: b.phone, gender: b.gender, dob: b.dob || null,
    address: b.address, state: b.state, church: b.church, emergency: b.emergency, guardian: b.guardian,
    faculty: b.faculty, dept: b.dept, level: +b.level, born: b.born, source: b.source,
    current_units: b.current ?? [], join_units: b.join ?? [], wrong: b.wrong, suggest: b.suggest, photo_url,
  });
  if (error) return NextResponse.json({ error: "Could not save registration" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
