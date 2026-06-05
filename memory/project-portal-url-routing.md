---
name: project-portal-url-routing
description: URL routing and name schema added to the portal in June 2026
metadata:
  type: project
---

URL routing added to portal (June 2026) using react-router-dom + GitHub Pages 404.html trick.

**Why:** Mark wanted bookmarkable URLs and refresh-persistence for portal pages.

**URL scheme:**
- Students/parents: `/` = assigned (default), `/:tab` = e.g. `/scheduling`
- Admin preview: `/:firstName` = student portal, `/:firstName/:tab` = specific tab
- Tab is derived from URL in StudentView (no useState); navigate() updates URL on tab click

**Name schema change:** students table now has `first_name` + `last_name` (separate columns). A Postgres trigger keeps `name` = `first_name + ' ' + last_name` automatically. The `resolve_my_account` RPC now returns `first_name` and `last_name` in addition to `name`. Edge functions still use `student.name` (unchanged).

**How to apply:** Migrations `20260605200000_add_last_name.sql` and `20260605210000_update_resolve_my_account.sql` were pushed to production via `npx supabase db push`.

**Key files changed:** src/main.jsx, src/components/StudentView.jsx, src/components/AdminApp.jsx, src/components/Settings.jsx, public/404.html, index.html.
