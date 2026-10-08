---
status: approved         # draft | approved
feature_size: "S"
tool: "code"             # copied from docs/design-system.md
updated_at: "2026-10-05"
---

# Screens — home

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw design files.

## Source

- **Tool:** code (from `docs/design-system.md`).
- **File:** inline wireframes below.
- **Page designs (primary reference):**
  - SCR-01: `design/handoff/site/project/site/Home.jsx` (`Home`), with `App.jsx` (header over the hero, reveal), `ext.jsx` (`QuickFacts`, `ShotCard`), `data.js` (copy) and `site.css` (`.x-hero*`, `.x-orb`, `.x-facts*`, `.x-intro`, `.x-quick`, `.x-split`, `.x-grid2`, `.x-qr`, `.x-end`). Screenshots `design/screenshots/{dag,natt}_home.png` (1440). For 390 and 834, and for anything the screenshots do not show, use `design/handoff/site/alpon.dev standalone.html`.
  - SCR-02 and SCR-03: unchanged page designs, see `docs/features/base-components/screens.md` §Source.
  - SCR-04 has no page design: it is an Owner page.
- **Component references (secondary, building blocks):** the site copy of the design system, `design/handoff/site/project/_ds/…/components/{brand,content,cv,navigation}/*.css`. Where it differs from `design/handoff/design-system/`, the site copy is used (`CLAUDE.md` Sources of truth).
- **Inventory:** `docs/design-system.md` §Component inventory. The manifest uses inventory names. Where the repo file gets a different name (sad.md §5), it is given once here:

  | Inventory name | Repo component (sad.md §5) |
  |---|---|
  | Portrait | `home/Portrait` |
  | IconButton (as the Motion control) | `home/MotionControl` |
  | Stat (row of four, with `countUp`) | `ui/Stat` inside `home/KeyFacts` |
  | ExperienceItem / ExperienceList | `home/ExperienceList` |
  | Testimonial | inside `home/Recommendations` |
  | ProjectCard | `home/ProjectCard` inside `home/SelectedProjects` |
  | ContactList, CopyButton | inside `home/ContactBlock` |
  | QrTile | `brand/QrTile` |
  | Link | `ui/Link` |
  | Badge | `ui/Badge` (availability and status variants) |
  | MobileBar (Sticky action bar) | `layout/MobileBar` |

  `home/Hero`, `home/KeyFacts`, `home/About`, `home/Recommendations`, `home/SelectedProjects` and `home/ContactBlock` are page sections: compositions of the names above, not inventory components.
- **Base manifest:** `docs/features/base-components/screens.md`. Its §Shell states and its SCR-02, SCR-03 and SCR-04 sections stay valid except where §Shell state changes and the screen sections below replace a row. Rows are cited by state name and are not copied.
- **Differences from the page design** are not repeated here; they are spec §1.2 IS-01 to IS-03 and §1.3 D-01 to D-14 and are cited by ID.
- **Derivation:** there is no API contract (static site, sad.md §6 "Flagged by the flows" item 4), so every state below comes from a spec §5 AC or a sad.md §6 branch. Confirmed per screen with the Owner on 2026-10-05, together with the decisions in §Decided at this stage; approved by the Owner the same day.

### Shell state changes (apply to SCR-01, SCR-02 and SCR-04)

These rows replace or add to §Shell states of the base manifest. Every other Shell state there is unchanged.

