export const DEFAULT_TIERS = [
  { tierLevel: "Level 1", tierName: "Executive Leadership" },
  { tierLevel: "Level 2", tierName: "Associate Leadership" },
  { tierLevel: "Level 3", tierName: "Secretariat & Finance" },
  { tierLevel: "Level 4", tierName: "Public Relations & Ambassadors" },
  { tierLevel: "Level 5", tierName: "Year Level Representatives" },
];

export const DEFAULT_OFFICERS = [
  {
    id: "off-1",
    name: "KRIEXA ANGELA A. LAMAN",
    position: "Governor",
    tierLevel: "Level 1",
    tierName: "Executive Leadership",
    roleTag: "Head of Organization",
    isGovernor: true,
    icon: "👑",
  },
  {
    id: "off-2",
    name: "GWYNETH ALLYSON A. VILLALUZ",
    position: "Vice Governor",
    tierLevel: "Level 2",
    tierName: "Associate Leadership",
    roleTag: "Executive Deputy",
    isGovernor: false,
    icon: "⭐",
  },
  {
    id: "off-3",
    name: "ALTHEA T. MIGUEL",
    position: "Secretary",
    tierLevel: "Level 3",
    tierName: "Secretariat & Finance",
    roleTag: "Records & Admin",
    isGovernor: false,
    icon: "📝",
  },
  {
    id: "off-4",
    name: "JAIRAH MARIE DUMALAN",
    position: "Treasurer",
    tierLevel: "Level 3",
    tierName: "Secretariat & Finance",
    roleTag: "Treasury & Finance",
    isGovernor: false,
    icon: "💳",
  },
  {
    id: "off-5",
    name: "KATHLEEN ANIKA A. ROMERO",
    position: "Auditor",
    tierLevel: "Level 3",
    tierName: "Secretariat & Finance",
    roleTag: "Audit & Oversight",
    isGovernor: false,
    icon: "📊",
  },
  {
    id: "off-6",
    name: "Emjay M. Gallion",
    position: "P.I.O. Internal",
    tierLevel: "Level 4",
    tierName: "Public Relations & Ambassadors",
    roleTag: "Internal Relations",
    isGovernor: false,
    icon: "📢",
  },
  {
    id: "off-7",
    name: "Matthew A. Taguba",
    position: "P.I.O. External",
    tierLevel: "Level 4",
    tierName: "Public Relations & Ambassadors",
    roleTag: "External Relations",
    isGovernor: false,
    icon: "🌐",
  },
  {
    id: "off-8",
    name: "CHESKA B. AQUINO",
    position: "Muse",
    tierLevel: "Level 4",
    tierName: "Public Relations & Ambassadors",
    roleTag: "Department Ambassador",
    isGovernor: false,
    icon: "✨",
  },
  {
    id: "off-9",
    name: "Jeff R. Villareal",
    position: "Escort",
    tierLevel: "Level 4",
    tierName: "Public Relations & Ambassadors",
    roleTag: "Department Ambassador",
    isGovernor: false,
    icon: "✨",
  },
  {
    id: "off-10",
    name: "REGIE T MACARILAY",
    position: "1st Year Representative",
    tierLevel: "Level 5",
    tierName: "Year Level Representatives",
    roleTag: "1st Year Batch",
    isGovernor: false,
    icon: "🎓",
  },
  {
    id: "off-11",
    name: "JOHNWAYNE G. PRAGO",
    position: "2nd Year Representative",
    tierLevel: "Level 5",
    tierName: "Year Level Representatives",
    roleTag: "2nd Year Batch",
    isGovernor: false,
    icon: "🎓",
  },
  {
    id: "off-12",
    name: "JANZEN G. MARICABAN",
    position: "3rd Year Representative",
    tierLevel: "Level 5",
    tierName: "Year Level Representatives",
    roleTag: "3rd Year Batch",
    isGovernor: false,
    icon: "🎓",
  },
  {
    id: "off-13",
    name: "MARY JANE A. CASTILLO",
    position: "4th Year Representative",
    tierLevel: "Level 5",
    tierName: "Year Level Representatives",
    roleTag: "4th Year Batch",
    isGovernor: false,
    icon: "🎓",
  },
];

export function groupOfficersByTier(officersList) {
  const tierOrder = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
  const grouped = [];

  // Group known tiers first in logical order
  tierOrder.forEach((level) => {
    const matched = officersList.filter((o) => o.tierLevel === level);
    if (matched.length > 0) {
      grouped.push({
        tierLevel: level,
        tierName: matched[0].tierName || DEFAULT_TIERS.find((t) => t.tierLevel === level)?.tierName || level,
        officers: matched,
      });
    }
  });

  // Handle any custom tiers
  const otherTiers = Array.from(new Set(officersList.filter((o) => !tierOrder.includes(o.tierLevel)).map((o) => o.tierLevel)));
  otherTiers.forEach((level) => {
    const matched = officersList.filter((o) => o.tierLevel === level);
    if (matched.length > 0) {
      grouped.push({
        tierLevel: level,
        tierName: matched[0].tierName || level,
        officers: matched,
      });
    }
  });

  return grouped;
}

export default DEFAULT_OFFICERS;
