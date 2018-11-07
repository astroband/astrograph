# ====================================================================================================

FROM node:10-alpine AS build

ENV NODE_ENV="production"

# Packages
RUN apk add --no-cache libc6-compat curl python g++ make postgresql-dev

WORKDIR /root

COPY src ./src
COPY types ./types
COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .

RUN yarn install --production=false
RUN yarn build

# ====================================================================================================

FROM node:10-alpine

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