| State | Trigger / condition | What the Visitor sees | Components | Source |
|---|---|---|---|---|
| header-cta-primary (replaces the base row) | Every page, every width, outside the over-hero states of SCR-01 | Header "Get in touch" is filled. It no longer depends on the bar | Header, Button (primary) | AC-33, AC-34, D-14 |
| header-cta-secondary (replaces the base row) | Only the over-hero states of SCR-01 at 768 and wider, or `headerCta: 'secondary'` | Header "Get in touch" is outlined | Header, Button (secondary) | AC-33, D-14 |
| bar-open (replaces `bar-on-screen`) | Below 768, the page has not left the bar out | Bar fixed to the bottom with the page's two actions, both secondary; default pair "View CV" (file icon) and "Save contact (.vcf)" (`download`). A 44 × 44 tab with a chevron pointing down stands on the bar's top edge at the right. No primary button in the bar on any page | MobileBar, Button ×2 (secondary), Icon (`file-text`, `chevron-down`) | AC-38, AC-39, D-10, D-11; wireframe S-7 |
| bar-collapsed (new) | The Visitor activates the tab, by touch or keyboard, with scripts on or off | The two actions are gone; the tab remains in the bottom right corner, chevron pointing up, with a 12 px strip of the panel under it. With motion allowed the panel and the tab slide there. The platform announces the collapsed state. Scrolling never brings the bar back. With reduced motion the change is instant | MobileBar (tab only), Icon (`chevron-up`) | AC-39; sad.md §6 Sticky action bar, branch `the arrow tab`; wireframe S-7 |
| bar-restored (new) | The Visitor activates the tab of a collapsed bar | bar-open again; from now on it behaves like a bar that was never collapsed, so bar-away and bar-returned apply again | MobileBar | AC-39; ux-flows "Design input, decided" |
| bar-away / bar-returned (narrowed) | Scripts on, motion allowed, the bar is **not** collapsed | As in the base manifest (G-4, G-5), the tab leaves and returns with the bar. The header action does not change with it | MobileBar | AC-39, D-14 |
| bar-static | Scripts off, or reduced motion | The bar stays in place; the tab still collapses and restores it | MobileBar | AC-39 |
| bar after back/forward | The browser restores the page from its back/forward cache | The bar keeps the state the page had; a reload or a new navigation shows bar-open | MobileBar | sad.md §6 "Flagged by the flows" item 2 |
| bar clearance (replaces the clearance of `bar-on-screen`) | Below 768, bar-open or bar-collapsed | The space kept free at the end of the page, `scroll-padding-bottom` and the Toast offset are counted from the **top of the tab**: bar height plus tab height plus a gap when open (128 px at 390), tab height plus the visible strip plus a gap when collapsed (72 px). This block is the only reserve; the footer adds none. `scroll-padding-bottom` applies in both states, so a focused element anywhere on the page is scrolled clear of the tab, not only at the end of the page. The bar and the collapsed tab sit above `env(safe-area-inset-bottom)` | MobileBar, BaseLayout | AC-39; sad.md §8 Bar clearance and Toast offset; T-1 |
| toast-shown (extended) | A script dispatches `fjord:toast` | As in the base manifest, plus an optional check icon before the message. Below 768 it sits above the tab in both bar states | Toast, Icon (`check`) | AC-14; B-25; wireframe S-7 |
| cta-band (extended) | The page has not left the band out | The two actions come from the page. Default pair: primary "Get in touch", secondary "Download CV". The band has the design's top margin (B-18). Its contours shift only while the Visitor scrolls, where scroll-tied motion is supported and motion is allowed, with scripts on or off; still otherwise | CtaBand, Contours, Button ×2 | AC-40, AC-41, D-12, D-13 |
| main min height | Every page | `main` is at least 60 % of the viewport high and shows no outline when focused | BaseLayout | B-18 |

```text
S-7  Sticky action bar at 390 — bar-open, bar-collapsed, Toast above the tab (T-1)

bar-open                                  bar-collapsed
+--------------------------------------+  +--------------------------------------+
|   page content                       |  |   page content                       |
|        ( ✓ Copied   address )        |  |                                      |
|                               +----+ |  |        ( ✓ Copied   address )        |
|                               | ⌄  | |  |                               +----+ |
+===============================+    +=+  |                               | ⌃  | |
| [ ▤ View CV     ] [ ⇩ Save contact ] |  +-------------------------------+----+-+
+--------------------------------------+     safe-area inset below the tab
   safe-area inset below the buttons
  tab: 44 × 44, same background and border as the bar, no border where it meets the bar
  summary of a native <details open>; one fixed accessible name "Quick actions" (T-4),
  the native details state announces expanded or collapsed
  both buttons secondary, 1fr 1fr, full width as before
```

## Screens

### SCR-01 — Home page

