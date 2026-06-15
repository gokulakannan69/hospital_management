#!/usr/bin/env bash
# Hospital Management – one‑click startup script
# Run from the project root (d:/AI Learn/Hospital management)

# Exit on any error
set -e

# 1️⃣ Install all workspace dependencies
npm install

# 2️⃣ Generate Prisma client (backend)
npx prisma generate

# 3️⃣ Push Prisma schema to the database (creates tables)
npx prisma db push

# 4️⃣ Start both frontend and backend concurrently (uses npm workspaces)
npm run dev
