-- Seed the default milestones from src/data/milestones.js
insert into public.milestones (
  id, title, category, date, year, badge_icon, description, participants, images, author_role
)
values
(
  'ms-1',
  'Overall Champions - Regional Hospitality Skills Olympics',
  'Competition',
  'August 2026',
  '2026',
  '🏆',
  'BSHM students swept top honors across Table Setting, Bartending Mixology, and Culinary Showcase, bringing home the Overall Championship Trophy for the department.',
  'BSHM Skills Delegation Team',
  '{}',
  'BSHM Officer'
),
(
  'ms-2',
  'Program Accreditation Level III Re-Accreditation Conferred',
  'Award & Recognition',
  'July 2026',
  '2026',
  '🎖️',
  'Successfully conferred Level III Re-Accredited status for the Bachelor of Science in Hospitality Management program, reflecting high academic excellence and modern laboratory standards.',
  'Faculty, Officers & Student Council',
  '{}',
  'Department Adviser'
),
(
  'ms-3',
  '1st BSHM National Hospitality Leadership Summit 2026',
  'Institutional Event',
  'May 2026',
  '2026',
  '🌟',
  'Gathered over 400 student delegates, industry executives, and international hotel chain leaders for immersive plenary sessions and career networking.',
  'Student Leaders & Industry Partners',
  '{}',
  'Department Adviser'
),
(
  'ms-4',
  'Gold & Silver Medals in Inter-Collegiate Flairtending Cup',
  'Competition',
  'November 2025',
  '2025',
  '🥇',
  'Our 3rd and 4th Year student representatives captured 1st and 2nd place in the National Bartending and Mixology Cup held in Manila.',
  'BSHM Competition Delegation',
  '{}',
  'BSHM Officer'
)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  date = excluded.date,
  year = excluded.year,
  badge_icon = excluded.badge_icon,
  description = excluded.description,
  participants = excluded.participants,
  images = excluded.images,
  author_role = excluded.author_role,
  updated_at = now();
