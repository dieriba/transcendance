FROM node:20-alpine3.18 As development

WORKDIR /app

COPY --chown=node:node ./backend/package*.json ./

COPY ./backend/prisma .

COPY ./tools/backend.sh /tools/backend.sh

RUN npm ci

COPY --chown=node:node . /app/

RUN chmod 700 /tools/backend.sh 

USER node

EXPOSE 3000

ENTRYPOINT [ "run", "start:dev" ]
CMD [ "npm" ]