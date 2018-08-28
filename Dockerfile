FROM node:8

ENV NODE_ENV production
ENV PORT 4000
ENV DB "core"
ENV DBPORT "5432"
ENV DBHOST "docker.for.mac.localhost"
ENV DBUSER "postgres"
ENV DBPASSWORD ""
ENV INGEST_INTERVAL 2000

RUN mkdir -p /opt/app

EXPOSE $PORT

WORKDIR /opt
COPY package.json package-lock.json* ./
RUN yarn install
ENV PATH /opt/node_modules/.bin:$PATH
# HEALTHCHECK --interval=30s CMD node healthcheck.js
WORKDIR /opt/app
COPY . /opt/app

CMD [ "yarn", "run", "prod" ]
