// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Emotion handlers support emotional awareness and regulation. Tagging emotions
// creates self-awareness; decompression provides structured recovery time.
// This is not about suppressing emotions but about conscious management.
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

// EmotionHandler handles emotion-related endpoints
type EmotionHandler struct {
	db *database.DB
}

// NewEmotionHandler creates a new emotion handler
func NewEmotionHandler(db *database.DB) *EmotionHandler {
	return &EmotionHandler{db: db}
}

// TagEmotion handles POST /api/v1/emotion/tag
// Tagging an emotion is a mindfulness exercise - naming what you're feeling
// and hypothesizing about its source. This creates distance and awareness,
// which is the first step in emotional regulation.
func (h *EmotionHandler) TagEmotion(c *gin.Context) {
	var req models.EmotionTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	state := &models.EmotionalState{
		ID:          uuid.New().String(),
		Label:       req.Label,
		SourceGuess: req.SourceGuess,
		CreatedAt:   now,
	}

	if err := h.db.CreateEmotionalState(state); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to tag emotion",
			err.Error(),
		))
		return
	}

	// Provide contextual feedback based on the emotion
	var advice string
	switch req.Label {
	case "angry", "frustrated":
		advice = "Acknowledgment is the first step. Consider what boundary was crossed."
	case "anxious", "worried":
		advice = "Noted. Is this about something in your control? If not, consider letting go."
	case "tired":
		advice = "Energy is finite. Prioritize rest when possible."
	case "overwhelmed":
		advice = "Too many open loops? Consider a reset or loop cleanup."
	case "resentful":
		advice = "Resentment often signals unmet needs. Worth examining."
	default:
		advice = "Emotion logged. Self-awareness is valuable."
	}

	c.JSON(http.StatusOK, models.EmotionResponse{
		Message:   "Emotional state tagged: " + req.Label + ". Possible source: " + req.SourceGuess + ". " + advice,
		ID:        state.ID,
		Timestamp: now,
	})
}

// Decompress handles POST /api/v1/emotion/decompress
// Decompression is structured recovery time - not distraction or numbing,
// but intentional restoration. The method (walk, music, shower, silence)
// and duration create a bounded "recovery window" for emotional reset.
func (h *EmotionHandler) Decompress(c *gin.Context) {
	var req models.EmotionDecompressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	// Parse duration
	now := time.Now().UTC()
	endTime, err := services.CalculateEndTime(now, req.Duration)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(
			"Invalid duration format",
			"Duration should be in format like '10m', '15m', '30m', '1h'",
		))
		return
	}

	session := &models.DecompressSession{
		ID:        uuid.New().String(),
		Method:    req.Method,
		Duration:  req.Duration,
		Status:    "active",
		StartedAt: now,
		EndsAt:    endTime,
		CreatedAt: now,
	}

	if err := h.db.CreateDecompressSession(session); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to start decompression",
			err.Error(),
		))
		return
	}

	var methodAdvice string
	switch req.Method {
	case "walk":
		methodAdvice = "Movement helps process emotions. Don't rush."
	case "music":
		methodAdvice = "Let the music work. No need to solve anything right now."
	case "shower":
		methodAdvice = "Water and warmth are restorative. Be present."
	case "silence":
		methodAdvice = "Silence allows the mind to settle. Resist the urge to fill it."
	default:
		methodAdvice = "Recovery time activated."
	}

	c.JSON(http.StatusOK, models.EmotionResponse{
		Message:   "Decompression session started: " + req.Method + " for " + req.Duration + ". " + methodAdvice,
		ID:        session.ID,
		Timestamp: now,
	})
}
