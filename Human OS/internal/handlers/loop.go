// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Loop handlers manage "open loops" - unresolved commitments that occupy mental
// bandwidth. Closing loops is essential for reducing cognitive load and anxiety.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// LoopHandler handles loop-related endpoints
type LoopHandler struct {
	db *database.DB
}

// NewLoopHandler creates a new loop handler
func NewLoopHandler(db *database.DB) *LoopHandler {
	return &LoopHandler{db: db}
}

// AuthorizeLoop handles POST /api/v1/loop/authorize
// Authorizing a loop means formally acknowledging it and deciding where it
// belongs. This is the first step in GTD-style capture: you recognize the
// open loop and place it in the appropriate queue (action, reference, or backburner).
func (h *LoopHandler) AuthorizeLoop(c *gin.Context) {
	var req models.LoopAuthorizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	loop := &models.Loop{
		ID:          uuid.New().String(),
		Description: req.Description,
		Priority:    req.Priority,
		Queue:       req.Queue,
		Owner:       req.Owner,
		Status:      "open",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := h.db.CreateLoop(loop); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to authorize loop",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusCreated, models.LoopResponse{
		Message:   "Loop authorized and tracked. Cognitive load acknowledged.",
		LoopID:    loop.ID,
		Loop:      loop,
		Timestamp: now,
	})
}

// CloseLoop handles POST /api/v1/loop/close
// Closing a loop completes the cognitive cycle. You can close a loop as:
// - "done": The commitment is fulfilled
// - "paused": Intentionally set aside with a clear next step
// - "abandoned": Deliberately dropped (this is valid and healthy!)
func (h *LoopHandler) CloseLoop(c *gin.Context) {
	var req models.LoopCloseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	// Verify the loop exists
	loop, err := h.db.GetLoop(req.LoopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to find loop",
			err.Error(),
		))
		return
	}
	if loop == nil {
		c.JSON(http.StatusNotFound, models.NewErrorResponse(
			"Loop not found",
			"No loop exists with the provided ID",
		))
		return
	}
	if loop.Status == "closed" {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(
			"Loop already closed",
			"This loop has already been closed",
		))
		return
	}

	// Close the loop
	if err := h.db.CloseLoop(req.LoopID, req.ClosureType, req.NextStep); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to close loop",
			err.Error(),
		))
		return
	}

	message := "Loop closed successfully."
	switch req.ClosureType {
	case models.ClosureDone:
		message = "Loop CLOSED - commitment fulfilled. Cognitive load reduced."
	case models.ClosurePaused:
		message = "Loop PAUSED - intentionally set aside with next step noted."
	case models.ClosureAbandoned:
		message = "Loop ABANDONED - consciously dropped. This is a valid choice."
	}

	c.JSON(http.StatusOK, models.LoopResponse{
		Message:   message,
		LoopID:    req.LoopID,
		Timestamp: time.Now().UTC(),
	})
}

// KillLoop handles DELETE /api/v1/loop/kill
// Kill is a forceful termination of a loop based on its description.
// Use this when you realize something is "non-actionable" or "out of my control".
// This is a cognitive hygiene operation - removing mental clutter.
func (h *LoopHandler) KillLoop(c *gin.Context) {
	var req models.LoopKillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	affected, err := h.db.KillLoopByDescription(req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to kill loop",
			err.Error(),
		))
		return
	}

	if affected == 0 {
		c.JSON(http.StatusNotFound, models.NewErrorResponse(
			"No matching loops found",
			"No open loops matched the provided description",
		))
		return
	}

	c.JSON(http.StatusOK, models.LoopResponse{
		Message:   "Loop(s) KILLED. Mental bandwidth reclaimed. Reason: " + req.Reason,
		Timestamp: time.Now().UTC(),
	})
}
