package main

import (
	"time"
	"net/http"

	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
	"github.com/mobius-network/astrograph/graph"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/ingest"
	"github.com/mobius-network/astrograph/config"
	"github.com/mobius-network/astrograph/dataloader"
	gqlopentracing "github.com/vektah/gqlgen/opentracing"

	"github.com/vektah/gqlgen/handler"
)

var app *graph.App
var core *ingest.Core

func init() {
	app = &graph.App{}
	app.AccountChannels = make(map[string]chan model.Account)
	app.AccountCounters = make(map[string]uint64)

	core = ingest.NewCore()
}

func startIngest() {
	ticker := time.NewTicker(time.Second * time.Duration(*config.IngestTimeout))

	go func() {
		for _ = range ticker.C {
			accounts := core.Pull()
			app.SendAccountUpdates(accounts)
		}
	}()
}

func main() {
	http.Handle("/", handler.Playground("Stellar", "/query"))
	http.Handle(
		"/query",
		dataloader.SignerLoaderMiddleware(
			dataloader.DataEntryLoaderMiddleware(
				dataloader.TrustLineLoaderMiddleware(
					handler.GraphQL(
						graph.MakeExecutableSchema(app),
						handler.ResolverMiddleware(gqlopentracing.ResolverMiddleware()),
						handler.RequestMiddleware(gqlopentracing.RequestMiddleware()),
						handler.WebsocketUpgrader(websocket.Upgrader{
							CheckOrigin: func(r *http.Request) bool {
								return true
							},
						}),
					),
				),
			),
		),
	)

	log.Info("Stellar GraphQL Server")
	log.WithFields(log.Fields{"bind_and_port": config.BindAndPort}).Info("Listening")
	log.WithFields(log.Fields{"ledgerseq": core.LedgerSeq}).Info("Current ledger sequence")
	log.WithFields(log.Fields{"timeout": *config.IngestTimeout}).Info("Ingest timeout set")

	startIngest()

	log.Fatal(http.ListenAndServe(config.BindAndPort, nil))
}
