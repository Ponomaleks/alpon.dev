// The "Print" button of the CV head (AC-11, sad §8 Script-only controls): it asks the browser to
// print. The button is behind `data-needs-script`, so it is shown only where this script runs.

export interface PrintOptions {
  document: {
    querySelector(
      selector: string,
    ): { addEventListener(type: 'click', l: () => void): void } | null;
  };
  print: () => void;
}

export function initPrint({ document, print }: PrintOptions): void {
  document.querySelector('[data-print]')?.addEventListener('click', () => print());
}
