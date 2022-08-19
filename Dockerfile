# syntax = docker/dockerfile:1
FROM node:18-alpine as build_stage

WORKDIR /code

COPY package.json yarn.lock ./
RUN yarn install --ignore-optional

COPY . .
RUN yarn build

# ================================================================================================
FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /home/node/astrograph-server

COPY --from=build_stage /code/package.json /code/yarn.lock ./
RUN  yarn install --prod && chown -R node:node /home/node

COPY --from=build_stage --chown=node:node /code/dist ./

USER node
