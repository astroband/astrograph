FROM golang:1.9-alpine

ENV ASTROGRAPH_CONFIG /root/.astrograph # In k8s this file must be provided directly, see docker_entrypoint.sh
ENV ASTROGRAPH_PORT 8000
ENV ASTROGRAPH_DATABASE_URL postgres://gzigzigzeo@docker.for.mac.localhost/core?sslmode=disable
ENV ASTROGRAPH_INGEST_TIMEOUT 2
ENV ASTROGRAPH_BIND 0.0.0.0

LABEL maintainer="Viktor Sokolov <vs@evl.ms>"

RUN apk add --update --no-cache ca-certificates git mercurial openssh bash

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
RUN go install github.com/mobius-network/astrograph

COPY docker_entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/go/bin/astrograph", "@/root/.astrograph_cmd"]
EXPOSE ${ASTROGRAPH_PORT}
