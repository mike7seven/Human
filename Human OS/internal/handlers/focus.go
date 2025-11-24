// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Focus handlers manage the core attention mechanism - setting and locking focus
// on specific tasks to enable deep work and prevent context switching.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
	"humanos-api/internal/services"
)

// FocusHandler handles focus-related endpoints
type FocusHandler struct {
	db      *database.DB
	service *services.CognitiveStateService
}

// NewFocusHandler creates a new focus handler
func NewFocusHandler(db *database.DB, service *services.CognitiveStateService) *FocusHandler {
	return &FocusHandler{
		db:      db,
		service: service,
	}
}

// SetFocus handles POST /api/v1/focus/set
// This endpoint is the primary way to direct attention to a specific task.
// Setting focus creates a time-bounded commitment to work on something,
// with clear success criteria for knowing when you're done.
func (h *FocusHandler) SetFocus(c *gin.Context) {
	var req models.FocusSetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	// Parse duration to calculate end time
	now := time.Now().UTC()
	endTime, err := services.CalculateEndTime(now, req.Duration)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(
			"Invalid duration format",
			"Duration should be in format like '25m', '50m', '90m', '2h'",
		))
		return
	}

	// Create focus state
	focus := &models.FocusState{
		ID:              uuid.New().String(),
		TaskName:        req.TaskName,
		Duration:        req.Duration,
		SuccessCriteria: req.SuccessCriteria,
		IsLocked:        false,
		StartedAt:       now,
		EndsAt:          endTime,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if err := h.db.SetFocus(focus); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to set focus",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, models.FocusResponse{
		Message:   "Focus set successfully. Deep work mode activated.",
		Focus:     focus,
		Timestamp: now,
	})
}

// LockFocus handles POST /api/v1/focus/lock
// Lock focus is a stronger commitment - it signals that you should NOT
// switch away from this task until the timebox expires or you achieve
// the goal. The fallback field specifies what to do if you get stuck.
func (h *FocusHandler) LockFocus(c *gin.Context) {
	var req models.FocusLockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	// Get current focus or create a new locked focus
	currentFocus, err := h.db.GetCurrentFocus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to get current focus",
			err.Error(),
		))
		return
	}

	now := time.Now().UTC()

	if currentFocus != nil {
		// Update existing focus to locked state
		if err := h.db.UpdateFocusLock(currentFocus.ID, true, req.Timebox, req.Fallback); err != nil {
			c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
				"Failed to lock focus",
				err.Error(),
			))
			return
		}
		currentFocus.IsLocked = true
		currentFocus.Timebox = req.Timebox
		currentFocus.Fallback = req.Fallback
	} else {
		// Create new locked focus
		endTime, err := services.CalculateEndTime(now, req.Timebox)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.NewErrorResponse(
				"Invalid timebox format",
				"Timebox should be in format like '25m', '50m', '90m', '2h'",
			))
			return
		}

		currentFocus = &models.FocusState{
			ID:              uuid.New().String(),
			TaskName:        req.TaskName,
			Duration:        req.Timebox,
			SuccessCriteria: "Complete the task or timebox expires",
			IsLocked:        true,
			Timebox:         req.Timebox,
			Fallback:        req.Fallback,
			StartedAt:       now,
			EndsAt:          endTime,
			CreatedAt:       now,
			UpdatedAt:       now,
		}

		if err := h.db.SetFocus(currentFocus); err != nil {
			c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
				"Failed to create locked focus",
				err.Error(),
			))
			return
		}
	}

	c.JSON(http.StatusOK, models.FocusResponse{
		Message:   "Focus LOCKED. Do not context switch until timebox expires.",
		Focus:     currentFocus,
		Timestamp: now,
	})
}

// GetDashboardStatus handles GET /api/v1/dashboard/status
// The dashboard provides a complete view of your current cognitive state,
// including active threads, open loops, emotional load, and energy level.
// Use this to get situational awareness before making decisions.
func (h *FocusHandler) GetDashboardStatus(c *gin.Context) {
	status, err := h.service.GetDashboardStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to get dashboard status",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, status)
}
