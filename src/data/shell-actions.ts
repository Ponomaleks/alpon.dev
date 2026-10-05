import { contact } from './contact';
import type { IconName } from '../components/ui/Icon.astro';

// The Sticky action bar's pair (AC-34, ADR-0002). A BarAction has no style field: every
// action in the bar is secondary, so a primary button there cannot be written.
export interface BarAction {
  label: string;
  href: string;
  icon?: IconName;
  download?: boolean;
}

export const defaultBarActions: readonly [BarAction, BarAction] = [
  { label: 'View CV', href: contact.links.cv, icon: 'file-text' },
  {
    label: 'Save contact (.vcf)',
    href: '/alexander-ponomarenko.vcf',
    icon: 'download',
    download: true,
  },
];

// The closing band's pair (AC-40, ADR-0002). A BandAction may be primary; the default is secondary.
export interface BandAction extends BarAction {
  variant?: 'primary' | 'secondary';
}

const cvHref = (cvLang: 'en' | 'no') => (cvLang === 'no' ? contact.links.cvNo : contact.links.cvEn);

/** Pages other than home: "Get in touch" stays the one primary action, "Download CV" follows the language. */
export const defaultBandActions = (
  cvLang: 'en' | 'no' = 'en',
): readonly [BandAction, BandAction] => [
  { label: 'Get in touch', href: contact.links.contact, variant: 'primary' },
  { label: 'Download CV', href: cvHref(cvLang), download: true },
];

/** Home: the band repeats no contact action (AC-40), so both actions are secondary downloads. */
export const homeBandActions = (cvLang: 'en' | 'no' = 'en'): readonly [BandAction, BandAction] => [
  { label: 'Save contact (.vcf)', href: '/alexander-ponomarenko.vcf', download: true },
  { label: 'Download CV', href: cvHref(cvLang), download: true },
];
