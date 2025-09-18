FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN printf "AWS_SECRET_ACCESS_KEY=ABCD1234EFGH5678IJKL9012MNOP3456QRSTUVWX\nAWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n" > .env
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]