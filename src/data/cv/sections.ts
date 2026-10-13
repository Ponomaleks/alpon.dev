// The eight shared section ids, in order (sad §5, ADR-0001). The Norwegian CV may omit some.
export const cvSectionIds = [
  'profile',
  'skills',
  'languages',
  'experience',
  'projects',
  'education',
  'courses',
  'community',
] as const;

export type CvSectionId = (typeof cvSectionIds)[number];
