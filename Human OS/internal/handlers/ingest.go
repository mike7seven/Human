// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Ingest handlers capture incoming information - tasks and ideas - before they
// slip away. This is the "capture" phase of GTD: get it out of your head and
// into a trusted system quickly.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// IngestHandler handles ingestion-related endpoints
type IngestHandler struct {
	db *database.DB
}

// NewIngestHandler creates a new ingest handler
func NewIngestHandler(db *database.DB) *IngestHandler {
	return &IngestHandler{db: db}
}

// IngestTask handles POST /api/v1/ingest/task
// Tasks are actionable items that need to be processed. The Eisenhower matrix
// (urgency x importance) helps prioritize: high/high = do first, high/low = delegate,
// low/high = schedule, low/low = drop or backlog.
func (h *IngestHandler) IngestTask(c *gin.Context) {
	var req models.IngestTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	task := &models.Task{
		ID:          uuid.New().String(),
		Description: req.Description,
		Category:    req.Category,
		Urgency:     req.Urgency,
		Importance:  req.Importance,
		Status:      "pending",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := h.db.CreateTask(task); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to ingest task",
			err.Error(),
		))
		return
	}

	// Provide context-aware message based on urgency/importance
	var priorityAdvice string
	switch {
	case req.Urgency == models.PriorityHigh && req.Importance == models.PriorityHigh:
		priorityAdvice = "CRITICAL: Schedule immediately or do now."
	case req.Urgency == models.PriorityHigh && req.Importance != models.PriorityHigh:
		priorityAdvice = "URGENT but not critical: Consider delegating or timeboxing."
	case req.Urgency != models.PriorityHigh && req.Importance == models.PriorityHigh:
		priorityAdvice = "IMPORTANT: Schedule dedicated time for this."
	default:
		priorityAdvice = "LOW priority: Backlog or consider dropping."
	}

	c.JSON(http.StatusCreated, models.IngestResponse{
		Message:   "Task captured in category '" + req.Category + "'. " + priorityAdvice,
		ID:        task.ID,
		Timestamp: now,
	})
}

// IngestIdea handles POST /api/v1/ingest/idea
// Ideas are non-actionable captures - things to remember, explore, or reference.
// The storage field indicates where the idea should ultimately live (logbook, Notion, etc.).
// The action_now flag indicates if this idea requires immediate attention.
func (h *IngestHandler) IngestIdea(c *gin.Context) {
	var req models.IngestIdeaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	idea := &models.Idea{
		ID:        uuid.New().String(),
		Summary:   req.IdeaSummary,
		Storage:   req.Storage,
		ActionNow: req.ActionNow,
		Status:    "captured",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.db.CreateIdea(idea); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to ingest idea",
			err.Error(),
		))
		return
	}

	message := "Idea captured. Destination: " + req.Storage + "."
	if req.ActionNow {
		message += " FLAG: Requires immediate attention."
	} else {
		message += " It's safe in the system - let it go for now."
	}

	c.JSON(http.StatusCreated, models.IngestResponse{
		Message:   message,
		ID:        idea.ID,
		Timestamp: now,
	})
}
