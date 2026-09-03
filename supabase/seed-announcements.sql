-- Seed the default announcements from src/context/AppContext.jsx
insert into public.announcements (id, title, text, date)
values
(
  'ann-1',
  'Welcome to BSHM Connect',
  'BSHM Connect is now available for student announcements, concerns, and organization updates.',
  'September 2026'
),
(
  'ann-2',
  'Student Concern Portal',
  'Students may now submit concerns and suggestions through the BSHM Connect website.',
  'September 2026'
)
on conflict (id) do update set
  title = excluded.title,
  text = excluded.text,
  date = excluded.date;
