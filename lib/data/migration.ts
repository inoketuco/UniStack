import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";

export const MIGRATION_FLAG = "unistack-supabase-migration-complete";

type LegacyEvent = { title?: string; course?: string; date?: string; day?: string; start?: string; end?: string; kind?: "LT" | "ST"; type?: string; location?: string; color?: string; recurrence?: "none" | "weekly"; recurrenceEnd?: string };
type LegacyAssignment = { title?: string; course?: string; dueDate?: string; priority?: "Low" | "Medium" | "High"; duration?: number; progress?: number; status?: "Not Started" | "In Progress" | "Ready to Submit" | "Submitted" | "Completed" };
type LegacyCourse = { name?: string; code?: string; color?: string; lecturer?: string; tutor?: string; location?: string; notes?: string };

function read<T>(key: string): T[] { try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T[] : []; } catch { return []; } }

export function hasLegacyPlannerData() { return ["unistack-events", "unistack-assignments", "unistack-courses"].some((key) => Boolean(window.localStorage.getItem(key))); }

export async function migrateLegacyPlannerData(client: SupabaseClient<Database>, userId: string) {
  const legacyCourses = read<LegacyCourse>("unistack-courses");
  const legacyEvents = read<LegacyEvent>("unistack-events");
  const legacyAssignments = read<LegacyAssignment>("unistack-assignments");
  const { data: courses, error: courseError } = await client.from("courses").upsert(legacyCourses.filter((course) => course.code).map((course) => ({ user_id: userId, name: course.name || course.code || "Course", code: course.code!, color: course.color || "#00a896", lecturer: course.lecturer || null, tutor: course.tutor || null, location: course.location || null, notes: course.notes || null })), { onConflict: "user_id,code" }).select("*");
  if (courseError) throw courseError;
  const courseId = new Map((courses ?? []).map((course) => [course.code, course.id]));
  const { error: eventError } = await client.from("events").insert(legacyEvents.filter((event) => event.title && event.date && event.start && event.end).map((event) => ({ user_id: userId, course_id: event.course ? courseId.get(event.course) ?? null : null, title: event.title!, event_type: event.type || "Study", term_type: event.kind || "LT", event_date: event.date!, start_time: event.start!, end_time: event.end!, location: event.location || null, notes: null, color: event.color || null, recurrence_type: event.recurrence || "none", recurrence_end_date: event.recurrenceEnd || null, recurrence_group_id: null })));
  if (eventError) throw eventError;
  const { error: assignmentError } = await client.from("assignments").insert(legacyAssignments.filter((item) => item.title && item.dueDate).map((item) => ({ user_id: userId, course_id: item.course ? courseId.get(item.course) ?? null : null, title: item.title!, due_date: item.dueDate!, priority: item.priority || "Medium", estimated_hours: item.duration || 0, progress: item.progress || 0, status: item.status || "Not Started", notes: null })));
  if (assignmentError) throw assignmentError;
  window.localStorage.setItem(MIGRATION_FLAG, "true");
}
