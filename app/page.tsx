"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventKind = "LT" | "ST";
type PlannerEvent = {
  id: number;
  title: string;
  course: string;
  day: string;
  start: string;
  end: string;
  kind: EventKind;
  type: string;
  location: string;
  color: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SHORT_DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const COLORS = ["#6c5ce7", "#00a896", "#f08a5d", "#e05676", "#3b82c4"];

const starterEvents: PlannerEvent[] = [
  { id: 1, title: "Algorithms lecture", course: "CS 214", day: "Monday", start: "09:00", end: "10:30", kind: "LT", type: "Lecture", location: "ICT Theatre 2", color: COLORS[0] },
  { id: 2, title: "Database lab", course: "CS 221", day: "Monday", start: "13:00", end: "15:00", kind: "LT", type: "Lab", location: "Lab 4", color: COLORS[1] },
  { id: 3, title: "Networks lecture", course: "CS 218", day: "Tuesday", start: "10:00", end: "11:30", kind: "LT", type: "Lecture", location: "Room 014", color: COLORS[2] },
  { id: 4, title: "PASS session", course: "CS 214", day: "Wednesday", start: "12:00", end: "13:00", kind: "LT", type: "PASS", location: "Library Hub", color: COLORS[0] },
  { id: 5, title: "Research methods", course: "IS 205", day: "Thursday", start: "09:00", end: "10:30", kind: "LT", type: "Tutorial", location: "Room 206", color: COLORS[3] },
  { id: 6, title: "Quiz 2", course: "CS 221", day: "Thursday", start: "14:00", end: "15:00", kind: "ST", type: "Test", location: "Lab 4", color: COLORS[1] },
  { id: 7, title: "Group project check-in", course: "CS 218", day: "Friday", start: "11:00", end: "12:00", kind: "ST", type: "Study", location: "Student Hub", color: COLORS[2] },
];

function toMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function overlaps(a: PlannerEvent, b: PlannerEvent) {
  return a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

function EventCard({ event, compact = false, onDelete }: { event: PlannerEvent; compact?: boolean; onDelete: (id: number) => void }) {
  return (
    <article className={`event-card ${event.kind === "ST" ? "short-term" : ""} ${compact ? "compact" : ""}`} style={{ "--event-color": event.color } as React.CSSProperties}>
      <div className="event-head">
        <span className="course-pill">{event.course}</span>
        <button className="delete-button" onClick={() => onDelete(event.id)} aria-label={`Delete ${event.title}`}>×</button>
      </div>
      <h3>{event.title}</h3>
      <p>{event.start}–{event.end}</p>
      {!compact && <p className="location">{event.location}</p>}
      <span className="kind-label">{event.kind} · {event.type}</span>
    </article>
  );
}

export default function Home() {
  const [events, setEvents] = useState<PlannerEvent[]>(starterEvents);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<"ALL" | EventKind>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("unistack-events");
    if (saved) setEvents(JSON.parse(saved));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem("unistack-events", JSON.stringify(events));
  }, [events, ready]);

  const visibleEvents = useMemo(() => events.filter((event) => filter === "ALL" || event.kind === filter), [events, filter]);
  const todayEvents = visibleEvents.filter((event) => event.day === "Monday").sort((a, b) => a.start.localeCompare(b.start));

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const kind = form.get("kind") as EventKind;
    const next: PlannerEvent = {
      id: Date.now(), title: String(form.get("title")), course: String(form.get("course")),
      day: String(form.get("day")), start: String(form.get("start")), end: String(form.get("end")),
      kind, type: String(form.get("type")), location: String(form.get("location")) || "Location TBA",
      color: COLORS[events.length % COLORS.length],
    };
    if (toMinutes(next.end) <= toMinutes(next.start)) {
      setNotice("End time must be later than the start time.");
      return;
    }
    const clash = events.find((existing) => overlaps(existing, next));
    setEvents((current) => [...current, next]);
    setNotice(clash ? `Saved — heads up, this overlaps with ${clash.title}.` : "Event added to your week.");
    event.currentTarget.reset();
    setTimeout(() => setShowForm(false), 650);
  }

  function deleteEvent(id: number) {
    setEvents((current) => current.filter((event) => event.id !== id));
    setNotice("Event removed.");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>U</span><strong>UniStack</strong></div>
        <nav aria-label="Main navigation">
          <button className="nav-item active"><span>▦</span> My week</button>
          <button className="nav-item"><span>○</span> Calendar</button>
          <button className="nav-item"><span>✓</span> Assignments <b>3</b></button>
          <button className="nav-item"><span>◇</span> Courses</button>
        </nav>
        <div className="semester-card">
          <p>SEMESTER PROGRESS</p><strong>Week 7 of 14</strong>
          <div className="progress"><span /></div><small>7 weeks to finals</small>
        </div>
        <div className="profile"><div className="avatar">JV</div><div><strong>Juta</strong><small>Student plan</small></div><button aria-label="Open settings">•••</button></div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div><p className="eyebrow">MONDAY, 14 SEPTEMBER</p><h1>Your week, at a glance.</h1></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notifications">♢<i /></button><button className="primary" onClick={() => { setNotice(""); setShowForm(true); }}>＋ Add event</button></div>
        </header>

        <section className="hero-grid">
          <div className="next-up">
            <div><p className="eyebrow">NEXT UP · IN 42 MINUTES</p><h2>Algorithms lecture</h2><p>CS 214 · ICT Theatre 2</p></div>
            <div className="time-block"><strong>9:00</strong><span>AM</span></div>
            <button aria-label="Open next event">↗</button>
          </div>
          <div className="focus-card"><div className="focus-icon">◎</div><div><p className="eyebrow">SMART SUGGESTION</p><h3>You have a 90-minute gap</h3><p>Good time to review Database notes.</p></div><button>Plan it</button></div>
        </section>

        <section className="planner-section">
          <div className="section-heading">
            <div><h2>Weekly timetable</h2><p>14–18 September</p></div>
            <div className="filters" aria-label="Filter events">
              {(["ALL", "LT", "ST"] as const).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item === "ALL" ? "All events" : item === "LT" ? "Long term" : "Short term"}</button>)}
            </div>
          </div>
          <div className="week-grid">
            {DAYS.map((day, index) => (
              <div className="day-column" key={day}>
                <div className={`day-head ${index === 0 ? "today" : ""}`}><span>{SHORT_DAYS[index]}</span><strong>{14 + index}</strong></div>
                <div className="day-events">
                  {visibleEvents.filter((event) => event.day === day).sort((a, b) => a.start.localeCompare(b.start)).map((event) => <EventCard key={event.id} event={event} onDelete={deleteEvent} />)}
                  {!visibleEvents.some((event) => event.day === day) && <button className="empty-day" onClick={() => setShowForm(true)}>＋ Add something</button>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="deadlines"><div className="section-heading"><div><h2>Coming up</h2><p>Deadlines that need attention</p></div><button>View all →</button></div>
            <div className="deadline-row"><div className="date-chip"><b>18</b><span>SEP</span></div><div><strong>Database design report</strong><p>CS 221 · Assignment</p></div><span className="priority urgent">4 days</span></div>
            <div className="deadline-row"><div className="date-chip"><b>22</b><span>SEP</span></div><div><strong>Network security quiz</strong><p>CS 218 · Test</p></div><span className="priority">8 days</span></div>
          </div>
          <div className="today"><div className="section-heading"><div><h2>Today</h2><p>{todayEvents.length} scheduled events</p></div></div>{todayEvents.map((event) => <EventCard key={event.id} compact event={event} onDelete={deleteEvent} />)}</div>
        </section>
      </section>

      {showForm && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-event-title">
          <div className="modal-head"><div><p className="eyebrow">BUILD YOUR SCHEDULE</p><h2 id="new-event-title">Add a new event</h2></div><button onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
          <form onSubmit={addEvent}>
            <label className="wide">Event title<input name="title" placeholder="e.g. Software Engineering lecture" required /></label>
            <label>Course<input name="course" placeholder="CS 215" required /></label>
            <label>Category<select name="kind"><option value="LT">Long term (LT)</option><option value="ST">Short term (ST)</option></select></label>
            <label>Day<select name="day">{DAYS.map((day) => <option key={day}>{day}</option>)}</select></label>
            <label>Event type<select name="type">{["Lecture", "Tutorial", "Lab", "PASS", "Makeup", "Assignment", "Test", "Exam", "Study", "Personal"].map((type) => <option key={type}>{type}</option>)}</select></label>
            <label>Starts<input name="start" type="time" defaultValue="09:00" required /></label>
            <label>Ends<input name="end" type="time" defaultValue="10:00" required /></label>
            <label className="wide">Location<input name="location" placeholder="Building or room" /></label>
            {notice && <p className="form-notice wide">{notice}</p>}
            <div className="form-actions wide"><button type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" type="submit">Add to schedule</button></div>
          </form>
        </section>
      </div>}
      {notice && !showForm && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    </main>
  );
}
