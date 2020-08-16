package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"snake.com/model"
)

var (
	addr = flag.String("addr", "postgresql://omar@localhost:26257/snake_game?sslmode=disable", "the address of the database")
)

func main() {
	fmt.Println("Starting...")
	flag.Parse()
	Prueba()
	db := setupDB(*addr)
	defer db.Close()

	server := NewServer(db)
	router := chi.NewRouter()
	server.RegisterRouter(router)

	log.Fatal(http.ListenAndServe(":6543", router))
	fmt.Println("Server running!")
}

func setupDB(addr string) *gorm.DB {
	db, err := gorm.Open("postgres", addr)
	if err != nil {
		panic(fmt.Sprintf("failed to connect to database: %v", err))
	}
	fmt.Println("Succesful connection to database")
	// Migrate the schema
	db.AutoMigrate(&model.Player{}, &model.Score{})

	return db
}
