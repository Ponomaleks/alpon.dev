import * as React from 'react';

/** Text-only recommendation card: real quote, name, role, link to the LinkedIn source. No stars, no avatars. */
export interface TestimonialProps {
  quote: string;
  name: string;
  role?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export declare function Testimonial(props: TestimonialProps): React.JSX.Element | null;
