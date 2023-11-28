FROM node:20-alpine3.18 As development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . /app/

USER node

EXPOSE 5173

CMD [ "npm", "run", "dev" ]