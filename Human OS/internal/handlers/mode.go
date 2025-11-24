// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Mode handlers manage system-wide resets and recovery. Soft reset clears
// active state while preserving history; hard reset is a complete wipe.
// These are essential for getting "unstuck" and starting fresh.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// ModeHandler handles mode/reset-related endpoints
type ModeHandler struct {
	db *database.DB
}

// NewModeHandler creates a new mode handler
func NewModeHandler(db *database.DB) *ModeHandler {
	return &ModeHandler{db: db}
}

// SoftReset handles POST /api/v1/mode/reset-soft
// A soft reset clears active cognitive state (focus, active threads,
// running predictions) while preserving historical data (archives, closed loops).
// Use this for a "fresh start" to the day without losing accumulated wisdom.
func (h *ModeHandler) SoftReset(c *gin.Context) {
	if err := h.db.SoftReset(); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to perform soft reset",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, models.ResetResponse{
		Message:   "SOFT RESET complete. Active focus cleared, threads terminated, loops closed. Archives preserved. Fresh cognitive slate.",
		ResetType: "soft",
		Timestamp: time.Now().UTC(),
	})
}

// HardReset handles POST /api/v1/mode/reset-hard
// A hard reset wipes EVERYTHING - all state, all history, all archives.
// This is the nuclear option. Use only when you need to start completely
// from zero, perhaps after a major life change or system corruption.
func (h *ModeHandler) HardReset(c *gin.Context) {
	if err := h.db.HardReset(); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to perform hard reset",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, models.ResetResponse{
		Message:   "HARD RESET complete. All cognitive state wiped. Total restart. Use wisely.",
		ResetType: "hard",
		Timestamp: time.Now().UTC(),
	})
}
