# backend/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 4300

CMD ["npm", "run", "dev"]