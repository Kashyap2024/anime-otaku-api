FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4444

ENV NODE_ENV=production

CMD [ "node", "./api/server.js" ]
