import type { SupabaseClient } from "@supabase/supabase-js";
import type { Assignment, Course, Database, PlannerEvent, Profile } from "../../types/database";

export type PlannerData = { profile: Profile | null; courses: Course[]; events: PlannerEvent[]; assignments: Assignment[] };

export async function loadPlannerData(client: SupabaseClient<Database>, userId: string): Promise<PlannerData> {
  const [profileResult, coursesResult, eventsResult, assignmentsResult] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).maybeSingle(),
    client.from("courses").select("*").eq("user_id", userId).order("code"),
    client.from("events").select("*").eq("user_id", userId).order("event_date").order("start_time"),
    client.from("assignments").select("*").eq("user_id", userId).order("due_date"),
  ]);
  const failure = profileResult.error || coursesResult.error || eventsResult.error || assignmentsResult.error;
  if (failure) throw failure;
  return { profile: profileResult.data, courses: coursesResult.data ?? [], events: eventsResult.data ?? [], assignments: assignmentsResult.data ?? [] };
}

export async function saveProfile(client: SupabaseClient<Database>, profile: Profile) {
  const { data, error } = await client.from("profiles").upsert(profile).select("*").single();
  if (error) throw error;
  return data;
}

export async function createCourse(client: SupabaseClient<Database>, userId: string, course: Omit<Course, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data, error } = await client.from("courses").insert({ ...course, user_id: userId }).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCourse(client: SupabaseClient<Database>, id: string, course: Partial<Course>) {
  const { data, error } = await client.from("courses").update(course).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteCourse(client: SupabaseClient<Database>, id: string) {
  const { error } = await client.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function createAssignment(client: SupabaseClient<Database>, userId: string, assignment: Omit<Assignment, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data, error } = await client.from("assignments").insert({ ...assignment, user_id: userId }).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateAssignment(client: SupabaseClient<Database>, id: string, assignment: Partial<Assignment>) {
  const { data, error } = await client.from("assignments").update(assignment).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteAssignment(client: SupabaseClient<Database>, id: string) {
  const { error } = await client.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

export async function createEvent(client: SupabaseClient<Database>, userId: string, event: Omit<PlannerEvent, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data, error } = await client.from("events").insert({ ...event, user_id: userId }).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateEvent(client: SupabaseClient<Database>, id: string, event: Partial<PlannerEvent>) {
  const { data, error } = await client.from("events").update(event).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(client: SupabaseClient<Database>, id: string) {
  const { error } = await client.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function exportPlannerData(data: PlannerData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `unistack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
