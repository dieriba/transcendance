FROM node:20-alpine3.18

ARG APP_USER=www-data WORDPRESS_VERSION=6.2.2  MARIADB_VERSION=10.11.4-r0  WGET_VERSION=1.21.4-r0

RUN delgroup ${APP_USER} && addgroup -S -g 1001 ${APP_USER} && adduser -S ${APP_USER} -G ${APP_USER}

WORKDIR /app

COPY ./backend/package*.json ./

COPY ./backend/prisma .

RUN npm ci

COPY ./backend .

COPY ./backend/backend.sh ./backend.sh

RUN chown -R ${APP_USER}:${APP_USER} /app && \
    chmod -R 755 /app && \
    chown ${APP_USER}:${APP_USER} ./backend.sh && \
    chmod 755 ./backend.sh

USER ${APP_USER}:${APP_USER}

EXPOSE 3000

ENTRYPOINT [ "./backend.sh"  ]