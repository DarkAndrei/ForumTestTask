# build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY certs /etc/nginx/certs
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
