# Aditya Birla – Abhi Karo

A single-page campaign site built with Angular 22. It presents study findings on the
"intent-action gap": how often people fall short of their own health goals.
It uses scroll-driven GSAP animations and is styled with Tailwind CSS v4.

## Tech stack

- Angular 22 (standalone components, signals, zoneless, lazy-loaded routes)
- Tailwind CSS v4 (design tokens in `src/styles.css`)
- GSAP + ScrollTrigger (animations respect `prefers-reduced-motion`)
- Vitest for unit tests

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:4200/
```

## Scripts

| Command         | What it does                           |
| --------------- | -------------------------------------- |
| `npm start`     | Run the dev server with live reload    |
| `npm run build` | Production build into `dist/`          |
| `npm test`      | Run unit tests with Vitest             |

## Project structure

```
src/app/
├── core/motion/          # GSAP setup (useGsap helper)
├── features/
│   ├── home/             # Home page + its sections
│   │   └── sections/     # hero, what-we-found, about-study, findings
│   └── not-found/        # 404 page
└── shared/
    ├── directives/       # count-up directive
    └── ui/               # flip-card component
```
