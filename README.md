# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.*
!.env.example

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/
*.swp
*.swo

# Build/Cache
dist/
build/
.cache/


# CSE 340 - Web Backend Development

This project demonstrates Server-Side Rendering (SSR) using Node.js, Express, and EJS with Tailwind via CDN.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (bundled with Node.js)

### Installation
```bash
npm install
```

### Run
```bash
npm start
```
Then open `http://localhost:3000`.

## Routes
- `GET /` — Home (SSR example with EJS + Tailwind)
- `GET /about` — About page
- `GET /user/:name` — Dynamic route example (e.g., `/user/John`)

## Tech Stack
- Node.js
- Express.js
- EJS (templates)
- Tailwind CSS (CDN)

## Project Structure (suggested)c