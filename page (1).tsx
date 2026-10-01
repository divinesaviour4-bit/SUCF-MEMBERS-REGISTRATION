"use client";
import { useEffect, useState } from "react";
import { UNITS, LEVELS } from "@/lib/constants";

type Member = { id: string; name: string; email: string; phone: string; gender: string; dept: string; level: number; born: string; join_units: string[]; current_units: string[]; photo_url: string | null };

export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [lvl, setLvl] = useState(100);
  const [unit, setUnit] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [to, setTo] = useState("level");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { document.body.classList.add("am"); return () => document.body.classList.remove("am"); }, []);
  async function load() {
    const r = await fetch("/api/admin/members");
    if (r.ok) { setMembers((await r.json()).members); setOk(true); } else setOk(false);
  }
  useEffect(() => { load(); }, []);

  async function login() {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) { setPw(""); setErr(""); load(); } else setErr("Wrong password. Try again.");
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setOk(false); setMembers([]); }

  const inLevel = members.filter(m => m.level === lvl);
  const rows = inLevel.filter(m => !unit || m.join_units?.includes(unit));

  function exportExcel() {
    const q = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const head = ["Name", "Gender", "Phone", "Email", "Department", "Level", "Born again", "Units to join", "Current units"];
    const lines = [head.map(q).join(",")].concat(rows.map(m => [m.name, m.gender, m.phone, m.email, m.dept, m.level, m.born, (m.join_units || []).join("; "), (m.current_units || []).join("; ")].map(q).join(",")));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
    a.download = `SUCF-${lvl}-level.csv`; a.click();
  }

  async function send() {
    if (to === "unit" && !unit) { setNote("Choose a unit in the filter above first."); return; }
    if (!subject || !message) { setNote("Write a subject and a message."); return; }
    const who = to === "all" ? "ALL members" : to === "level" ? `all ${lvl} level members` : `everyone who chose ${unit}`;
    if (!confirm(`Send this email to ${who}?`)) return;
    setNote("Sending...");
    const r = await fetch("/api/admin/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message, level: to === "level" ? lvl : undefined, unit: to === "unit" ? unit : undefined }) });
    const j = await r.json();
    if (r.ok) { setNote(`Sent to ${j.sent} member(s).`); setSubject(""); setMessage(""); } else setNote(j.error || "Could not send.");
  }

  if (ok === null) return <p>Loading...</p>;
  if (!ok) return (
    <div id="login"><h2>Admin login</h2>
      <label>Password</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
      <p className="note" style={{ color: "#c0392b" }} role="alert">{err}</p><button onClick={login}>Log in</button></div>
  );

  return (
    <>
      <h2>Members</h2>
      <div className="stats">
        <div className="stat"><b>{members.length}</b>Total members</div>
        <div className="stat"><b>{members.filter(m => m.gender === "Male").length}</b>Male</div>
        <div className="stat"><b>{members.filter(m => m.gender === "Female").length}</b>Female</div>
        <div className="stat"><b>{inLevel.length}</b>In this level</div>
      </div>
      <div className="tabs">{LEVELS.map(l => <button key={l} className={l === lvl ? "on" : ""} onClick={() => setLvl(l)}>{l} level ({members.filter(m => m.level === l).length})</button>)}</div>
      <div className="tools">
        <select value={unit} onChange={e => setUnit(e.target.value)}><option value="">All units</option>{UNITS.map(u => <option key={u}>{u}</option>)}</select>
        <button onClick={() => window.print()}>Print</button>
        <button className="alt" onClick={() => window.print()}>Download PDF</button>
        <button className="alt" onClick={exportExcel}>Export Excel</button>
        <button className="alt" onClick={logout}>Log out</button>
      </div>
      <h3>{lvl} level members</h3>
      <div className="wrap"><table>
        <thead><tr><th>Photo</th><th>Name</th><th>Gender</th><th>Phone</th><th>Email</th><th>Department</th><th>Units to join</th></tr></thead>
        <tbody>{rows.length ? rows.map(m => (
          <tr key={m.id}>
            <td>{m.photo_url ? <img className="ph" src={m.photo_url} alt="" /> : <div className="ph" />}</td>
            <td>{m.name}</td><td>{m.gender}</td><td>{m.phone}</td><td>{m.email}</td><td>{m.dept}</td><td>{(m.join_units || []).join(", ")}</td>
          </tr>)) : <tr><td colSpan={7}>No members here yet.</td></tr>}</tbody>
      </table></div>
      <p className="note noprint">Download PDF opens the print window: choose &quot;Save as PDF&quot; as the printer.</p>
      <div className="msgbox noprint">
        <h3>Send an email</h3>
        <label>Send to</label>
        <select value={to} onChange={e => setTo(e.target.value)}>
          <option value="level">All {lvl} level members ({inLevel.length})</option>
          <option value="unit">Members who chose the unit selected in the filter</option>
          <option value="all">All members ({members.length})</option>
        </select>
        <label>Subject</label><input value={subject} onChange={e => setSubject(e.target.value)} />
        <label>Message</label><textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} />
        <p className="note" role="status">{note}</p>
        <button onClick={send}>Send email</button>
      </div>
    </>
  );
}