The whole page design, content first. Page options: `headerOverHero: true`, `ctaBandActions` = "Save contact (.vcf)" and "Download CV" (both secondary), `structuredData` = the Person object; the bar keeps its default pair. Sections in order: hero, key facts, About 01, Experience 02, Recommendations 03 (only with an agreed quote), Contact (03 or 04), closing band, footer. Visual baseline per section at 390 / 834 / 1440 × Dag / Natt with motion off; Design match compares with `design/screenshots/{dag,natt}_home.png`, differences limited to IS-01 to IS-03 and D-01 to D-14.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | Direct visit to `/`, the wordmark, "Back to home" on SCR-02, scripts on, motion allowed, Dag or Natt | BaseLayout, SkipLink, Header (over-hero), hero (Badge, `h1`, Button, Portrait, IconButton, Contours), Stat ×4, SectionHeader, NEW: QuickFacts, ExperienceList, ContactList, CopyButton, Button, QrTile (from 1024), Link, CtaBand, Footer, MobileBar (below 768), Toast region | wireframes H-1, H-2 |
| hero, below 768 | Screen below 768, not scrolled | At 390 × 844 all of this lies inside the first screen: Badge "Open to work" with "Oslo area"; eyebrow "Hei." / "Oslo, Norge" (both `lang="no"`) with 59.91° N, 10.75° E; `h1` "Alexander Ponomarenko"; roles "Software Engineer" and "Full Stack Developer"; lead "Good products are built together."; one primary "View CV" (large, file icon, full width); the Now line. The portrait (200 wide) follows under the text. Bar: bar-open | AC-01; H-1 |
| hero, 768 to 1023 | Screen 768 to 1023 | Same content, "View CV" at its own width, portrait 260 wide under the text, no bar | AC-02; sad.md §6 First view, branch `screen 768 to 1023` |
| hero, 1024 and wider | Screen at least 1024 | Text 7 parts, portrait 5 parts at the end side, up to 340 wide, aligned to the bottom of the text | AC-02; H-2 |
| hero, Dag / Natt | Theme | Dag: hero on spruce, corner contours bottom right in the spruce tone. Natt: hero on the night ground with a bottom border; the first role and the Now dot in the link colour | page design `.x-hero--natt` |
| portrait | Always | Round frame with a strong border and a soft ring, announced as an image named "Alexander Ponomarenko"; width and height reserved, so nothing shifts when it loads; not lazy-loaded. AVIF and WebP at 340 and 680 | Portrait; AC-02; sad.md §8 Portrait |
| now-line, with project | The Owner supplied `nowProject` | Dot, "Nå:" (`lang="no"`), the project, " · MSc Computer Science at Woolf University" | AC-03 |
| now-line, without project | No `nowProject` | Dot, "Nå:", then only "MSc Computer Science at Woolf University". No square brackets in either state | AC-03, D-06 |
| hero actions, no projects | `features.projects` is false (this feature) | "View CV" stands alone; "See projects" is not rendered | AC-04, D-05 |
| hero actions, with projects | N/A: owned by step 7 | — | AC-04 |
| header over-hero, Dag | Scripts on, Dag, the hero reaches below the header | Header on spruce, no border, light wordmark and links. "Get in touch": primary on spruce below 768, secondary on spruce from 768 | AC-33; ADR-0001; sad.md §6 Critical flow 1 |
| header after the hero, Dag | Same, the hero has left the area under the header | Default header and its border together; "Get in touch" primary. Reverses on the way back | AC-33 |
| header at the top, Natt | Scripts on, Natt, page at its top | Usual header colours, no border. "Get in touch": secondary from 768, primary below 768 | AC-33 |
| header scrolled over the hero, Natt | Same, scrolled from the top, hero still under the header | The border appears; colours and "Get in touch" stay | AC-33 |
| header after the hero, Natt | Same, the hero has left | "Get in touch" primary at every width | AC-33 |
| header on return | Back button or reload at a scrolled position | The header has the state of that position at once | AC-33; sad.md §6 Critical flow 1 `checks the hero position at start and on pageshow` |
| header, scripts off | Scripts off | Default header, primary "Get in touch" throughout, no scroll border | AC-33, D-08 |
| motion running | Scripts on, motion allowed, no saved pause | Hero contours drift and the portrait floats. Motion control shows the pause icon, name "Pause animation", `aria-pressed="false"` | IconButton, Icon (`pause`); AC-30; ADR-0003; H-1 |
| motion paused | The Visitor activates the control, or a pause was saved earlier in this browser session | Both stop where they are within 100 ms. Control shows the play icon, name "Play animation", `aria-pressed="true"`. Activating it again returns to motion running | IconButton, Icon (`play`); AC-30 |
| motion choice kept / not kept | Site storage available / blocked | Kept for the browser session on the home page, gone on a new visit / kept for this page view only. **No error UI** | AC-30; sad.md §6 Critical flow 2 `else storage blocked` |
| motion absent | Reduced motion, scripts off, or the page script did not load | Nothing loops and the Motion control is not displayed. Its place is reserved, so nothing shifts between the states (T-5) | AC-31, AC-32, D-02 |
| hero parallax | Fine pointer with hover, motion allowed, scripts on | The hero contours follow the pointer a little. Not on touch screens, not with reduced motion, not governed by the Motion control | sad.md §8 Hero parallax; AC-31 |
| key facts | Below the hero | A raised panel overlapping the lower edge of the hero with four Stat items: value, label, context line. Two columns below 1024, four from 1024. Each value is in the page as its final number | Stat ×4; AC-05; H-1, H-2 |
| key facts counting | Scripts on, motion allowed, the panel first comes into view | Each value counts up once and stops; widths are reserved so nothing around it moves; assistive technology reads the final number only | Stat (`countUp`); AC-06 |
| key facts static | Scripts off, reduced motion, or the page script did not load | Final numbers are simply shown | Stat; AC-06, AC-31 |
| about | Always | SectionHeader "01 / About", "Frontend-focused, full stack.", the introduction paragraph, and QuickFacts with four rows: "Based in" (Nittedal, Oslo area · Norwegian work permit), "Focus", "Stack" as plain text, "Languages" with plain labels and no level codes, one language per line (spec D-16). One column below 1024, 7 / 5 from 1024 | SectionHeader, NEW: QuickFacts; AC-07 |
| experience, on arrival | Always | SectionHeader "02 / Experience", "Where I’ve worked", Link "Full CV" (standalone, with the arrow) to the CV address (IS-01). Four entries on a timeline rail, each always showing period, note, role and organisation: one column with the period above the heading below 768 and from 1024, the period in a 160 px column from 768 to 1023 (spec D-17); heading 7 parts, list 5 parts from 1024; the first is open, the other three closed; the most recent has the filled marker | SectionHeader, Link, ExperienceList / ExperienceItem, Tag; AC-08 |
| experience entry open / closed | Pointer or keyboard on an entry's heading, scripts on or off | That entry shows or hides its summary, points and technology tags; the chevron turns; the platform announces the state; the other entries stay as they are. An entry with no points or no tags shows no empty list. Native `<details>` | ExperienceItem, Tag, Icon (`chevron-down`); AC-08 |
| recommendations, present | At least one Recommendation with consent in the content | SectionHeader "03 / Recommendations", "From people I’ve worked with". Each Testimonial: the quote word for word, closed to three lines with "Show more" when longer (D-19), name, role, Link "On LinkedIn" (new tab, D-09) when it comes from LinkedIn (D-21). Two columns from 768; with more cards than columns a carousel that goes round, with previous and next IconButtons and swipe (D-20). Contact is 04 | SectionHeader, Testimonial, Link, IconButton; AC-09, AC-42, AC-43, D-09 |
| recommendations, absent (empty) | No Recommendation with consent | The section is not rendered. Contact is 03, numbers have no gap. No empty-state block | AC-10; design-system "Empty states" |
| selected projects | N/A: Dormant section, not rendered on this page until step 7; no "All projects" link, no gap in the numbers. Shown on SCR-04 only | — | AC-11, D-05 |
| contact | Always; also the target `/#contact` | Section `id="contact"`. SectionHeader with the next number, "Contact", "Get in touch", lead "Email is fastest. Phone and LinkedIn work too.". ContactList rows: Email (mail link), Phone (call link), LinkedIn and GitHub (short addresses, same tab), Region "Oslo, Norge" (`lang="no"`, spec D-15); the values are mono, in the text colour, underlined only on hover; below 768 the label column is 60 px with tighter gaps so that the email address stays on one line down to 360, from 768 it is the design's 88 px. Under it Button "Save contact (.vcf)" (secondary, `download`, icon `user-plus`). Beside it from 1024, under it below: the mail-link sentence. No primary button in this section | SectionHeader, ContactList, Button (secondary), Link; AC-13, AC-16, AC-34, D-03; H-3 |
| contact arrived by link | "Contact" or "Get in touch" in the header or SCR-03, from this page or another | The heading is in view below the header, SCR-03 is closed, keyboard focus is at the section. The section is shown at once, never faded in | AC-18, AC-36; sad.md §6 Reach the contact place |
| mail-link sentence (interim) | Always, scripts on or off | Where the page design draws the Message form: one sentence, "Hiring? A short email about the role is the quickest way to reach me.", where "a short email" is the mail link. Its address comes from `src/data/contact.ts` and is not shown as text, since the ContactList beside it shows it (T-6) | Link; IS-03, AC-27 |
| qr shown | Screen at least 1024 | QrTile for the current theme, 132 wide, caption "Skann meg" (`lang="no"`) under the tile inside the figure, text alternative, and beside the figure the hint "Point your phone’s camera here to open my contact card." | QrTile; AC-17; H-3 |
| qr hidden | Screen below 1024 | No tile and no hint | AC-17 |
| copy offered | Scripts on | "Copy" with the copy icon at the right end of the email row: the design's 32 px control inside a 44 × 44 target (spec D-18) | `ui/CopyButton`, Icon (`copy`); AC-14 |
| copy success | The browser allows the clipboard write | Toast with the check icon: "Copied" and the address, in English; announced, leaves by itself; above the tab below 768. The "Copy" control shows "Copied" (success colour, no icon) for the copied duration and returns to "Copy"; same size, same name (spec D-18) | CopyButton (done state), Toast, Icon (`check`); AC-14 |
| copy refused (error) | The browser refuses or has no clipboard access | Toast without the check icon, in English: "Couldn't copy. Select the address to copy it." No confirmation. The address stays a selectable mail link | CopyButton, Toast; AC-15; sad.md §6 "Flagged by the flows" item 1 |
| copy not offered | Scripts off, or the page script did not load | "Copy" is not displayed and leaves no gap; the address stays a selectable mail link | AC-15, AC-32 |
| closing band, home | End of the page, right under the contact section | CtaBand with "Save contact (.vcf)" and "Download CV" (English PDF), both secondary, `download`; no "Get in touch". Contours as in §Shell state changes `cta-band` | CtaBand, Button ×2 (secondary); AC-40, AC-41, D-12; H-3 |
| section reveal | Scripts on, motion allowed, a section below the hero is outside the viewport at start and scrolls into view | It fades in once and stays. A section in view at start, or the target of the address fragment, is shown at once | AC-36, D-04 |
| primary count | Any scroll position, 390 / 834 / 1440 | At most two primary buttons on the visible screen: the header's "Get in touch" and, at the top, "View CV". None from page content over the contact section or at the end | AC-34 |
| no-script | Scripts off | Every section visible and readable; every Contact block link and "Save contact" work; experience entries open; the bar collapses; default header. Not displayed: Motion control, "Copy", theme switch, menu button. No Ambient motion, no count-up, no reveal, no parallax | AC-32; base manifest `no-script` |
| reduced-motion | `prefers-reduced-motion: reduce` | motion absent, key facts static, sections shown at once, no parallax, the band is still; experience entries, the bar and the Toast change instantly or with a fade | AC-31 |
| Shell states | Base manifest §Shell states with §Shell state changes above | as there | S-7 |
| interactive states | Hover, focus, pressed on any control of the page content | As base manifest `interactive states`; every target at least 44 × 44 at 390 | spec §6 Touch targets |
| loading | N/A: static HTML, no client data fetch. The portrait loads into reserved space | — | repo ADR-0001 |
| validation | N/A: the page takes no input; the Message form is step 12 | — | IS-03 |
| error (page level) | N/A: the only run-time failures are copy refused (above) and blocked storage (silent). A placeholder or a contact mismatch fails the build, it is never rendered | — | AC-27, AC-28; sad.md §8 Error handling |

