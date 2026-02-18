FROM node:22

WORKDIR /app

RUN npm install -g bun

COPY yarn.lock package.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate

RUN yarn build || true

# this should match the port in your .env
EXPOSE 3000

CMD ["bun", "run", "dist/server.js"]
