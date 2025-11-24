// Package routes configures all API routes for the Human OS Cognitive API.
// Routes are organized by cognitive domain: focus, loops, threads, ingestion,
// archiving, prediction, emotion, AI integration, and mode control.
package routes

import (
	"github.com/gin-gonic/gin"

	"humanos-api/internal/database"
	"humanos-api/internal/handlers"
	"humanos-api/internal/middleware"
	"humanos-api/internal/services"
)

// Setup configures all routes and middleware for the API
func Setup(db *database.DB) *gin.Engine {
	// Create Gin router
	router := gin.New()

	// Apply global middleware
	router.Use(middleware.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Create services
	cognitiveService := services.NewCognitiveStateService(db)

	// Create handlers
	focusHandler := handlers.NewFocusHandler(db, cognitiveService)
	loopHandler := handlers.NewLoopHandler(db)
	threadHandler := handlers.NewThreadHandler(db)
	ingestHandler := handlers.NewIngestHandler(db)
	archiveHandler := handlers.NewArchiveHandler(db)
	predictHandler := handlers.NewPredictHandler(db)
	emotionHandler := handlers.NewEmotionHandler(db)
	aiHandler := handlers.NewAIHandler(db)
	modeHandler := handlers.NewModeHandler(db)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "Human OS Cognitive API",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// ===========================================
		// CORE CONTROL PLANE
		// Focus endpoints - manage attention and deep work
		// ===========================================
		focus := v1.Group("/focus")
		{
			// POST /api/v1/focus/set - Set focus on a specific task
			focus.POST("/set", focusHandler.SetFocus)

			// POST /api/v1/focus/lock - Lock focus to prevent context switching
			focus.POST("/lock", focusHandler.LockFocus)
		}

		// Dashboard endpoint - cognitive status overview
		dashboard := v1.Group("/dashboard")
		{
			// GET /api/v1/dashboard/status - Get complete cognitive state
			dashboard.GET("/status", focusHandler.GetDashboardStatus)
		}

		// ===========================================
		// LOOP MANAGEMENT
		// Open loops drain mental energy - manage them explicitly
		// ===========================================
		loop := v1.Group("/loop")
		{
			// POST /api/v1/loop/authorize - Create and authorize a new loop
			loop.POST("/authorize", loopHandler.AuthorizeLoop)

			// POST /api/v1/loop/close - Close an existing loop
			loop.POST("/close", loopHandler.CloseLoop)

			// DELETE /api/v1/loop/kill - Forcefully terminate loops matching description
			loop.DELETE("/kill", loopHandler.KillLoop)
		}

		// ===========================================
		// THREAD & BACKGROUND JOB CONTROL
		// Manage foreground vs background cognitive processes
		// ===========================================
		thread := v1.Group("/thread")
		{
			// POST /api/v1/thread/spawn - Spawn a new cognitive thread
			thread.POST("/spawn", threadHandler.SpawnThread)

			// POST /api/v1/thread/background - Create a background processing thread
			thread.POST("/background", threadHandler.BackgroundThread)

			// DELETE /api/v1/thread/terminate - Terminate threads based on a rule
			thread.DELETE("/terminate", threadHandler.TerminateThread)
		}

		// ===========================================
		// INGESTION & CLASSIFICATION
		// Capture tasks and ideas before they're lost
		// ===========================================
		ingest := v1.Group("/ingest")
		{
			// POST /api/v1/ingest/task - Ingest a new task
			ingest.POST("/task", ingestHandler.IngestTask)

			// POST /api/v1/ingest/idea - Capture a new idea
			ingest.POST("/idea", ingestHandler.IngestIdea)
		}

		// ===========================================
		// ARCHIVE & COMMIT
		// Close out work and capture lessons
		// ===========================================
		archive := v1.Group("/archive")
		{
			// POST /api/v1/archive/commit - Commit something to the archive
			archive.POST("/commit", archiveHandler.CommitArchive)
		}

		// ===========================================
		// PREDICTION & SCENARIO MODELING
		// Manage mental simulations and planning
		// ===========================================
		predict := v1.Group("/predict")
		{
			// POST /api/v1/predict/run - Start a prediction/scenario model
			predict.POST("/run", predictHandler.RunPrediction)

			// DELETE /api/v1/predict/stop - Stop predictions on a topic
			predict.DELETE("/stop", predictHandler.StopPrediction)
		}

		// ===========================================
		// EMOTION & LOAD
		// Track emotional state and recovery
		// ===========================================
		emotion := v1.Group("/emotion")
		{
			// POST /api/v1/emotion/tag - Tag current emotional state
			emotion.POST("/tag", emotionHandler.TagEmotion)

			// POST /api/v1/emotion/decompress - Start a decompression session
			emotion.POST("/decompress", emotionHandler.Decompress)
		}

		// ===========================================
		// AI INTEGRATION
		// Delegate to and collaborate with AI
		// ===========================================
		ai := v1.Group("/ai")
		{
			// POST /api/v1/ai/offload - Offload a task to AI
			ai.POST("/offload", aiHandler.Offload)

			// POST /api/v1/ai/assist-for-execution - Get AI assistance for execution
			ai.POST("/assist-for-execution", aiHandler.AssistForExecution)
		}

		// ===========================================
		// RESET & RECOVERY
		// System-wide state management
		// ===========================================
		mode := v1.Group("/mode")
		{
			// POST /api/v1/mode/reset-soft - Soft reset (preserve history)
			mode.POST("/reset-soft", modeHandler.SoftReset)

			// POST /api/v1/mode/reset-hard - Hard reset (wipe everything)
			mode.POST("/reset-hard", modeHandler.HardReset)
		}
	}

	return router
}
