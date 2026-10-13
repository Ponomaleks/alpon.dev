// Toast as a pure function of its environment (AC-30, AC-28; sad §8 Toast). Any script shows a
// Toast by dispatching `fjord:toast` on document with { message, meta?, lang? }. The document and
// the duration are injected; the Toast.astro <script> only passes the real ones.

export interface ToastDetail {
  message?: string;
  meta?: string;
  lang?: string;
  /** Optional decorative icon shown before the message. Only "check" is known. */
  icon?: string;
}

interface ToastNode {
  setAttribute(name: string, value: string): void;
  append(...nodes: ToastNode[]): void;
  replaceChildren(...nodes: ToastNode[]): void;
  textContent: string | null;
}

interface ToastDocument {
  addEventListener(type: 'fjord:toast', listener: (event: { detail?: ToastDetail }) => void): void;
  querySelector(selector: string): ToastNode | null;
  createElement(tag: string): ToastNode;
}

export interface ToastEnv {
  document: ToastDocument;
  /** The Toast duration token, in milliseconds. */
  duration: number;
}

export function initToast({ document: doc, duration }: ToastEnv): void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  doc.addEventListener('fjord:toast', (event) => {
    const { message, meta, lang, icon } = event.detail ?? {};
    const region = doc.querySelector('[role="status"]');
    if (!message || !region) return;

    const toast = doc.createElement('span');
    toast.setAttribute('class', 'toast');

    if (icon === 'check') toast.setAttribute('data-icon', 'check');

    const text = doc.createElement('span');
    text.textContent = message;
    if (lang) text.setAttribute('lang', lang);
    toast.append(text);

    if (meta) {
      const metaNode = doc.createElement('span');
      metaNode.setAttribute('class', 'toast__meta');
      metaNode.textContent = meta;
      toast.append(metaNode);
    }

    region.replaceChildren(toast);
    clearTimeout(timer);
    timer = setTimeout(() => region.replaceChildren(), duration);
  });
}
