# alpon.dev · тимчасова сторінка

Статична сторінка-заглушка у стилі Fjord: контакти з візитки, CV (EN / NO) з переглядом прямо в браузері, vCard, OG-картинка для LinkedIn. Жодної збірки, жодних залежностей. Хостинг: Cloudflare Workers (static assets), безкоштовний тариф.

```
alpon.dev/
├─ wrangler.jsonc          конфіг Cloudflare (ім'я Worker'а, папка public, домен)
├─ public/                 все, що публікується
│  ├─ index.html           сторінка
│  ├─ styles.css, app.js
│  ├─ 404.html
│  ├─ cv/                  PDF + прев'ю сторінок (webp) для телефонів
│  ├─ fonts/               Schibsted Grotesk, JetBrains Mono (woff2, OFL)
│  ├─ img/contours.svg     горизонталі з brand-пакета
│  ├─ og.png               картинка для прев'ю посилання (LinkedIn, Slack, месенджери)
│  ├─ alexander-ponomarenko.vcf
│  ├─ _headers             безпека + кешування
│  └─ _redirects           короткі посилання: /cv, /cv/no, /linkedin, /github
└─ tools/                  джерела OG-картинки й контурів (у деплой не йдуть)
```

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
| Контакти | `public/index.html` (блок Contact + JSON-LD у `<head>`) і `public/alexander-ponomarenko.vcf` | |
| Текст "under construction" | `public/index.html`, `.eyebrow` | |

Після змін: `git add . && git commit -m "..." && git push`. PDF кешується на годину, тож нова версія в усіх з'явиться протягом години (або одразу: **Caching → Configuration → Purge Everything**).

## Швидкий варіант без GitHub

Якщо треба опублікувати негайно, з PowerShell у папці проєкту (потрібен Node.js):

```powershell
npx wrangler login
npx wrangler deploy
```

Пізніше можна підключити репозиторій (крок 2) до того самого Worker'а через **Settings → Builds → Connect**.

## Локальний перегляд

```powershell
npx wrangler dev
```

Відкрити http://localhost:8787. Працюють і `_headers`, і `_redirects`, і 404, як на продакшні.
