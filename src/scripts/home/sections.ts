// Section numbers for the home page, counted from the sections that are rendered.
// Order follows the design: About, Selected projects, Experience, Recommendations, Contact.

export interface SectionFlags {
  projects: boolean;
  recommendations: boolean;
}

export interface SectionNumbers {
  about: string;
  projects?: string;
  experience: string;
  recommendations?: string;
  contact: string;
}

export function numberSections({ projects, recommendations }: SectionFlags): SectionNumbers {
  let n = 0;
  const next = () => String(++n).padStart(2, '0');
  const about = next();
  const projectsNo = projects ? next() : undefined;
  const experience = next();
  const recommendationsNo = recommendations ? next() : undefined;
  const contact = next();
  return {
    about,
    ...(projectsNo && { projects: projectsNo }),
    experience,
    ...(recommendationsNo && { recommendations: recommendationsNo }),
    contact,
  };
}
