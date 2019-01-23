FROM node:10.15-jessie as base

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY .env .
COPY copyStaticFiles.js .
COPY ./src /app/src

RUN yarn && yarn build && rm -rf ./node_modules && yarn install --production

FROM node:10.15-alpine

WORKDIR /build

COPY --from=base /app/build /build/build
COPY --from=base /app/node_modules /build/node_modules
COPY .env .

CMD ["node", "./build/index.js"]
