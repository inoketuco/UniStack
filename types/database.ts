export type EventKind = "LT" | "ST";
export type AssignmentPriority = "Low" | "Medium" | "High";
export type AssignmentStatus = "Not Started" | "In Progress" | "Ready to Submit" | "Submitted" | "Completed";
export type RecurrenceType = "none" | "weekly";

export type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  programme: string | null;
  semester: string | null;
  timezone: string;
  avatar_url: string | null;
  email?: string | null;
};

export type Course = {
  id: string;
  user_id: string;
  name: string;
  code: string;
  color: string;
  lecturer: string | null;
  tutor: string | null;
  location: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PlannerEvent = {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  event_type: string;
  term_type: EventKind;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  color: string | null;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  recurrence_group_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Assignment = {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  due_date: string;
  priority: AssignmentPriority;
  estimated_hours: number | null;
  progress: number;
  status: AssignmentStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & Pick<Profile, "id">; Update: Partial<Profile>; Relationships: [] };
      courses: { Row: Course; Insert: Omit<Course, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Course, "id" | "user_id">>; Relationships: [] };
      events: { Row: PlannerEvent; Insert: Omit<PlannerEvent, "id" | "created_at" | "updated_at">; Update: Partial<Omit<PlannerEvent, "id" | "user_id">>; Relationships: [] };
      assignments: { Row: Assignment; Insert: Omit<Assignment, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Assignment, "id" | "user_id">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
