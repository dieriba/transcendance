FROM node:20-alpine3.18

WORKDIR /app

COPY ./frontend/package*.json .

RUN npm install

COPY ./frontend .

EXPOSE 5173

CMD [ "npm", "run", "dev" ]