-- Seed the default events from src/context/AppContext.jsx
insert into public.events (id, title, date, description)
values
(
  'ev-1',
  'BSHM Student Orientation',
  'September 2026',
  'An orientation for students about BSHM programs, activities, policies, and organization projects.'
),
(
  'ev-2',
  'Hospitality Skills Workshop',
  'October 2026',
  'A practical workshop designed to strengthen students hospitality and service skills.'
),
(
  'ev-3',
  'BSHM Hospitality Week',
  'November 2026',
  'A week-long celebration featuring competitions, activities, learning sessions, and team-building.'
)
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  description = excluded.description;