**Content.** Copy comes from `design/handoff/site/project/site/data.js` (`person`, `facts`, `intro`, `quick`, `timeline`) and `Home.jsx`, through `src/data/home.ts` and `src/data/contact.ts`. The design copy is used as it is. Every number and status is ticked by the Owner in the Claims list (AC-29).

```text
H-1  SCR-01 at 390 × 844 — first screen, Dag, motion running
+--------------------------------------+
| alpon.dev        [ Get in touch ] [≡]|  header on spruce, no border, primary
|██████████████████████████████████████|
|█ (● Open to work · Oslo area)   [⏸] █|  Badge; Motion control 44 × 44, place reserved (T-5)
|█ Hei. / Oslo, Norge · 59.91° N, …   █|  eyebrow, mono
|█ Alexander                          █|
|█ Ponomarenko                  (h1)  █|
|█ Software Engineer                  █|
|█ Full Stack Developer               █|
|█ Good products are built together.  █|
|█ [ ▤ View CV                      ] █|  primary, large, full width
|█ ● Nå: MSc Computer Science at …    █|  Now line
|█                              +----+█|
+===============================+ ⌄  +=+  bar-open (S-7)
| [ ▤ View CV     ] [ ⇩ Save contact ] |
+--------------------------------------+
  below the fold, in order:
  |█  ( portrait, round, 200 )  ~contours~ █|
  | +--------------------------------+ |  key facts panel overlaps the hero edge
  | | 3+ yrs         | ~40           | |  2 × 2 below 1024
  | | ~2 000         | 100+          | |
  | +--------------------------------+ |
  | 01 / About   Frontend-focused, full stack.   intro   QuickFacts (4 rows)
  | 02 / Experience   Where I’ve worked   Full CV →   4 entries, first open
  | 03 / Recommendations (only with a quote)   cards in one column
  | 03 or 04 / Contact  (H-3)   closing band   footer   clearance to the tab
```

