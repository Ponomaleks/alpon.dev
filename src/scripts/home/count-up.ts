// Count-up of the key facts (AC-06, sad §8 Count-up). Each value counts once, from 0 to its
// final number, when the panel first comes into view. Under reduced motion or without
// IntersectionObserver nothing is written: the final numbers stay as printed.

export interface CountUpEnv {
  ObserverCtor:
    | (new (cb: (entries: { isIntersecting: boolean }[]) => void) => {
        observe(target: Element): void;
        disconnect(): void;
      })
    | null;
  reducedMotion: boolean;
  frame: (cb: (t: number) => void) => void;
}

const DURATION = 1200;

const easeOut = (p: number) => 1 - (1 - p) ** 3;

export function initCountUp(root: Element, env: CountUpEnv): void {
  if (env.reducedMotion || !env.ObserverCtor) return;

  const targets = [...root.querySelectorAll('[data-count-to]')].map((el) => ({
    el,
    to: Number(el.getAttribute('data-count-to')),
    prefix: el.getAttribute('data-prefix') ?? '',
    suffix: el.getAttribute('data-suffix') ?? '',
  }));
  let started = false;

  const observer = new env.ObserverCtor((entries) => {
    if (started || !entries.some((e) => e.isIntersecting)) return;
    started = true;
    observer.disconnect();

    let t0: number | undefined;
    const step = (t: number) => {
      t0 ??= t;
      const p = Math.min((t - t0) / DURATION, 1);
      for (const { el, to, prefix, suffix } of targets) {
        el.textContent = `${prefix}${p >= 1 ? to : Math.floor(to * easeOut(p))}${suffix}`;
      }
      if (p < 1) env.frame(step);
    };
    root.setAttribute('data-count-state', 'counting');
    env.frame(step);
  });
  observer.observe(root);
}
