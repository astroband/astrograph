package config

import (
	"context"
	"database/sql"
	d "database/sql/driver"
	"fmt"
	"github.com/gchaincl/sqlhooks"
	"github.com/lib/pq"
	"github.com/mattn/go-sqlite3"
	"gopkg.in/alecthomas/kingpin.v2"
	"log"
	"time"
)

// Application version
const Version string = "0.0.1"

var (
	BindAndPort    string
	DatabaseDriver string
	Db             *sql.DB

	Port          = kingpin.Flag("port", "HTTP port to bind").Default("8000").Int()
	Bind          = kingpin.Flag("bind", "HTTP address to bind").Default("127.0.0.1").IP()
	DatabaseUrl   = kingpin.Flag("database-url", "Stellar Core database URL").Required().URL()
	IngestTimeout = kingpin.Flag("ingest-timeout", "Ingest frequency").Default("2").Int()
	Debug         = kingpin.Flag("debug", "Log debug messages").Default("false").Bool()
)

// Drivers list for sqlhooks wrapping
var drivers = map[string]d.Driver{
	"postgres": &pq.Driver{},
	"sqlite3":  &sqlite3.SQLiteDriver{},
}

// sqlhooks
type hooks struct{}

func (h *hooks) Before(ctx context.Context, query string, args ...interface{}) (context.Context, error) {
	log.Printf("> %s %q", query, args)
	return context.WithValue(ctx, "begin", time.Now()), nil
}

func (h *hooks) After(ctx context.Context, query string, args ...interface{}) (context.Context, error) {
	begin := ctx.Value("begin").(time.Time)
	log.Printf(". took: %s\n", time.Since(begin))
	return ctx, nil
}

func (h *hooks) OnError(ctx context.Context, err error, query string, args ...interface{}) error {
	log.Printf("> %s %q", query, args)
	log.Printf("> [FATAL] %v", err)
	return err
}

func init() {
	kingpin.Version(Version)
	kingpin.Parse()

	BindAndPort = fmt.Sprintf("%s:%v", *Bind, *Port)
	DatabaseDriver = (*DatabaseUrl).Scheme

	driver := DatabaseDriver

	if *Debug {
		sql.Register("sqlWithHooks", sqlhooks.Wrap(drivers[driver], &hooks{}))
		driver = "sqlWithHooks"
	}

	db, err := sql.Open(driver, (*DatabaseUrl).String())
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	Db = db
}
