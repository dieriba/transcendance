FROM node:20-alpine3.18

ARG POSTGRES_USER
ARG POSTGRES_HOST
ARG POSTGRES_PWD
ARG POSTGRES_DB
ENV DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PWD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}"

WORKDIR /app

COPY ./backend/package*.json ./

COPY ./backend/prisma .

RUN npm ci && mkdir dist

COPY ./backend .

COPY ./tools/backend.sh /backend.sh

RUN chmod +x /backend.sh

EXPOSE 3000

ENTRYPOINT [ "/backend.sh"  ]