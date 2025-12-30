This is a [Next.js](https://nextjs.org) project bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the
file.

This project uses
[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to
automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback
and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the
[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for more details.

## UI Stack: Tailwind CSS v4 + shadcn/ui

This app uses Tailwind v4 and shadcn/ui with class-based dark mode.

- Tailwind config is colocated in `src/app/globals.css` (v4 inline theme).
- Dark mode is toggled via the `dark` class using `next-themes`.
- shadcn components live under `src/components/ui/*`.

### Commands

```bash
pnpm dev        # run app
pnpm typecheck  # TypeScript
pnpm lint       # ESLint
```

### Structure

- `src/app/globals.css`: Tailwind import, base CSS variables, tokens, and plugin registration.
- `src/components/theme-provider.tsx`: Wrapper around `next-themes` with `attribute="class"`.
- `src/components/theme-toggle.tsx`: Simple theme toggle button.
- `src/components/ui/*`: shadcn/ui components (button, card, input, tabs, dialog, switch, badge,
  sonner toaster).

### Demo routes

- `/styles`: showcases theme tokens and utilities
- `/components`: showcases shadcn components; includes Sonner Toaster demo

### Adding more shadcn components

Use the CLI from the app directory:

```bash
cd apps/web
npx shadcn@latest add accordion avatar dropdown-menu select textarea tooltip
```

### Notes

- If you change the base palette, update CSS variables in `globals.css` under `:root` and `.dark`.
- Sonner is used for toasts instead of the deprecated `toast` component.
- Tailwind plugins used: `tailwindcss-animate`.
