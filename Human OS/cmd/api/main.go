// Human OS Cognitive API
//
// This is a self-regulation interface for managing mental processes.
// Unlike typical CRUD APIs, each endpoint represents a cognitive operation:
// - Focus management for deep work
// - Loop tracking to reduce mental load
// - Thread control for parallel cognitive processes
// - Emotional awareness and regulation
// - AI integration for cognitive offloading
//
// Run with: go run cmd/api/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"humanos-api/api/routes"
	"humanos-api/internal/config"
	"humanos-api/internal/database"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := database.New(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	// Setup router
	router := routes.Setup(db)

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("╔══════════════════════════════════════════════════════╗")
		log.Printf("║         Human OS Cognitive API v1.0.0                ║")
		log.Printf("╠══════════════════════════════════════════════════════╣")
		log.Printf("║  Environment: %-39s ║", cfg.Env)
		log.Printf("║  Port:        %-39s ║", cfg.Port)
		log.Printf("║  Database:    %-39s ║", cfg.DatabasePath)
		log.Printf("╠══════════════════════════════════════════════════════╣")
		log.Printf("║  Endpoints:                                          ║")
		log.Printf("║    GET  /health              - Health check          ║")
		log.Printf("║    GET  /api/v1/dashboard/status - Cognitive status  ║")
		log.Printf("║    POST /api/v1/focus/set    - Set focus             ║")
		log.Printf("║    POST /api/v1/focus/lock   - Lock focus            ║")
		log.Printf("║    POST /api/v1/loop/*       - Loop management       ║")
		log.Printf("║    POST /api/v1/thread/*     - Thread control        ║")
		log.Printf("║    POST /api/v1/ingest/*     - Task/idea capture     ║")
		log.Printf("║    POST /api/v1/emotion/*    - Emotional awareness   ║")
		log.Printf("║    POST /api/v1/mode/*       - Reset/recovery        ║")
		log.Printf("╚══════════════════════════════════════════════════════╝")
		log.Printf("Server starting on http://localhost:%s", cfg.Port)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Create deadline context for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}
