// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// AI handlers manage the interface between human cognition and AI assistance.
// Offloading work to AI and getting AI assistance for execution are both
// valuable cognitive strategies - knowing when to delegate vs. do is key.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// AIHandler handles AI-related endpoints
type AIHandler struct {
	db *database.DB
}

// NewAIHandler creates a new AI handler
func NewAIHandler(db *database.DB) *AIHandler {
	return &AIHandler{db: db}
}

// Offload handles POST /api/v1/ai/offload
// Offloading to AI means explicitly delegating a task type (plan, draft,
// refactor, summarize, explore) with a defined scope. This frees up human
// cognitive resources for tasks that require uniquely human judgment.
func (h *AIHandler) Offload(c *gin.Context) {
	var req models.AIOffloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	offload := &models.AIOffload{
		ID:        uuid.New().String(),
		TaskType:  req.TaskType,
		Scope:     req.Scope,
		Status:    "pending",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.db.CreateAIOffload(offload); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to register AI offload",
			err.Error(),
		))
		return
	}

	var taskAdvice string
	switch req.TaskType {
	case "plan":
		taskAdvice = "AI will generate a structured plan. Review and adjust as needed."
	case "draft":
		taskAdvice = "AI will create an initial draft. Expect to edit and refine."
	case "refactor":
		taskAdvice = "AI will propose improvements. Verify they match your intent."
	case "summarize":
		taskAdvice = "AI will compress information. Check for loss of critical details."
	case "explore":
		taskAdvice = "AI will investigate options. Use findings to inform your decision."
	default:
		taskAdvice = "Task delegated to AI. Monitor progress."
	}

	c.JSON(http.StatusOK, models.AIResponse{
		Message:   "Offloaded to AI: " + req.TaskType + " [" + req.Scope + "]. " + taskAdvice,
		ID:        offload.ID,
		Timestamp: now,
	})
}

// AssistForExecution handles POST /api/v1/ai/assist-for-execution
// This is different from offload - here you're still doing the work, but
// getting AI assistance for specific aspects of execution. The human remains
// in the driver's seat; AI is the copilot.
func (h *AIHandler) AssistForExecution(c *gin.Context) {
	var req models.AIAssistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()

	// Log the assist request (using the same offload table for simplicity)
	offload := &models.AIOffload{
		ID:        uuid.New().String(),
		TaskType:  "assist:" + req.AssistanceType,
		Scope:     req.Task,
		Status:    "processing",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.db.CreateAIOffload(offload); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to register assist request",
			err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, models.AIResponse{
		Message:   "AI assistance activated for: " + req.Task + ". Assistance type: " + req.AssistanceType + ". You lead, AI supports.",
		ID:        offload.ID,
		Timestamp: now,
	})
}
