# Tracker — save-contact-hint

> Status of every task. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

One branch, `feat/save-contact-hint`, and one pull request into `v2`. The tasks and their definitions of done are in [tasks.json](../tasks.json).

| # | Task | Layer | Blocked by | Status |
|---|---|---|---|---|
| T1 | Write the spec and the task list, and mark backlog B-58 as not built | docs | — | done |
| T2 | Give the Button meta text and rename the contact card action to "Add to contacts" | ui | T1 | done |
| T3 | Add the inline note under the action in the Contact block | ui | T2 | done |
| T4 | Build the SaveContactSheet dialog in both themes with its Styleguide sample | ui | T2 | done |
| T5 | Open and close the sheet from the home page script | wiring | T3, T4 | done |
| T6 | Owner check in the LinkedIn in-app browser on an iPhone | docs | T5 | todo |
| T7 | Take the visual baselines and write the pull request body | test | T6 | todo |
| T8 | Write the phone number in the contact card without spaces | domain | T1 | done |
| T9 | Add "Copy" to the phone row and copy a selection of the number without spaces | ui | T8 | done |
| T10 | Show the QR tile at every width | ui | T1 | done |
