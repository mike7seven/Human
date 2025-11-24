// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Archive handlers manage the commit/archive process - the deliberate act of
// closing out work and capturing lessons learned. This is crucial for both
// reducing cognitive load and building accumulated wisdom.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// ArchiveHandler handles archive-related endpoints
type ArchiveHandler struct {
	db *database.DB
}

// NewArchiveHandler creates a new archive handler
func NewArchiveHandler(db *database.DB) *ArchiveHandler {
	return &ArchiveHandler{db: db}
}

// CommitArchive handles POST /api/v1/archive/commit
// Committing to the archive is like a git commit for your brain - it marks
// something as "done" and optionally captures what you learned from it.
// The lesson field is optional but highly valuable for pattern recognition.
func (h *ArchiveHandler) CommitArchive(c *gin.Context) {
	var req models.ArchiveCommitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	archive := &models.Archive{
		ID:        uuid.New().String(),
		Object:    req.Object,
		Summary:   req.Summary,
		Lesson:    req.Lesson,
		CreatedAt: now,
	}

	if err := h.db.CreateArchive(archive); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to commit archive",
			err.Error(),
		))
		return
	}

	message := "Archived: " + req.Object + ". Summary recorded."
	if req.Lesson != "" {
		message += " Lesson captured for future reference."
	}

	c.JSON(http.StatusOK, models.ArchiveResponse{
		Message:   message,
		ArchiveID: archive.ID,
		Timestamp: now,
	})
}
