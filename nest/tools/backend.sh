#!/bin/sh

export DATABASE_URL="postgresql://dieri:dieri@postgres:5432/transcendance"

handle_error() {
  echo "Error occurred. Resetting migrations..."
  npx prisma migrate reset --force
  npx prisma migrate dev --name init
}

npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
  handle_error
fi

npm run start:dev
