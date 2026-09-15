"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "../../types/database";
import { exportPlannerData, type PlannerData } from "../../lib/data/planner";
import { hasLegacyPlannerData, migrateLegacyPlannerData } from "../../lib/data/migration";

export function MigrationPrompt({ client, user, data, onComplete }: { client: SupabaseClient<Database>; user: User; data: PlannerData; onComplete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  useEffect(() => { const check = window.setTimeout(() => setVisible(!window.localStorage.getItem("unistack-supabase-migration-complete") && hasLegacyPlannerData()), 0); return () => window.clearTimeout(check); }, []);
  if (!visible) return null;
  async function migrate() { setBusy(true); setMessage(""); try { await migrateLegacyPlannerData(client, user.id); onComplete(); } catch { setMessage("Import failed. Your local data is still intact; download a backup and try again."); } finally { setBusy(false); } }
  return <div className="modal-backdrop"><section className="modal migration-modal" role="dialog" aria-modal="true" aria-labelledby="migration-title"><p className="eyebrow">WELCOME TO YOUR ACCOUNT</p><h2 id="migration-title">Bring your local planner with you?</h2><p>UniStack found timetable, assignment, or course data on this device. Import it into your account, or download a backup first.</p>{message && <p className="form-notice" role="alert">{message}</p>}<div className="form-actions"><button onClick={() => exportPlannerData(data)}>Download backup</button><button className="primary" onClick={migrate} disabled={busy}>{busy ? "Importing…" : "Import local data"}</button></div><button className="migration-dismiss" onClick={onComplete}>Keep local data for now</button></section></div>;
}
