"use client";

import { useState, type FormEvent } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Profile } from "../../types/database";
import { exportPlannerData, type PlannerData, saveProfile } from "../../lib/data/planner";

export function ProfilePanel({ client, user, profile, data, onSaved, onClose }: { client: SupabaseClient<Database>; user: User; profile: Profile | null; data: PlannerData; onSaved: (profile: Profile) => void; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? user.user_metadata.full_name ?? "");
  const [university, setUniversity] = useState(profile?.university ?? "");
  const [programme, setProgramme] = useState(profile?.programme ?? "");
  const [semester, setSemester] = useState(profile?.semester ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "Pacific/Fiji");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(""); try { const saved = await saveProfile(client, { id: user.id, full_name: fullName, university, programme, semester, timezone, avatar_url: profile?.avatar_url ?? null }); onSaved(saved); setMessage("Profile saved."); } catch { setMessage("Could not save your profile. Try again."); } finally { setBusy(false); } }
  return <div className="modal-backdrop"><section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div className="modal-head"><div><p className="eyebrow">YOUR ACCOUNT</p><h2 id="profile-title">Profile and settings</h2></div><button onClick={onClose} aria-label="Close">×</button></div><div className="profile-summary"><div className="avatar">{(fullName || user.email || "U").split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><strong>{user.email}</strong><small>Read-only account email</small></div></div><form onSubmit={submit}><label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} /></label><label>University<input value={university} onChange={(event) => setUniversity(event.target.value)} /></label><label>Programme<input value={programme} onChange={(event) => setProgramme(event.target.value)} /></label><label>Semester<input value={semester} onChange={(event) => setSemester(event.target.value)} /></label><label className="wide">Time zone<select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>Pacific/Fiji</option><option>UTC</option><option>Australia/Sydney</option><option>Pacific/Auckland</option></select></label>{message && <p className="form-notice wide" role="status">{message}</p>}<div className="form-actions wide"><button type="button" onClick={() => exportPlannerData(data)}>Download account data</button><button className="primary" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button></div></form><div className="profile-danger"><strong>Delete account</strong><p>Coming soon. Account deletion will be enabled once a secure server-side flow is available.</p><button type="button" disabled>Coming soon</button><button type="button" onClick={() => client.auth.signOut()}>Sign out</button></div></section></div>;
}
