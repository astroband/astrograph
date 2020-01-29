FROM node:10-alpine
RUN npm install -g typescript@3.4

WORKDIR /home/node/astrograph

COPY package.json ./
COPY yarn.lock ./

RUN mkdir -p /home/node/astrograph/node_modules && chown -R node:node /home/node/astrograph

USER node

RUN yarn install --ignore-optional

COPY --chown=node:node . .

RUN yarn build

# ================================================================================================

FROM node:10-alpine
ENV NODE_ENV=production

RUN mkdir -p /home/node/astrograph-server
WORKDIR /home/node/astrograph-server

COPY --from=0 /home/node/astrograph/dist ./
COPY --from=0 /home/node/astrograph/node_modules ./node_modules
