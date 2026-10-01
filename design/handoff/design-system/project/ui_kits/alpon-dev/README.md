# alpon.dev — UI kit

Click-through recreation of the personal site built on Fjord components.

- `index.html` — the app (hash router). Screens: Home `#/`, Projects `#/projects`, Case study `#/projects/<slug>`, CV `#/cv` (EN/NO switch), Contact `#/contact`, 404 (any other hash).
- `mobile.html` — two 390px frames of the same app.
- `App.jsx` — shell: Header, MobileMenu, CommandPalette (Ctrl/Cmd+K), ToastRegion, StickyActionBar, CtaBand, Footer, theme (Light/Dark, persisted in localStorage `fjord-theme`).
- `Home.jsx`, `Projects.jsx`, `CaseStudy.jsx`, `Cv.jsx`, `Contact.jsx` (+ `Lost` 404) — one screen each.
- `data.js` — content. **Projects, metrics, case-study text and CV details are placeholders**; name, role, contacts and "4 yrs · EPAM Systems" are real.
- `kit.css` — page layout only; all visual styling comes from `styles.css`.

Try: copy the email (toast "Copied"), filter projects to "Client work" (empty state), open a project (trail fills as you scroll), switch CV to NO, press Ctrl/Cmd+K, switch to the dark theme.
