FROM node:18-alpine

RUN npm install pm2 -g

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/backend/data

EXPOSE 4000

CMD [ "pm2-runtime", "server.js" ]