package main

import (
	"log"
	"time"
	"net/http"

	"github.com/gorilla/websocket"
	gqlopentracing "github.com/vektah/gqlgen/opentracing"

	"github.com/vektah/gqlgen/handler"
	"github.com/mobius-network/stellar-graphql-server/graph"
	"github.com/mobius-network/stellar-graphql-server/config"
)

var app = &graph.App{
	Channels: make(map[string]chan graph.Account),
}

func simulateAccountActivity() {
  for {
    time.Sleep(2 * time.Second)
		ch := app.Channels["TEST"]
		if (ch != nil) {
			a := graph.Account{
				ID: "TEST",
				Balance: int(time.Now().UTC().Unix()),
			}
			ch <- a
			log.Println("Tick...")
		}
  }
}

func main() {
	http.Handle("/", handler.Playground("Todo", "/query"))
	http.Handle("/query", handler.GraphQL(graph.MakeExecutableSchema(app),
		handler.ResolverMiddleware(gqlopentracing.ResolverMiddleware()),
		handler.RequestMiddleware(gqlopentracing.RequestMiddleware()),
		handler.WebsocketUpgrader(websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		})),
	)

	go simulateAccountActivity();

	log.Println("Stellar GraphQL Server")
	log.Println("Listening on", config.BindAndPort)
	log.Fatal(http.ListenAndServe(config.BindAndPort, nil))

}

// package main
//
// import (
// 	"database/sql"
// 	"fmt"
// 	"time"
// 	"github.com/lib/pq"
// )
//
// func waitForNotification(l *pq.Listener) {
// 	for {
// 		select {
// 		case n := <-l.Notify:
// 			fmt.Println("Received data from channel [", n.Channel, "] :")
// 			fmt.Println(n.Extra)
// 			return
// 		case <-time.After(90 * time.Second):
// 			fmt.Println("Received no events for 90 seconds, checking connection")
// 			go func() {
// 				l.Ping()
// 			}()
// 			return
// 		}
// 	}
// }
//
// func main() {
// 	var conninfo string = "dbname=core sslmode=disable"
//
// 	_, err := sql.Open("postgres", conninfo)
// 	if err != nil {
// 		panic(err)
// 	}
//
// 	reportProblem := func(ev pq.ListenerEventType, err error) {
//     fmt.Println("Problem...")
// 		if err != nil {
// 			fmt.Println(err.Error())
// 		}
// 	}
//
// 	listener := pq.NewListener(conninfo, 10*time.Second, time.Minute, reportProblem)
// 	err = listener.Listen("accounts")
// 	if err != nil {
// 		panic(err)
// 	}
//
// 	fmt.Println("Start monitoring PostgreSQL...")
// 	for {
// 		waitForNotification(listener)
// 	}
// }
