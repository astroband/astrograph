package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	gqlopentracing "github.com/vektah/gqlgen/opentracing"

	"github.com/mobius-network/astrograph/config"
	"github.com/mobius-network/astrograph/dataloader"
	"github.com/mobius-network/astrograph/graph"
	"github.com/mobius-network/astrograph/ingest"
	"github.com/mobius-network/astrograph/model"
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
	defer config.Db.Close()

	http.Handle("/", handler.Playground("Stellar", "/query"))
	http.Handle(
		"/query",
		dataloader.TrustlineLoaderMiddleware(
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
	)

	log.Println("Stellar GraphQL Server")
	log.Println("Listening on", config.BindAndPort)
	log.Println("Current ledger sequence number:", core.LedgerSeq)
	log.Println("Ingest every", *config.IngestTimeout, "seconds")

	startIngest()

	log.Fatal(http.ListenAndServe(config.BindAndPort, nil))
}
