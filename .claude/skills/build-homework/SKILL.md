---
name: build-homework
description: Build homework packets requested from the Trajectory portal. Picks up pending build requests, compiles the PDF with EigenNode's builder, uploads drafts for review, applies Mark's revision notes, and watches until each packet is approved. Use when Mark says "build the homework", "/build-homework", or has clicked "Create assignment" in the portal.
---

# Build homework packets

Mark selects problems in the portal and clicks "Create assignment…", which saves a
build request. Your job: build the PDF, post it back as a draft, then **stay
running** — when Mark leaves revision notes in the portal you rebuild, and when
he clicks "Approve & assign" you're done. He should never have to touch the
terminal again after starting you.

Talk to Mark in plain language (he's not a developer). Never print or commit the
contents of `.env` — the service key lives there. The builder calling `claude -p`
internally (for the title) is normal.

## Key paths

- Portal repo (run `node` commands from here): `C:\Users\markd\github\trajectory`
- Helper CLI: `node scripts/hw_agent.mjs <pending|get|set|upload|wait>` — run
  `pending` first; the file's header comment documents every subcommand.
- PDF builder: `C:\Users\markd\github\EigenNode\scripts\build_homework_set.py`
  (run with `python` from the EigenNode directory)
- Builder output: `C:\Users\markd\github\EigenNode\scripts\output\homework_set_<label>[_solutions].pdf`
  plus `build_report.txt` (check it for warnings after every build)
- Problem data (source of truth for IDs and lesson codes): the files listed in
  `trajectory\data\aops-index.json` (e.g. `data/aops-mechanics.json`). Problem
  `id` fields are EigenNode node UUIDs; `lesson` is the raw code like
  `"MCH01: Velocity"`.
- Hand-written weekly summaries: `C:\Users\markd\github\EigenNode\scripts\handout_summaries\`

## Procedure

### 1. Find work

```
node scripts/hw_agent.mjs pending
```

If empty, tell Mark there are no packet requests waiting and stop.

Each row has `id`, `status` (`requested` or `revise`), `request`
(`student_id`, `student_name`, `problem_ids`, `lesson`, `title`,
`instructions`), and `review_notes` (only meaningful for `revise`).

### 2. Build one request

1. `node scripts/hw_agent.mjs set <id> --status building`
2. **Validate problem IDs.** Every entry of `request.problem_ids` must appear as
   an `id` in one of the course files from `data/aops-index.json`. Confirm the
   lesson code from those records rather than trusting `request.lesson` blindly
   (they should agree). If any ID is unknown:
   `set <id> --status failed --notes "<plain-language explanation>"` and move on.
3. **Reuse the weekly summary.** Take the lesson code (e.g. `MCH01`) and look for
   `EigenNode\scripts\handout_summaries\<code lowercase>*summary.tex`
   (e.g. `mch01_velocity_summary.tex`). If it exists, pass it with
   `--summary-file`. **Never generate a new summary when one exists.**
   If none exists, let the builder generate one — then copy the generated
   summary block out of the built `.tex` into
   `handout_summaries\<code>_<slug>_summary.tex` so it's reused next time
   (LaTeX body only, no preamble, fits one page).
4. **Build both PDFs** from the EigenNode directory:
   ```
   python scripts\build_homework_set.py <id> --problems <id1,id2,...> --lesson "MCH01: Velocity" --student "<student_name>" [--title "..."] [--summary-file <path>]
   python scripts\build_homework_set.py <id> --problems <...same...> --lesson "..." --student "..." --solutions [--title "..."] [--summary-file <path>]
   ```
   Use `request.title` if set. Honor `request.instructions` (e.g. special title,
   ordering, emphasis). Check `build_report.txt`; if the build failed or dropped
   problems, fix the cause or mark the request failed with a clear note.
5. **Upload and hand off for review:**
   ```
   node scripts/hw_agent.mjs upload <id> <problemsPdf> --solutions <solutionsPdf>
   node scripts/hw_agent.mjs set <id> --status draft --clear-notes --name "<final title>" --description "<one sentence: lesson, student, N problems>"
   ```
   (The portal already hides the solutions link from the student until the
   assignment is completed — uploading it is safe.)
6. Tell Mark: the draft is ready to review in the portal's **Handouts** tab.

If there are several pending requests, build them all (steps above) before
moving to the watch phase.

### 3. Watch for review

For each packet now in `draft`:

```
node scripts/hw_agent.mjs wait <id>
```

This blocks until Mark acts in the portal (poll ~20s; let it run — it can take
a while if he's reading). It prints the new status:

- **`revise`** — `review_notes` holds his feedback. Apply it:
  - retitle → rebuild with `--title`
  - summary tweaks → edit a copy of the summary file, pass via `--summary-file`
    (update the shared file in `handout_summaries\` only if the change is about
    the lesson content itself, not packet-specific)
  - reorder / add / drop problems → write the updated `request` object to a temp
    JSON file and `set <id> --request-json <file>`, then rebuild with the new ID list
  Then rebuild **both** PDFs, `upload`, `set --status draft --clear-notes`, tell
  Mark it's ready again, and go back to waiting.
- **`active`** — Mark approved and assigned it. This packet is done.
- **`deleted`** — Mark discarded it. Done; don't rebuild.

When every packet is approved or discarded, summarize what happened in one or
two plain sentences and finish.

## Failure handling

On any unrecoverable error, `set <id> --status failed --notes "<what went wrong,
in plain language, and what Mark can do>"` so it shows in the portal, and tell
him directly too. Common issues: `latexmk` missing/erroring (read the LaTeX log
tail the builder prints), an ID not in the course indexes (the problem may not
be exported yet — re-run EigenNode's `export_course_index.py`), missing
`master.json` (EigenNode's Drive sync not available on this machine).
