# Components

All components are **stubs** (placeholder markup, empty behavior). The layout and
logic are filled in later — what matters here is picking the **right type** for each
component so we use Astro correctly instead of rebuilding everything with `innerHTML`.

Pick the type by **where the content and behavior come from**.

## 1. Static — `*.astro` only

Content is known at build time → rendered server-side, **zero client JS**.
No `<script>`, no `*.client.js`. Astro auto-escapes interpolated values.

```
daily-norm/DailyNorm.astro
```

## 2. Interactive island — `*.astro` + `*.client.js`

Markup is **static** in the `.astro` (server-rendered). The `<script>` imports a
co-located `init*(root)` that attaches **behavior only** — event listeners, store
wiring, validation. It does **not** re-render the markup.

```
header   → mobile menu toggle, active link
hero     → search field → store
footer   → newsletter form → subscription API
filters  → filter tabs → store
```

## 3. Data island — `*.astro` host + `*.client.js`

Content comes from **runtime** (API / localStorage), so `init*(root)` fetches it and
renders into the host via `innerHTML`. Escape any dynamic value with
`utils/escape-html`. `category-list` is the reference implementation.

**Loading UX:** category-list uses `LOADER.SILENT` on fetch and renders its own
inline spinner / dimmed cards — avoids the white local overlay from `meta.loader`.

```
category-list (reference) · pagination · exercise-card/FavoritesList · quote (stub)
```

## Primitives — `ui/`

| Use site                                    | Form                                          | Example                                                                                        |
| ------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Static markup (inside an `.astro`)          | `.astro` component, typed props, auto-escaped | `ui/button/Button.astro`                                                                       |
| Dynamic markup (built inside a data island) | `renderX()` string helper for `innerHTML`     | `ui/badge/badge.js`, `ui/button/button.js` (`renderButton`), `ui/rating-stars/rating-stars.js` |
| Imperative live-DOM behavior                | JS module (no static form)                    | `ui/loader`, `ui/modal`                                                                        |

**Rule of thumb:** known at build → `.astro`; appears only inside JS-rendered
content → `renderX()` helper. A primitive that is never placed in static markup
(e.g. badges/stars that only live on JS-rendered cards) stays a `renderX()` helper
— don't add a speculative `.astro` twin.

## Component styles

Component styles live in the co-located `*.scss`, aggregated by `styles/main.scss`
(**global, not scoped**). Scoped `<style>` in an `.astro` would not reach markup that
a data island injects via `innerHTML` at runtime — global styles do. Page-section
layout (grids that arrange components) stays in the scoped `<style>` of each page.
