#!/usr/bin/env bash
set -e

echo "=== School Management System Bootstrap ==="
echo "1. Checking environment variables..."
if [ ! -f .env ]; then
  echo "Copying .env.example to .env..."
  cp .env.example .env
fi

echo "2. Installing dependencies..."
npm install

echo "3. Generating Prisma Client..."
npx prisma generate

echo "4. Pushing database schema..."
npx prisma db push --skip-generate

echo "5. Seeding database..."
npx prisma db seed

echo "=== Bootstrap Completed Successfully! ==="
echo "You can now run 'npm run dev' to start the local development server."
