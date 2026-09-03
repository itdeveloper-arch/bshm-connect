-- Seed the default officers from src/data/officers.js
insert into public.officers (
  id, name, position, tier_level, tier_name, role_tag, icon, is_governor, photo
)
values
('off-1', 'KRIEXA ANGELA A. LAMAN', 'Governor', 'Level 1', 'Executive Leadership', 'Head of Organization', '👑', true, null),
('off-2', 'GWYNETH ALLYSON A. VILLALUZ', 'Vice Governor', 'Level 2', 'Associate Leadership', 'Executive Deputy', '⭐', false, null),
('off-3', 'ALTHEA T. MIGUEL', 'Secretary', 'Level 3', 'Secretariat & Finance', 'Records & Admin', '📝', false, null),
('off-4', 'JAIRAH MARIE DUMALAN', 'Treasurer', 'Level 3', 'Secretariat & Finance', 'Treasury & Finance', '💳', false, null),
('off-5', 'KATHLEEN ANIKA A. ROMERO', 'Auditor', 'Level 3', 'Secretariat & Finance', 'Audit & Oversight', '📊', false, null),
('off-6', 'Emjay M. Gallion', 'P.I.O. Internal', 'Level 4', 'Public Relations & Ambassadors', 'Internal Relations', '📢', false, null),
('off-7', 'Matthew A. Taguba', 'P.I.O. External', 'Level 4', 'Public Relations & Ambassadors', 'External Relations', '🌐', false, null),
('off-8', 'CHESKA B. AQUINO', 'Muse', 'Level 4', 'Public Relations & Ambassadors', 'Department Ambassador', '✨', false, null),
('off-9', 'Jeff R. Villareal', 'Escort', 'Level 4', 'Public Relations & Ambassadors', 'Department Ambassador', '✨', false, null),
('off-10', 'REGIE T MACARILAY', '1st Year Representative', 'Level 5', 'Year Level Representatives', '1st Year Batch', '🎓', false, null),
('off-11', 'JOHNWAYNE G. PRAGO', '2nd Year Representative', 'Level 5', 'Year Level Representatives', '2nd Year Batch', '🎓', false, null),
('off-12', 'JANZEN G. MARICABAN', '3rd Year Representative', 'Level 5', 'Year Level Representatives', '3rd Year Batch', '🎓', false, null),
('off-13', 'MARY JANE A. CASTILLO', '4th Year Representative', 'Level 5', 'Year Level Representatives', '4th Year Batch', '🎓', false, null)
on conflict (id) do update set
  name = excluded.name,
  position = excluded.position,
  tier_level = excluded.tier_level,
  tier_name = excluded.tier_name,
  role_tag = excluded.role_tag,
  icon = excluded.icon,
  is_governor = excluded.is_governor,
  photo = excluded.photo;
