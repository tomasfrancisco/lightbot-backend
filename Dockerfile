FROM node:10.15-jessie as base

WORKDIR /app

COPY package.json yarn.lock tsconfig.json .env copyStaticFiles.js ./
COPY ./src /app/src

RUN yarn --production=false && yarn build && rm -rf ./node_modules && yarn install --production

FROM node:10.15-alpine

WORKDIR /build/build

COPY --from=base /app/node_modules /build/node_modules

# Try rebuild to get grpc with musl libc instead of glibc
RUN npm rebuild -q

COPY --from=base /app/build /build/build

CMD ["node", "./index.js"]