```text
H-2  SCR-01 at 1440 — hero and key facts, Dag
+--------------------------------------------------------------------------------+
| alpon.dev    CV   Contact                    ( Light | Dark )  ( Get in touch → )|  on spruce, secondary
|████████████████████████████████████████████████████████████████████████████████|
|█  (● Open to work · Oslo area)  [⏸]                                           █|
|█  Hei. / Oslo, Norge · 59.91° N, 10.75° E                                     █|
|█  Alexander                                             .-''''''-.            █|
|█  Ponomarenko                                  (h1)    /  portrait \  ~cont~  █|
|█  Software Engineer                                    |   340      |  ~ours~ █|
|█  Full Stack Developer                                 \           /          █|
|█  Good products are built together.                     '-......-'            █|
|█  [ ▤ View CV ]                                                               █|
|█  ● Nå: MSc Computer Science at Woolf University                              █|
|█ +--------------------------------------------------------------------------+ █|
+--| 3+ yrs           | ~40              | ~2 000           | 100+             |--+
   | label            | label            | label            | label            |
   | context          | context          | context          | context          |
   +--------------------------------------------------------------------------+
   01 / About                                  | Based in   Nittedal, Oslo area · …
   Frontend-focused, full stack.               | Focus      Frontend, with backend …
   intro paragraph (7 parts)                   | Stack      React · Angular · …
                                               | Languages  English, upper-intermediate
                                               |            Norwegian, intermediate
                                               |            Ukrainian, native
   02 / Experience                             | ● Nov 2022 – Jan 2026
   Where I’ve worked                           |   Software Engineer (Consultant)    ⌃
   Full CV →                                   |   summary, points, tags
                                               | ○ 2023 – 2025   Angular Team Lead …  ⌄
  Natt: night ground with a bottom border; header in its usual colours, no border at the top
  834: one column, portrait 260 under the text, key facts 2 × 2, header-wide
```

