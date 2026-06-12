FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspace apps/web

COPY apps/web apps/web

EXPOSE 5173
CMD ["npm", "--workspace", "apps/web", "run", "dev"]
