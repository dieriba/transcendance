FROM node:20-alpine3.18

RUN mkdir -p /app && chown node:node /app

WORKDIR /app

COPY ./backend/package*.json ./

COPY ./backend/prisma .

RUN npm ci && mkdir dist

COPY ./backend .

COPY ./tools/backend.sh /backend.sh

RUN chmod +x /backend.sh && chown node:node -R dist

USER node:node

EXPOSE 3000

ENTRYPOINT [ "/backend.sh"  ]