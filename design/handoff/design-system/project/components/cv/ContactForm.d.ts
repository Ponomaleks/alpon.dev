import * as React from 'react';

/**
 * Short contact form (name, email, message) with validation, sending, success and error states.
 */
export interface ContactFormProps {
  onSubmit?: (v: { name: string;
  email: string;
  message: string }) => Promise<any>;
  status?: "idle" | "sending" | "success" | "error";
  initial?: { name?: string;
  email?: string;
  message?: string };
  className?: string;
}

export declare function ContactForm(props: ContactFormProps): React.JSX.Element | null;