```text
H-3  SCR-01 at 1440 — contact section and the end of the page
   04 / Contact                                              (03 without Recommendations)
   Get in touch                                        (section has focus after a link)
   Email is fastest. Phone and LinkedIn work too.
   ------------------------------------------------    Hiring? A short email about the role
   Email     ponomaleks@gmail.com          [ ⧉ Copy ]   is the quickest way to reach me.
   Phone     +47 405 94 584                             "a short email" = mail link (T-6, IS-03)
   LinkedIn  linkedin.com/in/ponomalex
   GitHub    github.com/ponomaleks
   Region    Oslo, Norge
   ------------------------------------------------
   ( ⇩ Save contact (.vcf) )                           secondary
   +------+  Point your phone’s camera here
   |  QR  |  to open my contact card.                  from 1024 only
   +------+
   Skann meg
|████████████████████████████████████████████████████████████████████████████████|
|█  Let’s build something good together.                            ~contours~  █|  shift with scrolling
|█  If your team is hiring in the Oslo area, I’d like to hear about it.         █|
|█  ( ⇩ Save contact (.vcf) )  ( Download CV )           both secondary         █|
|████████████████████████████████████████████████████████████████████████████████|
   footer
  390: one column; "Copy" stays at the end of the email row; the sentence follows
  "Save contact"; no QR and no hint; bar-open or bar-collapsed below
  scripts off: no "Copy"
```

### SCR-02 — Not-found page ("Ikke funnet")

