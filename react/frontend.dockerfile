FROM node:20-alpine3.18

WORKDIR /app

COPY --chown=node:node ./frontend/package*.json .

RUN npm ci

COPY --chown=node:node ./frontend .

EXPOSE 5173

CMD [ "npm", "run", "dev" ]