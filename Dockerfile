FROM golang:1.10-alpine AS build

LABEL maintainer="Viktor Sokolov <vs@evl.ms>"

RUN apk add --update --no-cache git

WORKDIR /go/src/github.com/mobius-network/astrograph

RUN go get -u github.com/golang/dep/cmd/dep

COPY config ./config
COPY dataloader ./dataloader
COPY db ./db
COPY graph ./graph
COPY ingest ./ingest
COPY model ./model
COPY util ./util
COPY Gopkg.lock .
COPY Gopkg.toml .
COPY main.go .
COPY schema.graphql .

RUN dep ensure -v

ARG CGO_ENABLED=0
ARG GOARCH=amd64

RUN go install github.com/mobius-network/astrograph

# ===============================================================

FROM busybox:1.28.4

ENV ASTROGRAPH_CONFIG /home/.astrograph
ENV ASTROGRAPH_PORT 8000
ENV ASTROGRAPH_DATABASE_URL postgres://gzigzigzeo@docker.for.mac.localhost/core?sslmode=disable
ENV ASTROGRAPH_INGEST_TIMEOUT 2
ENV ASTROGRAPH_BIND 0.0.0.0

LABEL maintainer="Viktor Sokolov <vs@evl.ms>"

COPY --from=build /go/bin/astrograph /usr/local/bin/astrograph
COPY docker_entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

USER nobody
WORKDIR /home

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh", "-c", "/usr/local/bin/astrograph @$ASTROGRAPH_CONFIG"]
EXPOSE ${ASTROGRAPH_PORT}
