FROM node:alpine

LABEL maintainer="Mobius Operations Team <ops@mobius.network>"

# Env vars
ENV NODE_ENV="production"
ENV PORT 4000
ENV DB "core"
ENV DBPORT "5432"
ENV DBHOST "docker.for.mac.localhost"
ENV DBUSER "postgres"
ENV DBPASSWORD ""
ENV INGEST_INTERVAL 2000

# Packages
RUN apk add --no-cache libc6-compat curl

# Yarn
ENV YARN_VERSION 1.9.4

RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz

# App dir
RUN mkdir -p /opt/app

# Packages
WORKDIR /opt
COPY package.json package-lock.json* ./
RUN yarn install

ENV PATH /opt/node_modules/.bin:$PATH

# Application
WORKDIR /opt/app
COPY . /opt/app

# HEALTHCHECK --interval=30s CMD node healthcheck.js

EXPOSE $PORT

CMD [ "yarn", "run", "prod" ]
