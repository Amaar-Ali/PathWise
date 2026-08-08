# PathWise — agent notes

- Prefer small, focused diffs. Match existing patterns in `src/`.
- Do not commit `.env.local` or secrets. Use `.env.example` as the template.
- Server-only secrets must **not** use the `VITE_` prefix.
- Decision maps are the product — keep exploration UX calm, clear, and honest.
- After dependency or Vite config changes, run `npm run build` before shipping.
