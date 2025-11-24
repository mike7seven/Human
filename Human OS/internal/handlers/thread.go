// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Thread handlers manage cognitive processes - both foreground (active attention)
// and background (passive/diffuse processing). This models how the mind actually
// works: some things need focused attention, others benefit from "background processing".
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// ThreadHandler handles thread-related endpoints
type ThreadHandler struct {
	db *database.DB
}

// NewThreadHandler creates a new thread handler
func NewThreadHandler(db *database.DB) *ThreadHandler {
	return &ThreadHandler{db: db}
}

// SpawnThread handles POST /api/v1/thread/spawn
// Spawning a thread creates a new cognitive process. Foreground threads
// require active attention; background threads run in diffuse mode.
// Time scope helps categorize the thread's expected duration and priority.
func (h *ThreadHandler) SpawnThread(c *gin.Context) {
	var req models.ThreadSpawnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	thread := &models.Thread{
		ID:        uuid.New().String(),
		Name:      req.ThreadName,
		Mode:      req.Mode,
		TimeScope: req.TimeScope,
		Status:    "active",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.db.CreateThread(thread); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to spawn thread",
			err.Error(),
		))
		return
	}

	modeDescription := "FOREGROUND - active attention required"
	if req.Mode == models.ThreadModeBackground {
		modeDescription = "BACKGROUND - diffuse processing activated"
	}

	c.JSON(http.StatusCreated, models.ThreadResponse{
		Message:   "Thread spawned: " + modeDescription,
		ThreadID:  thread.ID,
		Thread:    thread,
		Timestamp: now,
	})
}

// BackgroundThread handles POST /api/v1/thread/background
// This is a convenience endpoint for spawning background threads specifically.
// Background threads are for things that benefit from "sleeping on it" -
// letting the subconscious work on problems while you focus elsewhere.
func (h *ThreadHandler) BackgroundThread(c *gin.Context) {
	var req models.ThreadBackgroundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	thread := &models.Thread{
		ID:        uuid.New().String(),
		Name:      req.ThreadName,
		Mode:      models.ThreadModeBackground,
		TimeScope: "ongoing",
		Goal:      req.Goal,
		Status:    "active",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.db.CreateThread(thread); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to create background thread",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusCreated, models.ThreadResponse{
		Message:   "Background thread activated. Let your subconscious work on: " + req.Goal,
		ThreadID:  thread.ID,
		Thread:    thread,
		Timestamp: now,
	})
}

// TerminateThread handles DELETE /api/v1/thread/terminate
// Terminating threads based on a rule is a batch cleanup operation.
// Common rules include "keep only today's tasks" which helps with daily reset,
// or matching patterns to clean up specific categories of work.
func (h *ThreadHandler) TerminateThread(c *gin.Context) {
	var req models.ThreadTerminateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	affected, err := h.db.TerminateThreadsByRule(req.Rule)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to terminate threads",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, models.ThreadResponse{
		Message:   "Thread cleanup complete. Terminated threads based on rule: " + req.Rule,
		Timestamp: time.Now().UTC(),
	})

	// Note: Even if affected == 0, we return success because the rule was applied
	_ = affected
}
