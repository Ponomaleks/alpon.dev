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
