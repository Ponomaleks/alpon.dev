---
status: Living
updated_at: "2026-10-02"
---

# Domain Context — alpon.dev

## Glossary

- Dag — the light Fjord theme (stone background, ink text). NOT a time-of-day mode: it never switches by the clock.
- Fjord — the design system of the site: tokens, type, motion and components from the Claude Design handoff, with the brand rules on top. NOT the brand pack alone; where the handoff and the brand rules disagree, the brand rules win.
- Fjord token — a named design value (color, font, space, radius, duration, easing, layout) that is the only allowed source of that value on the site. NOT a one-off value written directly in a page or component.
- Flash of wrong theme — any rendered frame that shows a theme other than the one the page settles in. NOT a deliberate cross-fade when the Visitor switches theme.
- Natt — the dark Fjord theme (spruce/ink surfaces, snow text). NOT a high-contrast or accessibility mode.
- Not-found page — the "Ikke funnet" page shown for any address the site does not have. NOT a short link or redirect; those always resolve to a real target.
- Owner — Alexander, who builds, maintains and publishes the site from its repository. NOT a Visitor; the site has no admin interface or sign-in.
- Published project — a portfolio project that is ready to be presented on the site with its case study. NOT a project that exists only in another repository and is not yet presented.
- Recruiter — a Norwegian recruiter who scans the site, often on a phone, to learn within a minute who Alexander is, his role and location, and how to get the CV or contact him. NOT a Tech lead, who reads deeper.
- Tech lead — a tech lead or hiring engineer who looks deeper at projects, case studies and the quality of the site itself. NOT a Recruiter, who only scans.
- Theme choice — the theme a Visitor explicitly picked, remembered only in their own browser. NOT the device color preference, which decides only when no Theme choice exists.
- Visitor — anyone who opens the site in a browser, without signing in; Recruiter and Tech lead are kinds of Visitor. NOT the Owner.

## Invariants

- Every color, font, space, radius, duration and easing on the site comes from a Fjord token.
- Every text and background pair is readable at WCAG 2.2 AA contrast in both Dag and Natt.
- No script runs on a page unless the site's security policy names it explicitly.
