# Progress reports — format, tooling, and workflow

This folder holds the source for student progress reports. It contains:

- `template.typ` — the report template (Typst). Edit the `data` block, compile, done.
- `eichenlaub_icon.png` — the logo mark used in the header.
- `WORKFLOW.md` — this document.

---

## 1. Recommended format: **Typst**

For a document that needs precise visual styling, a logo, a PDF export, an
appendix table, and occasional AI-assisted drafting, **Typst** is the best
choice in 2026. Why, versus the alternatives:

| Option | Verdict |
|---|---|
| **Typst** ✅ | Markup is far simpler than LaTeX, compiles in milliseconds, has first-class styling (colors, fonts, tables) without package archaeology. A single static binary (`scoop install typst`) — no multi-GB TeX install. Easy for an AI to generate correctly because the language is small and regular. |
| LaTeX | Most capable and most universal, but heavyweight, slow feedback loop, and brittle (font/package/encoding pitfalls). Overkill unless you need heavy math typesetting or journal templates. The math here is trivial (`F = ma`), so LaTeX's main advantage doesn't apply. |
| MDX + Pandoc | Good for content reuse across web + PDF, but PDF styling still routes through LaTeX or wkhtmltopdf, so you inherit those headaches and lose fine control. More moving parts than this job needs. |
| Google Docs / Word | Fast to start, but visual consistency across reports is manual and drifts; not diff-friendly or scriptable; awkward to template or AI-generate. |

Typst gives you LaTeX-grade output with a fraction of the friction, and the
template is plain text an AI can fill in directly.

### Installed already
`typst` 0.14 is installed via scoop (`~/scoop/shims/typst`). For pixel-exact
fonts, also install the **static** (non-variable) builds of *IBM Plex Sans*,
*IBM Plex Mono*, and *Spectral* — otherwise Typst substitutes a variable build
and prints a harmless warning. The layout works regardless.

---

## 2. Where to store and edit

Keep the source **here in the repo** (`reports/`), versioned in git alongside
the portal. Rationale: reports are part of the business, diffs are meaningful,
and the logo + template travel with the code.

Edit in **VS Code** with the **Tinymist** Typst extension (formerly
`typst-lsp`/`typst-preview`). It gives live PDF preview on save, autocomplete,
and inline error highlighting. Overleaf is unnecessary — it's LaTeX-oriented and
adds a cloud round-trip you don't need for a local single-author document.

Suggested per-student layout as the archive grows:

```
reports/
  template.typ            # master template
  eichenlaub_icon.png
  leo/
    2026-spring.typ       # one file per cycle, copied from template
    2026-spring.pdf
  borna/
    2026-spring.typ
```

---

## 3. End-to-end workflow

**Step 1 — AI drafts from portal data (your Claude subscription, not the API).**

The session summaries, study plan, and assignments already live in the Supabase
DB. Pull a single student's data into a text blob and hand it to the `claude`
CLI with a prompt. A ready-made pull script would query:

- `sessions` (date, summary, tags) for the student, this cycle
- the active `study_plans.content`
- `assignments` joined to problem titles

Then:

```powershell
# pseudo: dump one cycle of data, then draft
claude -p "Here are Leo's last 10 sessions, his study plan, and assignments.
Draft a progress report by filling in the `data` dictionary in template.typ.
Summary as 3-4 bullets; Progress Made as 2-3 narrative paragraphs with specific
anecdotes; keep my voice (first person, warm, concrete). Output only the Typst
`data` block." < leo_cycle_data.txt > leo_data.typ
```

Because the template is data-in / layout-out, the AI only writes the `data`
block — it can't break the styling.

**Step 2 — Mark edits.** Open the `.typ` in VS Code with Tinymist. The PDF
preview updates live as you refine wording. This is where your judgment and
anecdotes go in; the AI draft is a starting point, never the final word.

**Step 3 — Export PDF.**

```powershell
typst compile leo/2026-spring.typ leo/2026-spring.pdf
```

**Step 4 — Upload to the portal.** In the portal (admin preview), open the
student's **Reports** tab → set a title (e.g. "Progress Report — Spring 2026")
→ choose the PDF → Upload. It lands in the `progress-reports` storage bucket and
appears in the student's portal immediately. The 10-sessions-since-last-report
reminder for that student re-arms automatically once the new report exists.

---

## 4. Cadence

`bill-sessions` emails Mark "Time for <student>'s progress report" once a
student reaches 10 completed sessions since their last report. One report per
**cycle** (one block of 10 sessions) keeps reports and billing in lockstep.
