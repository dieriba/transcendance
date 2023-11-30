FROM node:20-alpine3.18

WORKDIR /app

COPY ./backend/package*.json ./

COPY ./backend/prisma .

RUN npm ci && mkdir dist

COPY ./backend .

COPY ./tools/backend.sh /backend.sh

RUN chmod +x /backend.sh

EXPOSE 3000

ENTRYPOINT [ "/backend.sh"  ]