export const ATTENDANCE_STATUSES = [
  { value: 'PRESENT', label: 'Present', color: 'text-green-600 bg-green-50' },
  { value: 'ABSENT', label: 'Absent', color: 'text-red-600 bg-red-50' },
  { value: 'LATE', label: 'Late', color: 'text-yellow-600 bg-yellow-50' },
] as const;

export const ROLES = [
  { value: 'SPONSOR', label: 'Sponsor' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
] as const;

export const CHART_COLORS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
];
