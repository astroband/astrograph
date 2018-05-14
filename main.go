package main

import (
	"log"
	"net/http"

	"github.com/vektah/gqlgen/handler"
	"github.com/mobius-network/mobius-stellar-notifications/graph"
	"github.com/mobius-network/mobius-stellar-notifications/config"
)

func main() {
	app := &graph.App{}
	http.Handle("/", handler.Playground("Todo", "/query"))
	http.Handle("/query", handler.GraphQL(graph.MakeExecutableSchema(app)))

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
