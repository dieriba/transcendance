FROM node:20-alpine3.18

WORKDIR /app

COPY --chown=node:node ./backend/package*.json ./

COPY ./backend/prisma .

RUN npm ci

COPY --chown=node:node ./backend .

COPY ./tools/backend.sh ./backend.sh

RUN chmod 755 ./backend.sh && \
    chown node:node ./backend.sh

USER node

EXPOSE 3000

ENTRYPOINT [ "./backend.sh"  ]