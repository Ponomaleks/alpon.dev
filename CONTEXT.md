---
status: Living
updated_at: "2026-10-03"
---

# Domain Context — alpon.dev

## Glossary

- Dag — the light Fjord theme (stone background, ink text). NOT a time-of-day mode: it never switches by the clock.
- Fjord token — a named design value (color, font, space, radius, duration, easing, layout) that is the only allowed source of that value on the site. NOT a one-off value written directly in a page or component.
- Fjord — the design system of the site: tokens, type, motion and components from the Claude Design handoff, with the brand rules on top. NOT the brand pack alone; where the handoff and the brand rules disagree, the brand rules win.
- Flash of wrong theme — any rendered frame that shows a theme other than the one the page settles in. NOT a deliberate cross-fade when the Visitor switches theme.
- Interim surface — a part of the site that a feature knowingly ships unfinished because a later roadmap step owns it, named in that feature's spec together with the owning step. NOT a defect: review does not check an Interim surface against the design.
- Natt — the dark Fjord theme (spruce/ink surfaces, snow text). NOT a high-contrast or accessibility mode.
- No-JS Natt block — the copy of the Natt tokens that applies the dark theme when the device prefers dark and scripts are off, so no theme bootstrap could run. NOT a third theme: it is Natt, and with scripts on it never decides because the bootstrap always sets the theme.
- Not-found page — the "Ikke funnet" page shown for any address the site does not have. NOT a short link or redirect; those always resolve to a real target.
- Owner — Alexander, who builds, maintains and publishes the site from its repository. NOT a Visitor; the site has no admin interface or sign-in.
- Published project — a portfolio project that is ready to be presented on the site with its case study. NOT a project that exists only in another repository and is not yet presented.
- Recruiter — a Norwegian recruiter who scans the site, often on a phone, to learn within a minute who Alexander is, his role and location, and how to get the CV or contact him. NOT a Tech lead, who reads deeper.
- Residence — the place where Alexander lives, "Nittedal, Norge", shown in the footer "Based in" column, the CV and the home quick facts. NOT the Work region.
- Shell — the parts every page shares around its own content: skip link, header, mobile menu, closing call-to-action band, footer and sticky action bar. NOT page content; a page can leave a Shell part out only where its page design does.
- Sticky action bar — the two-action bar fixed to the bottom of the screen on phones ("View CV" and "Get in touch"). NOT the header call to action, and never shown on wider screens.
- Styleguide — the page that shows every Fjord component built so far in every state, in Dag and Natt, as the surface for visual and accessibility checks. NOT a page for Visitors: it is not linked from navigation and search engines are asked not to index it.
- Tech lead — a tech lead or hiring engineer who looks deeper at projects, case studies and the quality of the site itself. NOT a Recruiter, who only scans.
- Theme bootstrap — the single small script at the top of every page that applies a valid Theme choice, otherwise the device preference, before the first frame, and always leaves the page in Dag or Natt when scripts run. NOT the visible theme switch: it only reads the Theme choice and never saves one.
- Theme choice — the theme a Visitor explicitly picked, remembered only in their own browser. NOT the device color preference, which decides only when no Theme choice exists.
- Visitor — anyone who opens the site in a browser, without signing in; Recruiter and Tech lead are kinds of Visitor. NOT the Owner.
- Work region — the area where Alexander looks for work, "Oslo, Norge" / Oslo area, shown wherever a Recruiter reads location as a hiring fact (hero, contact block, contact card). NOT the Residence.

## Invariants

- Every color, font, space, radius, duration and easing on the site comes from a Fjord token.
- Every text and background pair is readable at WCAG 2.2 AA contrast in both Dag and Natt.
- No script runs on a page unless the site's security policy names it explicitly.
