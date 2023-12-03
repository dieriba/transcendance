#!/bin/sh

handle_error() {
  echo "Error occurred. Resetting migrations..."
  npx prisma migrate reset --force
  npx prisma migrate dev --name init
}

npx prisma migrate dev --name init
npx prisma studio &

if [ $? -ne 0 ]; then
  handle_error
fi

npm run start:dev
