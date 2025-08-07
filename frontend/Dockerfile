FROM node:18-alpine

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 8002

CMD ["serve", "-s", "build", "-l", "8002"]
