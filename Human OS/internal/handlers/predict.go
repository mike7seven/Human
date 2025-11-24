// Package handlers contains HTTP request handlers for the Human OS Cognitive API.
// Predict handlers manage scenario modeling and prediction processes - the
// mental simulations we run to anticipate outcomes and plan ahead. These can
// be valuable but also energy-intensive; knowing when to stop is important.
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// PredictHandler handles prediction-related endpoints
type PredictHandler struct {
	db *database.DB
}

// NewPredictHandler creates a new predict handler
func NewPredictHandler(db *database.DB) *PredictHandler {
	return &PredictHandler{db: db}
}

// RunPrediction handles POST /api/v1/predict/run
// Running a prediction initiates a scenario modeling process. Depth controls
// how much cognitive energy to invest: "low" for quick sanity checks,
// "medium" for normal planning, "deep" for major decisions requiring thorough analysis.
func (h *PredictHandler) RunPrediction(c *gin.Context) {
	var req models.PredictRunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	now := time.Now().UTC()
	prediction := &models.Prediction{
		ID:          uuid.New().String(),
		Scenario:    req.Scenario,
		TimeHorizon: req.TimeHorizon,
		Depth:       req.Depth,
		Status:      "running",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := h.db.CreatePrediction(prediction); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to start prediction",
			err.Error(),
		))
		return
	}

	var depthAdvice string
	switch req.Depth {
	case "deep":
		depthAdvice = "Deep analysis mode - allocate significant mental resources."
	case "medium":
		depthAdvice = "Standard analysis - balanced approach."
	default:
		depthAdvice = "Quick scan - don't over-invest in this."
	}

	c.JSON(http.StatusCreated, models.PredictResponse{
		Message:      "Prediction running: " + req.Scenario + " [" + req.TimeHorizon + "]. " + depthAdvice,
		PredictionID: prediction.ID,
		Prediction:   prediction,
		Timestamp:    now,
	})
}

// StopPrediction handles DELETE /api/v1/predict/stop
// Stopping predictions is crucial for managing rumination and analysis paralysis.
// Sometimes the best decision is to stop thinking about something and act
// (or accept uncertainty). This endpoint stops predictions matching a topic.
func (h *PredictHandler) StopPrediction(c *gin.Context) {
	var req models.PredictStopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("Invalid request", err.Error()))
		return
	}

	affected, err := h.db.StopPredictionByTopic(req.Topic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to stop prediction",
			err.Error(),
		))
		return
	}

	if affected == 0 {
		c.JSON(http.StatusNotFound, models.NewErrorResponse(
			"No matching predictions found",
			"No running predictions matched the topic: "+req.Topic,
		))
		return
	}

	c.JSON(http.StatusOK, models.PredictResponse{
		Message:   "Prediction(s) STOPPED for topic: " + req.Topic + ". Mental simulation halted.",
		Timestamp: time.Now().UTC(),
	})
}
