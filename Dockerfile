FROM node:18-alpine AS build

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/
