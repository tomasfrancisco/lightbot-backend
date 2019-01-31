# Lightbot Backend

> Note: Initial boilerplate from
> [ts-backend-boilerplate](https://gitlab.com/lightbase/ts-backend-boilerplate). For more
> info on commands to run check that repo.

[![Build Status](https://api.cirrus-ci.com/github/lightbasenl/lightbot-backend.svg)](https://cirrus-ci.com/github/lightbasenl/lightbot-backend)

## About

Lightbot Backend contains an GraphQL API for the
[Lightbot Editor](https://github.com/lightbasenl/lightbot-editor) to build your bot. It
also contains an API to have conversations with a deployed bot via
[Lightbot Widget](https://github.com/lightbasenl/lightbot-widget).

The Lightbot Backend can currently deploy a bot on Dialogflow and RASA NLU.

## Up and Running

#### Requirements

- Node.js >= 10.x
- Yarn
- Docker & Docker-compose

#### Steps

The first step to run this Backend is copying the `.env.example` file and editing it with
correct values. The defaults should work for development.

Next run the local docker-compose setup with `yarn docker:up`  
Install dependencies: `yarn`  
Run dev migration and seed: `yarn migrate:dev`  
Start development server: `yarn dev`

### Installation

```bash
yarn install
yarn dev
```

### Build

```bash
yarn build
```

### Test

```bash
yarn test
```

### Lint

```bash
yarn lint:ts
yarn lint:prettier
yarn lint:fix
```
