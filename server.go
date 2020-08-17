package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm"
	"snake.com/model"
)

// Server is an http server that handles REST requests.
type Server struct {
	db *gorm.DB
}

// Page is a struct to handle html files
type Page struct {
	Title string
	Body  []byte
}

func loadPage(title string) (*Page, error) {
	filename := title + ".html"
	body, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	return &Page{Title: title, Body: body}, nil
}

// NewServer creates a new instance of a Server.
func NewServer(db *gorm.DB) *Server {
	return &Server{db: db}
}

// RegisterRouter registers a router onto the Server.
func (s *Server) RegisterRouter(router chi.Router) {
	router.Route("/snake", func(router chi.Router) {
		router.Get("/", s.getGame)

		router.Get("/player", s.getPlayers)
		router.Post("/player", s.addPlayer)

		router.Get("/score", s.getScores)
		//router.Get("/score/{username}", s.getUserScores)
		router.Post("/score/{username}", s.addScore)
	})
}

func (s *Server) getGame(w http.ResponseWriter, r *http.Request) {
	if page, err := loadPage("index"); err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
	} else {
		fmt.Fprintf(w, "%s", page.Body)
	}
}

func (s *Server) getPlayers(w http.ResponseWriter, r *http.Request) {
	var players []model.Player
	if err := s.db.Find(&players).Error; err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
	} else {
		writeJSONResult(w, players)
	}
}

func (s *Server) getScores(w http.ResponseWriter, r *http.Request) {
	var scores []model.Score
	if err := s.db.Find(&scores).Error; err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
	} else {
		writeJSONResult(w, scores)
	}
}

func (s *Server) addScore(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")

	var player model.Player
	if err := s.db.Where("user_name = ?", username).First(&player).Error; err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
		return
	}

	var score model.Score
	if err := json.NewDecoder(r.Body).Decode(&score); err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
		return
	}

	if score.Score == 0 || username == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}
	score.UserID = player.ID

	if err := s.db.Create(&score).Error; err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
	} else {
		writeJSONResult(w, score)
	}
}

func (s *Server) addPlayer(w http.ResponseWriter, r *http.Request) {

	var player model.Player
	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
		return
	}

	if player.UserName == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}

	if err := s.db.Create(&player).Error; err != nil {
		http.Error(w, err.Error(), errToStatusCode(err))
	} else {
		writeJSONResult(w, player)
	}
}

func writeJSONResult(w http.ResponseWriter, res interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(res); err != nil {
		panic(err)
	}
}

func errToStatusCode(err error) int {
	switch err {
	case gorm.ErrRecordNotFound:
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}
