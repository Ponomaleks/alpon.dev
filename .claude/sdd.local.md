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

- **`interview_depth`** — `easy | medium | hard`. Plugin-wide default for the depth dial of the Q&A skills (`specify` / `clarify` / `design`): how much the skill decides itself vs. asks you. It only **pre-selects** the recommended option in the opening question — you can override it per run or with `--depth=`. It does not affect how complete the acceptance criteria are (that is a floor at every level).
- **`artifact_language`** — `en | uk` (any language tag; default `en`). The language the **pipeline documents** are written in — read by **every skill that writes an artifact** (spec, SAD, ADR, sequences, data-model, contracts, tasks, test plan, review/fix records, changelog, roadmap, CONTEXT.md). Only the **prose** switches; the **structure stays English** — section headings, front-matter keys and values, verdict literals, tracker states, Mermaid keywords, machine fields.
- **`tdd`** — when `false`, the RED step is skipped and the engine writes code directly (with a warning; you lose the safety net).
- **`team_mode` / `workflow_mode`** — feed the decision tree of the execution mode. `team_mode` wins when both fit.
- **`max_parallel_agents`** — fan-out cap for the team/workflow modes. `1` forces sequential execution.
- **`isolation`** — `worktree` gives each parallel agent its own git worktree under `.worktrees/`; `inplace` edits the checkout directly and **forces parallelism to 1**.
- **`stop_on_red`** — `true`: a red that survives escalation stops the run. `false`: the task is dropped, its dependants are blocked automatically, the other branches continue.
- **`max_red_retries`** — the number of RED→GREEN attempts before escalation.
- **`gate_lint` / `gate_vet`** — include lint / vet in the per-task gate (skipped gracefully if no command was detected).
- **`require_integration`** — `auto`: run the integration tests if the Docker daemon answers, otherwise mark them NON-red; `always`: BLOCK before dispatch if Docker is absent; `never`: skip the integration tier completely.
- **`auto_commit`** — `per_task` (default), `per_phase`, or `off` (the commits are left to you).
- **`branch_strategy`** — `feature`: make sure the work happens on a feature branch (create one if you are on the default branch); `current`: commit to the current branch.
- **`cmd_*`** — explicit command overrides; non-empty values short-circuit detection (an escape hatch for unusual repositories).
- **`model_*` / `effort_*`** — per-role model and effort for the three agents, applied at spawn (they override the agent's front matter). Priority: env var > this setting > agent front matter > session.
- **`judgment_model`** — a tier alias (`haiku|sonnet|opus|fable`), `inherit` (the session model), or a full model id; default `opus`. One switch for **all judgment agents** — `reviewer` / `critic` / `devils-advocate` / `strategist` / `analyst`. The default is a **floor, not a pin**: when the key is not set and the session runs on a tier stronger than `opus`, the judgment agents are dispatched with `inherit`. An explicit value is always honoured literally. A per-role `model_<role>` wins for its role. Full priority: `env > invocation > model_<role> > judgment_model > frontmatter > session`.

## Reading semantics

Unknown keys are ignored (forward-compatible). A missing key falls back to the default above. A malformed file → a warning and a fallback to all defaults instead of a failed run.
