# ====================================================================================================

FROM node:alpine AS build

ENV YARN_VERSION 1.9.4
ENV NODE_ENV="production"

# Packages
RUN apk add --no-cache libc6-compat curl python g++ make postgresql-dev

# Yarn
RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz

WORKDIR /root

COPY src ./src
COPY types ./types
COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .

RUN yarn install --production=false
RUN yarn build

# ====================================================================================================

FROM node:alpine

ENV NODE_ENV="production"
ENV PORT 4000
ENV DB "core"
ENV DBPORT "5432"
ENV DBHOST "docker.for.mac.localhost"
ENV DBUSER "postgres"
ENV DBPASSWORD ""
ENV INGEST_INTERVAL 2000

WORKDIR /root

COPY --from=build /root/node_modules ./node_modules
COPY --from=build /root/dist ./dist
COPY --from=build /root/yarn.lock .
COPY --from=build /root/package.json .

ADD scripts/healthcheck.sh /healthcheck.sh
HEALTHCHECK --interval=30s CMD /healthcheck.sh

EXPOSE $PORT

CMD ["node", "dist/graphql.js"]
