import { contact } from './contact';
import { cvPdf } from './cv/index';
import type { IconName } from '../components/ui/Icon.astro';

// The Sticky action bar's pair (AC-34, ADR-0002). A BarAction has no style field: every
// action in the bar is secondary, so a primary button there cannot be written.
export interface BarAction {
  label: string;
  href: string;
  icon?: IconName;
  /** A string is the file name the browser saves the file under. */
  download?: boolean | string;
  /** Marks a label in another language than the page's (the Norwegian CV's own download). */
  lang?: 'no';
}

// The CV page's language switch in the bar (AC-19): the same two links as ui/LangSwitch.
export interface BarLangSwitch {
  kind: 'lang-switch';
  current: 'en' | 'no';
  /** Accessible name of the group, in the page language. */
  group: string;
  /** Marks a group name in another language than the bar's (the Norwegian CV page). */
  lang?: 'no';
  enHref: string;
  noHref: string;
}

/** One slot of the bar: a link or a language switch. Neither has a style field. */
export type BarSlot = BarAction | BarLangSwitch;

export const defaultBarActions: readonly [BarAction, BarAction] = [
  { label: 'View CV', href: contact.links.cv, icon: 'file-text' },
  {
    label: 'Save contact (.vcf)',
    href: '/alexander-ponomarenko.vcf',
    icon: 'user-plus',
    download: true,
  },
];

// The closing band's pair (AC-40, ADR-0002). A BandAction may be primary; the default is secondary.
export interface BandAction extends BarAction {
  variant?: 'primary' | 'secondary';
}

/** Pages other than home: "Get in touch" stays the one primary action, "Download CV" follows the language. */
export const defaultBandActions = (
  cvLang: 'en' | 'no' = 'en',
): readonly [BandAction, BandAction] => [
  { label: 'Get in touch', href: contact.links.contact, variant: 'primary' },
  { label: 'Download CV', href: cvPdf[cvLang].href, download: cvPdf[cvLang].downloadName },
];

/** Home: the band repeats no contact action (AC-40), so both actions are secondary downloads. */
export const homeBandActions = (cvLang: 'en' | 'no' = 'en'): readonly [BandAction, BandAction] => [
  { label: 'Save contact (.vcf)', href: '/alexander-ponomarenko.vcf', download: true },
  { label: 'Download CV', href: cvPdf[cvLang].href, download: true },
];
