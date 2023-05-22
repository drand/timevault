FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm i
COPY ./src ./src
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/
