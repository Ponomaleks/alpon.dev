// The two Legacy CV addresses of the home page and the CV pages they hand over to (AC-13, AC-14).
// An exact map: any other fragment, crafted or not, maps to nothing.
import { contact } from '../../data/contact';

const TARGETS: Readonly<Record<string, string>> = {
  '#cv': contact.links.cvPages.en,
  '#cv-no': contact.links.cvPages.no,
};

export function legacyCvTarget(hash: string): string | null {
  return Object.hasOwn(TARGETS, hash) ? TARGETS[hash] : null;
}
