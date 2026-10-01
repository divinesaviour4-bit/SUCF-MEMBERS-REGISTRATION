import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
const sign = (v: string) => createHmac("sha256", process.env.SESSION_SECRET!).update(v).digest("hex");
export function passwordOk(input: string) {
  const a = Buffer.from(input), b = Buffer.from(process.env.ADMIN_PASSWORD!);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function makeToken() { const exp = String(Date.now() + 8 * 3600e3); return exp + "." + sign(exp); }
export async function isAdmin() {
  const t = (await cookies()).get("sucf_admin")?.value; if (!t) return false;
  const [exp, sig] = t.split("."); return !!sig && sig === sign(exp) && Date.now() < +exp;
}
