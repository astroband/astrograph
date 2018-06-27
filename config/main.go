package config

import (
	"fmt"
	"github.com/jmoiron/sqlx"
	"gopkg.in/alecthomas/kingpin.v2"
	log "github.com/sirupsen/logrus"
	sq "github.com/Masterminds/squirrel"
)

// Application version
const Version string = "0.0.1"

var (
	BindAndPort    string
	DatabaseDriver string
	DB             *sqlx.DB
	SqlBuilder     sq.StatementBuilderType

	Port          = kingpin.Flag("port", "HTTP port to bind").Default("8000").Int()
	Bind          = kingpin.Flag("bind", "HTTP address to bind").Default("127.0.0.1").IP()
	DatabaseUrl   = kingpin.Flag("database-url", "Stellar Core database URL").Required().URL()
	IngestTimeout = kingpin.Flag("ingest-timeout", "Ingest frequency").Default("2").Int()
	Debug         = kingpin.Flag("debug", "Log debug messages").Default("false").Bool()
	StartLedger   = kingpin.Flag("start-ledger", "Start with ledger (debug)").Uint64()
)

func init() {
	kingpin.Version(Version)
	kingpin.Parse()

	if (*Debug) {
		log.SetLevel(log.DebugLevel)
	}

	log.SetFormatter(&log.TextFormatter{FullTimestamp: true})

	BindAndPort = fmt.Sprintf("%s:%v", *Bind, *Port)
	DatabaseDriver = (*DatabaseUrl).Scheme

	db, err := sqlx.Connect(DatabaseDriver, (*DatabaseUrl).String())
	if err != nil {
		log.Fatal(err)
	}

	DB = db
	SqlBuilder = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
}
