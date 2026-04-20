# 🏀 SlamDunk Store: https://slam-dunk-store.vercel.app/

> E-commerce platform for basketball enthusiasts - Shop shoes, apparel, and accessories with a seamless checkout experience.

## 🛍️ Features
- **Product Catalog** - Browse basketball shoes and apparel
- **Shopping Cart** - Add/remove items with real-time updates
- **Secure Checkout** - Safe payment processing
- **User Accounts** - Track orders and save favorites
- **Search & Filter** - Find products quickly
- **Order History** - View past purchases

## 💻 Tech Stack
- **Frontend:** React.js, Redux, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Payment:** Stripe Integration
- **Hosting:** Vercel

## 🚀 Setup Instructions
```bash
git clone https://github.com/MrOybek1202/SlamDunk-Store.git
cd SlamDunk-Store
npm install
npm start
# Slam Dunk Store

<p align="center">
  A cinematic 3D basketball storefront built with React, Vite, Tailwind CSS, GSAP, and React Three Fiber.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-111111?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-111111?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-111111?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-3D-111111?style=for-the-badge&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-UI-111111?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
</p>

## Overview

Slam Dunk Store is a premium one-page basketball product experience focused on motion, atmosphere, and customization. The site uses full-screen storytelling sections, a live 3D ball rendered in WebGL, an animated add-to-cart interaction, and a custom editor that lets users create their own ball variant and add it into the main showcase.

This project is built to feel more like a launch campaign than a traditional e-commerce page.

## Demo

- Local development demo: run `npm run dev`
- Production preview: run `npm run build` and `npm run preview`
- Repository: [SlamDunk-Store](https://github.com/MrOybek1202/SlamDunk-Store)

## Highlights

- Full-screen guided scroll across six viewport-based sections
- Real-time 3D basketball scene powered by Three.js and React Three Fiber
- Custom shader-driven ball material with configurable color and line styling
- `Customize` modal with live 3D preview
- Ball creation flow that appends newly created balls into the main carousel
- Animated add-to-cart flight interaction
- Responsive UI tuned for desktop, tablet, and mobile layouts
- Final contacts section with Telegram, GitHub, and LinkedIn entry points

## Custom Ball Lab

The `Customize` flow is a core part of the experience. Users can:

1. Open the custom editor from the main interface.
2. Rename the ball.
3. Change the base color.
4. Change the seam or line color.
5. Switch between grip texture presets: `CLASSIC`, `STREET`, `TECH`, `CROSS`.
6. Add the created ball directly into the main catalog.

The preview updates live while the user edits the ball.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Three.js
- React Three Fiber
- `@react-three/drei`
- GSAP
- Lucide React

## Project Structure

```text
src/
  components/    Shared UI, 3D scene pieces, product sections
  hooks/         Scroll, animation, and interaction hooks
  pages/         Page-level composition
  types/         Shared TypeScript types
  utils/         Theme, sound, and rendering helpers
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` runs TypeScript checks and generates the production bundle
- `npm run preview` serves the built app locally

## UX Notes

- The experience is intentionally built around section-by-section viewport scrolling.
- Each content panel is sized to behave like a standalone screen in the storytelling flow.
- The interface is optimized to keep the 3D ball readable without letting content overlap or clip across sections.

## Why This Project Stands Out

- It combines product marketing, motion design, and interactive 3D in a single landing experience.
- It includes a real customization workflow instead of a static hero-only concept.
- It is built as a presentable portfolio-quality frontend project rather than a simple demo page.

## Future Improvements

- Save customized balls to local storage or a backend
- Add a dedicated product details page for each ball
- Add a public deployed demo link
- Expand the contact section into a full social or creator profile area

## Author

Built by Oybek.