Delta only. The page content, its layout and every state not listed here are as in the base manifest, SCR-02. `src/pages/404.astro` does not change: it gets the new bar through the default pair. The visual baseline at 390 is re-taken in Dag and Natt; 834 and 1440 do not change.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | As base manifest SCR-02 `default, stacked` and `default, two columns` | as there, with MobileBar in its new form below 768 | base manifest SCR-02; wireframe below |
| bar-open / bar-collapsed / bar-restored | Below 768 | MobileBar with "View CV" and "Save contact (.vcf)", both secondary, and the tab. "Save contact" downloads the contact card | AC-38, AC-39; S-7 |
| header | Any scroll position | The header never changes style; "Get in touch" is always primary; only the bottom border appears after scrolling | AC-34, D-14; ux-flows Flow US-11, node for SCR-02 |
| contact links | "Contact" or "Get in touch" in the header or SCR-03 | SCR-01 opens at its contact section (state `contact arrived by link`) | AC-18 |
| primary count | Any scroll position | At most two primary buttons on screen: the header's "Get in touch" and "Back to home" | AC-34 |
| cta-band | N/A: left out on this page | — | base manifest |
| loading / empty / error | N/A: as base manifest SCR-02 | — | — |

```text
SCR-02 at 390 — changed part only
|  +---------------------------+       |  map panel, unchanged
|--------------------------------------|
|  footer                       +----+ |
+===============================+ ⌄  +=+
| [ ▤ View CV     ] [ ⇩ Save contact ] |  was: View CV + Get in touch (primary)
+--------------------------------------+
  header "Get in touch" is filled in every bar state
```

### SCR-03 — Mobile menu panel

Delta only. The panel's markup, layout and every state not listed here are as in the base manifest, SCR-03. No wireframe changes.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default (closed) / open | As base manifest SCR-03 | MobileMenu | base manifest SCR-03 |
| closed by a contact link, on SCR-01 | "Contact" or "Get in touch" in the panel, opened on the home page | The panel closes, the page moves to the contact section, its heading is in view below the header and focus is at the section (base G-1) | AC-18; sad.md §6 Reach the contact place, branch `activates Contact or Get in touch on the home page` |
| closed by a contact link, on another page | Same, opened on SCR-02 or SCR-04 | SCR-01 opens at the contact section with the menu closed and focus at the section | AC-18; same flow, branch `on another page` |
| bar behind the panel | Panel open below 768 | The bar and its tab are behind the panel and cannot be reached; the bar's state does not change while the panel is open (base G-3) | base manifest SCR-03 `open` |
| loading / empty / error | N/A: as base manifest SCR-03 | — | — |

### SCR-04 — Styleguide

Delta only. Page options, the real Header and Footer, the demo states and every section not listed here are as in the base manifest, SCR-04. The home scripts do not run here: every sample is static (sad.md §11). Each new or changed section is one visual capture at 390 / 834 / 1440 × Dag / Natt.

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | The Owner types the address | Base sections plus the sections below | wireframe below |
| sample data marked | Always | The Selected projects section carries a visible "Sample data" label; its bracketed values are the only ones the placeholder check allows | AC-12, AC-28 |
| theme-dag / theme-natt, no-script, reduced-motion | As base manifest SCR-04 | every section in that theme; static | base manifest SCR-04 |
| whole hero sample | N/A: not shown here (Owner decision, T-3). The hero's baseline is the home page's own visual test | — | T-3 |
| loading / empty / error | N/A: as base manifest SCR-04 | — | — |

**New sections:**

| Section | Components | States shown |
|---|---|---|
| Portrait | Portrait | round frame at 200 and 340 |
| Motion control | IconButton, Icon (`pause`, `play`) | "Pause animation" and "Play animation"; default / hover / focus / pressed |
| Key facts | Stat ×4 in the panel | final numbers; no counting |
| Quick facts | NEW: QuickFacts | four rows |
| Experience list | ExperienceList / ExperienceItem, Tag | one entry open with summary, points and tags; closed entries; current marker; an entry with no points and no tags; heading hover / focus |
| Testimonial | Testimonial, Link | two cards with marked sample quotes |
| Selected projects (Dormant) | SectionHeader, Link "All projects", ProjectCard ×3, Badge, Tag | as the page design: the first card large (media 7 parts, text 5 from 1024), two compact cards in two columns from 768; each card with status, year, title, summary, one result with its label, tags, "Live" and "Code" where they exist; one card without a live link. "Sample data" label |
| Contact list | ContactList, CopyButton, Button | five rows, "Copy" default / hover / focus, "Save contact (.vcf)" |
| QR tile | QrTile | Dag asset and Natt asset with "Skann meg" |
| Mail-link sentence | Link | the sentence of T-6; link default / hover / focus |

**Changed sections:**

