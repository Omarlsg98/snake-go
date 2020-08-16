package model

import "time"

// Player is a model in the "players" table.
type Player struct {
	ID        uint `gorm:"primary_key"`
	CreatedAt time.Time
	UserName  string  `gorm:"unique;not null"`
	Scores    []Score `gorm:"foreignkey:UserID"`
}

// Score is a model in the "scores" table.
type Score struct {
	ID        uint `gorm:"primary_key"`
	CreatedAt time.Time
	Score     int `gorm:"not null"`
	UserID    uint
}

/*
type Customer struct {
	ID   int     `json:"id,omitempty"`
	Name *string `json:"name" gorm:"not null"`
}

// Order is a model in the "orders" table.
type Order struct {
	ID       int     `json:"id,omitempty"`
	Subtotal float64 `json:"subtotal,string" gorm:"type:decimal(18,2)"`

	Customer   Customer `json:"customer" gorm:"ForeignKey:CustomerID"`
	CustomerID int      `json:"-"`

	Products []Product `json:"products" gorm:"many2many:order_products"`
}

// Product is a model in the "products" table.
type Product struct {
	ID    int     `json:"id,omitempty"`
	Name  *string `json:"name"  gorm:"not null;unique"`
	Price float64 `json:"price,string" gorm:"type:decimal(18,2)"`
}
*/
