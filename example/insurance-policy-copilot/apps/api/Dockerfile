FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspace apps/api

COPY apps/api apps/api

EXPOSE 8080
CMD ["npm", "--workspace", "apps/api", "run", "dev"]
