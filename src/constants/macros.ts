export const MACROS = [
  { key: 'protein', label: 'Protein', icon: 'flame', color: '#F4685C' },
  { key: 'carbs', label: 'Carbs', icon: 'leaf', color: '#F0A424' },
  { key: 'fat', label: 'Fat', icon: 'water', color: '#F7C948' },
] as const;

export type MacroKey = (typeof MACROS)[number]['key'];
