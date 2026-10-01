"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { UNITS, LEVELS } from "@/lib/constants";

const R = () => <span>*</span>;

export default function Register() {
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const photo = useRef("");
  const boxes = useRef<(HTMLDivElement | null)[]>([]);

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"); c.width = c.height = 240;
        const s = Math.min(im.width, im.height);
        c.getContext("2d")!.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 240, 240);
        photo.current = c.toDataURL("image/jpeg", 0.75);
      };
      im.src = r.result as string;
    };
    r.readAsDataURL(f);
  }

  async function next() {
    const box = boxes.current[step]!;
    const bad = Array.from(box.querySelectorAll<HTMLInputElement>("[required]")).find(i => !i.checkValidity());
    if (bad) { setErr("Please fill in all the required fields (*)."); bad.focus(); return; }
    if (step === 2 && !form.current!.querySelector("[name=join]:checked")) { setErr("Choose at least one unit you would like to join."); return; }
    setErr("");
    if (step < 2) { setStep(step + 1); window.scrollTo(0, 0); return; }
    const fd = new FormData(form.current!);
    const b: Record<string, unknown> = Object.fromEntries([...fd.entries()].filter(([k]) => !["photo", "join", "current"].includes(k)));
    b.join = fd.getAll("join"); b.current = fd.getAll("current"); b.photo = photo.current;
    setBusy(true);
    const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    setBusy(false);
    if (r.ok) setDone(true); else setErr((await r.json()).error || "Something went wrong. Please try again.");
  }

  const hide = (i: number) => (i === step ? "step" : "step hide");
  const ref = (i: number) => (el: HTMLDivElement | null) => { boxes.current[i] = el; };

  if (done) return (
    <div className="hero"><h2>Registration received</h2><p>Thank you for registering. Welcome to the Unique Fellowship on Campus.</p>
      <button onClick={() => location.reload()}>Register another member</button></div>
  );

  return (
    <>
      <div className="hero"><h1>Membership Registration 2026/2027</h1><p>Welcome to Scripture Union Campus Fellowship, Uniuyo Town Campus.</p></div>
      <div className="steps">{[0, 1, 2].map(i => <i key={i} className={i <= step ? "on" : ""} />)}</div>
      <form ref={form} noValidate onSubmit={e => e.preventDefault()}>
        <div ref={ref(0)} className={hide(0)}>
          <h2>Personal information</h2>
          <label>Passport photo<R /></label><input type="file" accept="image/*" required onChange={onPhoto} />
          <label>Full name<R /></label><input name="name" required />
          <label>Email address<R /></label><input name="email" type="email" required />
          <label>Phone number<R /></label><input name="phone" type="tel" required />
          <label>Gender<R /></label>
          <div className="opts"><label><input type="radio" name="gender" value="Male" required />Male</label><label><input type="radio" name="gender" value="Female" />Female</label></div>
          <label>Date of birth<R /></label><input name="dob" type="date" required />
          <label>Residential address<R /></label><textarea name="address" rows={2} required />
          <label>State of origin<R /></label><input name="state" required />
          <label>Church denomination<R /></label><input name="church" required />
          <label>Emergency contact and relationship<R /></label><input name="emergency" placeholder="e.g. Mrs Udo (mother), 080..." required />
          <label>Parent or guardian&apos;s residential address<R /></label><input name="guardian" required />
        </div>
        <div ref={ref(1)} className={hide(1)}>
          <h2>School information</h2>
          <label>Faculty<R /></label><input name="faculty" required />
          <label>Department<R /></label><input name="dept" required />
          <label>Level<R /></label>
          <div className="opts">{LEVELS.map(l => <label key={l}><input type="radio" name="level" value={l} required />{l}</label>)}</div>
        </div>
        <div ref={ref(2)} className={hide(2)}>
          <h2>Other information</h2>
          <label>Are you born again?<R /></label>
          <div className="opts">{["Yes", "No", "Maybe"].map(v => <label key={v}><input type="radio" name="born" value={v} required />{v}</label>)}</div>
          <label>How did you get to know SUCF?<R /></label>
          <select name="source" required defaultValue=""><option value="">Choose one</option><option>Recommendation from relations</option><option>Social media</option><option>Evangelism</option><option>Other</option></select>
          <label>Which unit do you belong to?</label>
          <div className="opts">{UNITS.map(u => <label key={u}><input type="checkbox" name="current" value={u} />{u}</label>)}</div>
          <label>Which unit would you like to join?<R /></label>
          <div className="opts">{UNITS.map(u => <label key={u}><input type="checkbox" name="join" value={u} />{u}</label>)}</div>
          <label>Is there anything you feel the fellowship isn&apos;t doing right?</label><textarea name="wrong" rows={3} />
          <label>What suggestions do you have to improve the fellowship?</label><textarea name="suggest" rows={3} />
        </div>
        <p className="note" style={{ color: "#c0392b" }} role="alert">{err}</p>
        <div className="nav">
          <button type="button" className="alt" style={{ visibility: step ? "visible" : "hidden" }} onClick={() => { setStep(step - 1); setErr(""); }}>Back</button>
          <button type="button" disabled={busy} onClick={next}>{step === 2 ? (busy ? "Submitting..." : "Submit registration") : "Next"}</button>
        </div>
      </form>
    </>
  );
}