| Section | Components | States shown |
|---|---|---|
| Icon | Icon | adds `play`, `pause`, `check`, `chevron-down`, `chevron-up`, `copy` and the contact icons |
| Stat | Stat | unchanged look; note that `countUp` shows the final number here |
| Toast | Toast | success with the check icon ("Copied" and an address); the refusal message without an icon. "Show toast" as before |
| Contours | Contours | adds the corner shape as used in the hero, static |
| Header variants | Header (samples in the flow) | adds over-hero in Dag with primary and with secondary "Get in touch", and over-hero in Natt with secondary; removes the sample that showed the bar-dependent secondary rule |
| Sticky action bar | MobileBar (inline samples) | bar-open with the default pair and the tab; bar-collapsed |
| Closing band | CtaBand (samples) | the default pair ("Get in touch" primary, "Download CV"); the home pair (both secondary) |

```text
SCR-04 — added part, 1440 (390 / 834: same order, one column)
|  Portrait · Motion control [⏸] [▶] · Key facts · Quick facts ----------------  |
|  Experience list ---------------------------------------------------------    |
|   ● open entry: summary, points, tags   ○ closed   ○ closed, no points        |
|  Testimonial ---   Selected projects — Sample data ------------------------   |
|   +-----------------------------+  (● Live) 2026                               |
|   |  media 16:10                |  Project One        [1.2 s] median load      |
|   +-----------------------------+  tags   Live →  Code →                       |
|   +-------------+ +-------------+  two compact cards                           |
|  Contact list · QR tile (Dag | Natt) · Mail-link sentence -----------------   |
|  Header variants: … | over-hero Dag primary | Dag secondary | Natt secondary  |
|  Sticky action bar: [open + tab] [collapsed tab]   Closing band: two pairs    |
```

## Decided at this stage

Decided by the Owner on 2026-10-05; `tasks` and `plan-tests` take them as written.

| # | Screen / state | Decision |
|---|---|---|
| T-1 | Shell bar-open, bar-collapsed, bar clearance | The collapse tab is a 44 × 44 tab with a chevron pointing down, standing above the bar's top edge on the right, with the bar's background and border, like a folder tab. Since 2026-10-07 the tab is part of the panel: one outline runs up and around it, same surface, rounded top corners. Collapsed, the tab stays in the bottom right corner with the chevron pointing up and 12 px of the panel visible under it; the panel and the tab slide between the states (320 ms, instant with reduced motion), and scrolled away the tab leaves with the panel. The buttons keep their full width. Page bottom clearance is the open bar's height including the tab plus a gap, and the tab, the strip and a gap when collapsed; the Toast offset and `scroll-padding-bottom` count from the top of the tab. `scroll-padding-bottom` covers the tab in both states for a focused element anywhere on the page. The bar and the collapsed tab sit above `env(safe-area-inset-bottom)` |
| T-2 | SCR-02, SCR-03 | Written as a delta against the base manifest; nothing is copied |
| T-3 | SCR-04 | No whole-hero sample on the Styleguide. Its parts are shown on their own and the whole hero is captured on the home page only. This narrows spec §1.1 "`/styleguide`: sections for every new component" for the hero composition |
| T-4 | Shell bar-open, bar-collapsed | The tab has one fixed accessible name, "Quick actions". The native `<details>` state announces expanded or collapsed; the name does not change with the state |
| T-5 | SCR-01 motion running / paused / absent | The Motion control sits at the end of the badge row, at the top of the hero text, in a reserved place. It costs no height on the first phone screen (AC-01) |
| T-6 | SCR-01 mail-link sentence | "Hiring? A short email about the role is the quickest way to reach me." The words "a short email" are the mail link. Its address comes from `src/data/contact.ts` and is not shown as text; AC-27 checks that the link's address matches the contact source |

## New components

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| NEW: QuickFacts (`src/components/home/About.astro` part, or its own file) | The inventory has no key and value list: the page design defines it only at site level (`QuickFacts` in `ext.jsx`, `.x-quick` in `site.css`). It is a mono description list with a fixed key column and hairline rows; ContactList has link values and actions, Stat is a number. Required by AC-07 | pending |

The design-only inventory rows this feature builds (Portrait, QrTile, ProjectCard, Testimonial, ContactList, CopyButton, ExperienceItem / ExperienceList) are not new: `implement` moves them to "Built in the repo" with their paths. The collapse tab is part of MobileBar, and the Motion control is an IconButton.
