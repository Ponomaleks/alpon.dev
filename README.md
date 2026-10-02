# alpon.dev

Особистий сайт Alexander Ponomarenko. Дві лінії:

- **`main`** — тимчасова статична сторінка-заглушка (контакти, CV EN / NO, vCard), без збірки, з `public/`. Вона лишається на продакшні, доки v2 не досягне паритету.
- **`v2`** — новий сайт на Astro 6 (static) з дизайн-системою Fjord. Деплоїться як preview, не чіпаючи продакшн.

## v2: розробка

Потрібно: Node 24 (`.nvmrc`), npm.

```powershell
npm ci
npx playwright install chromium   # один раз, для тестів і Lighthouse CI
```

| Команда | Що робить |
|---|---|
| `npm run dev` | `astro dev`, гаряче перезавантаження |
| `npm run build` | `astro build` → `dist/` (`public/` копіюється всередину) |
| `npm run preview` | `wrangler dev` на `dist/`: `_headers`, `_redirects` і 404 як на продакшні (http://localhost:8787) |
| `npm run test` | Playwright (e2e + axe) проти `wrangler dev`; сам збирає `dist/` і піднімає сервер |
| `npm run lint` | `astro check` + ESLint + Prettier `--check` |
| `npm run format` | Prettier `--write` |
| `npm run lhci` | Lighthouse CI на `dist/` (спершу `npm run build`), бюджет з `CLAUDE.md` |

CI: `.github/workflows/ci.yml` на кожен PR і push у `main` / `v2` — lint, build, test, lhci.

### Visual baselines

Візуальні тести (`tests/visual/`) порівнюють сторінку з Linux-еталонами в `tests/visual/__screenshots__/linux/`, знятими в офіційному образі Playwright (`mcr.microsoft.com/playwright:v1.63.0-noble`, версія = `@playwright/test`). Без еталона job `visual` у CI падає.

Основний шлях: додати до PR мітку `visual-baselines`. Workflow `.github/workflows/visual-baselines.yml` збирає сайт, пише еталони (`FJORD_VISUAL=write`) і викладає PNG як артефакт `visual-baselines-linux`; кожен новий push у PR, поки мітка є, генерує їх заново. Переглянути PNG проти дизайну, закомітити їх у `tests/visual/__screenshots__/linux/` і зняти мітку.

Запасний шлях, локально в Docker (той самий образ; анонімний том для `node_modules`, щоб не зачепити Windows-залежності):

```powershell
docker run --rm --ipc=host -v "${PWD}:/work" -v /work/node_modules -w /work -e FJORD_VISUAL=write mcr.microsoft.com/playwright:v1.63.0-noble bash -c "npm ci && npx playwright test tests/visual --project desktop --update-snapshots=all"
```

```
alpon.dev/
├─ astro.config.mjs        Astro: static, build.format 'file', trailingSlash 'never'
├─ wrangler.jsonc          Worker: assets.directory ./dist, 404-page, auto-trailing-slash
├─ src/                    сторінки, layout, компоненти, стилі, дані, content collections
├─ public/                 статика: fonts, cv/, qr/, vCard, og.png, _headers, _redirects
├─ tests/                  e2e/ (smoke, parity), a11y/ (axe), visual/
├─ docs/                   SDD: idea brief, architecture map, ADR, stub-parity.md
├─ design/                 handoff і brand pack (лише читання)
└─ tools/                  джерела OG-картинки, контурів, прев'ю CV (у деплой не йдуть)
```

### Паритет із заглушкою

`docs/stub-parity.md` — все, що вміє заглушка. `tests/e2e/parity.spec.ts` має по тесту на кожен пункт: активні мають проходити вже зараз, решта — `test.fixme`, доки фіча-спека їх не реалізує. **v2 потрапляє в `main` лише тоді, коли в `parity.spec.ts` не лишилося жодного `test.fixme`.**

### v2 на Cloudflare Workers Builds (preview)

Workers Builds не читає custom build з `wrangler.jsonc`, а налаштування збірки одні на всі гілки. Тому:

- **Build command:** порожньо (на `main` немає `package.json`; на `v2` залежності Workers Builds ставить сам, бо `package.json` є).
- **Deploy command** (production, `main`): `npx wrangler deploy` — як і раніше, віддає `public/` заглушки.
- **Non-production branch deploy command** (`v2` та інші гілки): `npm run build && npx wrangler preview`.

Preview URL гілки `v2` видно у Worker `alpon-dev` → **Deployments** (або в статусі коміту на GitHub).

Node: Workers Builds читає `.nvmrc` — перша збірка `v2` (2026-10-02) встановила Node 24.21.0, тож build variable `NODE_VERSION` не потрібна. Якщо колись у лозі буде інша версія, додати `NODE_VERSION=24` для non-production гілок.

Під час злиття `v2` → `main` змінити production deploy command на `npm run build && npx wrangler deploy`.

---

## Заглушка (`main`)

Статична сторінка у стилі Fjord: контакти з візитки, CV (EN / NO) з переглядом прямо в браузері, vCard, OG-картинка для LinkedIn. Жодної збірки, жодних залежностей. Хостинг: Cloudflare Workers (static assets), безкоштовний тариф. Файли сторінки (`public/index.html`, `styles.css`, `app.js`, `404.html`) є лише на `main`; на `v2` їх замінюють сторінки Astro.

## Як працює перегляд CV

- Десктоп (Chrome, Edge, Firefox, Safari): PDF відкривається у вбудованому переглядачі браузера всередині сторінки.
- Телефони і браузери без PDF-переглядача: показуються обидві сторінки як зображення, тап відкриває повний PDF. Так CV видно одразу, без порожнього фрейму на Android і без "тільки першої сторінки" на iPhone.
- Кнопки Open PDF / Download працюють завжди. Посилання `alpon.dev/#cv-no` відкриває норвезьку версію.

---

## Розгортання: GitHub + Cloudflare (≈15 хвилин)

### 0. Що потрібно

- Акаунт Cloudflare, де вже є зона `alpon.dev` (домен купувався там, тож DNS уже на Cloudflare).
- Акаунт GitHub і Git для Windows (`git --version` у PowerShell).

### 1. Репозиторій на GitHub

1. На github.com: **New repository** → назва `alpon.dev` → Private або Public (обидва варіанти працюють) → без README → **Create**.
2. У PowerShell в папці проєкту:

```powershell
cd C:\Users\User\Documents\Projects\Portfolio\alpon.dev
git init -b main
git add .
git commit -m "alpon.dev: temporary landing with contacts and CV"
git remote add origin https://github.com/ponomaleks/alpon.dev.git
git push -u origin main
```

### 2. Worker з автодеплоєм

1. dash.cloudflare.com → **Compute (Workers)** → **Workers & Pages** → **Create application**.
2. Вибрати **Import a repository** → **Get started** → підключити GitHub (дати доступ лише до репозиторію `alpon.dev`).
3. Вибрати репозиторій. Налаштування:
   - **Project name:** `alpon-dev` (має збігатися з `name` у `wrangler.jsonc`, інакше збірка впаде)
   - **Build command:** порожньо
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** `/`
4. **Deploy**. Через хвилину сайт доступний на `alpon-dev.<ваш-субдомен>.workers.dev`.

Далі кожен `git push` у `main` автоматично публікує нову версію.

### 3. Домен alpon.dev

`wrangler.jsonc` уже містить `alpon.dev` як Custom Domain, тож перший деплой сам створює DNS-запис і SSL-сертифікат.

Перевірити: Worker `alpon-dev` → **Settings** → **Domains & Routes**: має бути `alpon.dev`.

Якщо деплой скаржиться на конфлікт DNS: **DNS → Records** і видалити старі записи для `alpon.dev` (A / AAAA / CNAME, які Cloudflare міг створити при реєстрації, наприклад паркувальні). Потім **Retry deployment** у вкладці Deployments.

Запасний шлях через інтерфейс: **Domains & Routes → Add → Custom Domain → `alpon.dev`**.

### 4. www.alpon.dev → alpon.dev

1. **DNS → Records → Add record:** Type `AAAA`, Name `www`, IPv6 `100::`, Proxy **увімкнено** (помаранчева хмарка).
2. **Rules → Overview → Create rule → Redirect Rule** → шаблон **Redirect from WWW to Root** → **Deploy**.

### 5. Перевірка

- `https://alpon.dev`: сторінка, PDF, кнопки. `.dev` працює лише через HTTPS, сертифікат Cloudflare видає сам (іноді до 15 хвилин).
- `https://alpon.dev/cv`: відкривається англійський PDF.
- `https://alpon.dev/nope`: брендова 404.
- Телефон: відсканувати QR з візитки, перевірити "Save contact".
- Прев'ю посилання: https://www.linkedin.com/post-inspector/ → вставити `https://alpon.dev` → має з'явитися `og.png`.
- Заголовки: https://securityheaders.com/?q=alpon.dev

### 6. Необов'язково, але корисно

- **Аналітика без cookies:** **Analytics & Logs → Web Analytics → Add a site → alpon.dev**. Для домену на Cloudflare вмикається автоматично, банер про cookies не потрібен.
- **Пошта на домені** (hei@alpon.dev): **Email → Email Routing → Get started** → адреса `hei` → переслати на ponomaleks@gmail.com. Безкоштовно. Відповідати з цієї адреси можна через Gmail "Send mail as". Якщо перейдете на неї, замініть email у `index.html` і `alexander-ponomarenko.vcf`.

---

## Оновлення

| Що змінити | Де | Потім |
|---|---|---|
| CV | замінити `public/cv/alexander-ponomarenko-cv-en.pdf` / `-no.pdf` (ті самі імена) | `python tools/cv-previews.py` (перший раз: `pip install pymupdf pillow`) |
| Контакти | `main`: `public/index.html` (блок Contact + JSON-LD у `<head>`); `v2`: `src/data/contact.ts` (створює перша UI-фіча). В обох `public/alexander-ponomarenko.vcf` | |
| Текст "under construction" (`main`) | `public/index.html`, `.eyebrow` | |

Після змін: `git add . && git commit -m "..." && git push`. PDF кешується на годину, тож нова версія в усіх з'явиться протягом години (або одразу: **Caching → Configuration → Purge Everything**).

## Швидкий варіант без GitHub

Якщо треба опублікувати негайно, з PowerShell у папці проєкту (потрібен Node.js):

```powershell
npx wrangler login
npx wrangler deploy
```

Пізніше можна підключити репозиторій (крок 2) до того самого Worker'а через **Settings → Builds → Connect**.

## Локальний перегляд

На `main`:

```powershell
npx wrangler dev
```

На `v2` спершу збірка: `npm run build`, потім `npm run preview`.

Відкрити http://localhost:8787. Працюють і `_headers`, і `_redirects`, і 404, як на продакшні.
