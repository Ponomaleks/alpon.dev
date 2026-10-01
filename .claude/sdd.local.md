---
interview_depth: medium    # easy | medium | hard — plugin-wide default for specify/clarify/design
artifact_language: en      # en | uk (any language tag) — language pipeline DOCUMENTS are written in; headings + machine tokens stay English
tdd: true                  # enforce red→green→refactor
team_mode: false           # true → agent team via TeamCreate
workflow_mode: auto        # auto → dynamic Workflow; off → never
max_parallel_agents: 3     # integer ≥1 — fan-out cap for team/workflow modes (1 = sequential)
isolation: worktree        # worktree | inplace (parallel>1 ⇒ forces worktree)
stop_on_red: true          # halt on a red that survives escalation, vs drop-and-continue
max_red_retries: 3         # integer ≥1 — RED→GREEN attempts before escalation
gate_lint: true            # true | false — include lint in the per-task gate
gate_vet: true             # true | false — include vet / static-analysis in the per-task gate
require_integration: auto  # auto | always | never (Docker-probed)
auto_commit: per_task      # per_task | per_phase | off
branch_strategy: feature   # feature | current
cmd_test_unit: ""          # empty = autodetect (escape hatch)
cmd_test_integration: ""
cmd_lint: ""
cmd_vet: ""
model_test_author: sonnet     # per-role model; inherit = session model
model_implementer: sonnet
model_reviewer: opus
judgment_model: opus       # tier alias (haiku|sonnet|opus|fable), inherit, or a full model id — one switch for ALL judgment agents
effort_test_author: medium    # per-role effort; raised to high on escalation
effort_implementer: medium
effort_reviewer: high
---

# SDD settings

## What each key does

- **`interview_depth`** — `easy | medium | hard`. Плагін-широкий дефолт для депт-діала Q&A-скіл (`specify` / `clarify` / `design`): скільки скілла вирішує сама vs. допитує вас. Лише **пре-селектить** рекомендований варіант у стартовому питанні — можна перекрити per-run або через `--depth=`. Не впливає на повноту acceptance criteria (це floor на всіх рівнях).
- **`artifact_language`** — `en | uk` (будь-який мовний тег; дефолт `en`). Мова, якою пишуться **документи пайплайну** — читається **кожною скіллою, що пише артефакт** (spec, SAD, ADR, sequences, data-model, contracts, tasks, test plan, review/fix records, changelog, roadmap, CONTEXT.md). Перемикається лише **проза**; **структура лишається англійською** — заголовки секцій, ключі й значення фронтматера, verdict-літерали, tracker-стани, Mermaid-ключові слова, машинні поля.
- **`tdd`** — коли `false`, крок RED пропускається і движок пише код напряму (з ворнінгом; ви втрачаєте страхувальну сітку).
- **`team_mode` / `workflow_mode`** — годують дерево рішень режиму виконання. `team_mode` виграє, коли підходять обидва.
- **`max_parallel_agents`** — стеля фан-ауту для team/workflow режимів. `1` форсить послідовність.
- **`isolation`** — `worktree` дає кожному паралельному агенту власний git worktree під `.worktrees/`; `inplace` редагує чекаут напряму і **форсить паралелізм у 1**.
- **`stop_on_red`** — `true`: red, що пережив ескалацію, зупиняє ран. `false`: задача дропається, її залежні авто-блокуються, інші гілки їдуть далі.
- **`max_red_retries`** — кількість спроб RED→GREEN до ескалації.
- **`gate_lint` / `gate_vet`** — вмикати lint / vet у per-task гейт (грейсфулі пропускаються, якщо команду не задетектило).
- **`require_integration`** — `auto`: ганяти інтеграційні тести, якщо відповідає Docker-демон, інакше позначити NON-red; `always`: BLOCK до диспатчу, якщо Docker відсутній; `never`: пропустити інтеграційний тір повністю.
- **`auto_commit`** — `per_task` (дефолт), `per_phase`, або `off` (коміти лишаються вам).
- **`branch_strategy`** — `feature`: гарантувати роботу на фіча-бренчі (створити, якщо ви на дефолтному); `current`: комітити в поточну гілку.
- **`cmd_*`** — явні оверрайди команд; непорожні значення шорт-серкутять детекцію (escape hatch для нетипових репо).
- **`model_*` / `effort_*`** — per-role модель + effort для трьох агентів, застосовуються при спавні (перекривають frontmatter агента). Пріоритет: env var > цей сеттінг > frontmatter агента > сесія.
- **`judgment_model`** — тір-аліас (`haiku|sonnet|opus|fable`), `inherit` (модель сесії), або повний model id; дефолт `opus`. Один перемикач для **всіх judgment-агентів** — `reviewer` / `critic` / `devils-advocate` / `strategist` / `analyst`. Дефолт — це **floor, не pin**: коли ключ не заданий, а сесія йде на сильнішому тірі за `opus`, judgment-агенти диспатчаться з `inherit`. Явне значення завжди шанується буквально. Per-role `model_<role>` виграє для своєї ролі. Повний пріоритет: `env > invocation > model_<role> > judgment_model > frontmatter > session`.

## Reading semantics

Невідомі ключі ігноруються (forward-compatible). Відсутній ключ падає на дефолт вище. Malformed файл → ворнінг і фолбек на all-defaults замість падіння рану.
