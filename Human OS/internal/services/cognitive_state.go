// Package services provides business logic for the Human OS Cognitive API.
// The CognitiveStateService aggregates data from the database to provide
// a unified view of the current cognitive state.
package services

import (
	"time"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
)

// CognitiveStateService provides high-level cognitive state operations
type CognitiveStateService struct {
	db *database.DB
}

// NewCognitiveStateService creates a new cognitive state service
func NewCognitiveStateService(db *database.DB) *CognitiveStateService {
	return &CognitiveStateService{db: db}
}

// GetDashboardStatus aggregates all cognitive state into a single dashboard view.
// This is the critical endpoint that provides situational awareness of your
// mental state at any given moment.
func (s *CognitiveStateService) GetDashboardStatus() (*models.CognitiveStatus, error) {
	status := &models.CognitiveStatus{
		Timestamp: time.Now().UTC(),
	}

	// Get current focus
	focus, err := s.db.GetCurrentFocus()
	if err != nil {
		return nil, err
	}
	if focus != nil {
		status.CurrentFocus = focus.TaskName
		status.FocusLocked = focus.IsLocked
	}

	// Get foreground threads
	fgThreads, err := s.db.GetThreadsByMode(models.ThreadModeForeground)
	if err != nil {
		return nil, err
	}
	status.ForegroundThreads = make([]string, 0, len(fgThreads))
	for _, t := range fgThreads {
		status.ForegroundThreads = append(status.ForegroundThreads, t.Name)
	}

	// Get background threads
	bgThreads, err := s.db.GetThreadsByMode(models.ThreadModeBackground)
	if err != nil {
		return nil, err
	}
	status.BackgroundThreads = make([]string, 0, len(bgThreads))
	for _, t := range bgThreads {
		status.BackgroundThreads = append(status.BackgroundThreads, t.Name)
	}

	// Count open loops
	openLoops, err := s.db.CountOpenLoops()
	if err != nil {
		return nil, err
	}
	status.OpenLoopsEstimate = openLoops

	// Count active predictions
	activePreds, err := s.db.CountActivePredictions()
	if err != nil {
		return nil, err
	}
	status.ActivePredictions = activePreds

	// Count pending tasks
	pendingTasks, err := s.db.CountPendingTasks()
	if err != nil {
		return nil, err
	}
	status.PendingTasks = pendingTasks

	// Count captured ideas
	capturedIdeas, err := s.db.CountCapturedIdeas()
	if err != nil {
		return nil, err
	}
	status.CapturedIdeas = capturedIdeas

	// Calculate emotional load based on recent emotional states
	status.EmotionalLoad = s.calculateEmotionalLoad()

	// Calculate energy level (heuristic based on open loops and active threads)
	status.EnergyLevel = s.calculateEnergyLevel(openLoops, len(fgThreads), len(bgThreads))

	return status, nil
}

// calculateEmotionalLoad determines the emotional load level based on recent emotional states
func (s *CognitiveStateService) calculateEmotionalLoad() models.LoadLevel {
	states, err := s.db.GetRecentEmotionalStates(5)
	if err != nil || len(states) == 0 {
		return models.LoadLevelLow
	}

	// Count high-load emotions
	highLoadEmotions := map[string]bool{
		"angry":       true,
		"anxious":     true,
		"overwhelmed": true,
		"stressed":    true,
		"frustrated":  true,
	}

	mediumLoadEmotions := map[string]bool{
		"tired":     true,
		"resentful": true,
		"worried":   true,
		"uncertain": true,
	}

	highCount := 0
	mediumCount := 0
	for _, state := range states {
		if highLoadEmotions[state.Label] {
			highCount++
		} else if mediumLoadEmotions[state.Label] {
			mediumCount++
		}
	}

	// Determine load level
	if highCount >= 2 || (highCount >= 1 && mediumCount >= 2) {
		return models.LoadLevelHigh
	}
	if highCount >= 1 || mediumCount >= 2 {
		return models.LoadLevelMedium
	}
	return models.LoadLevelLow
}

// calculateEnergyLevel determines energy level based on cognitive load indicators
func (s *CognitiveStateService) calculateEnergyLevel(openLoops, fgThreads, bgThreads int) models.LoadLevel {
	// Simple heuristic: more open loops and threads = lower energy (more drained)
	totalLoad := openLoops + (fgThreads * 2) + bgThreads

	if totalLoad > 15 {
		return models.LoadLevelLow // Heavily loaded = low energy
	}
	if totalLoad > 7 {
		return models.LoadLevelMedium
	}
	return models.LoadLevelHigh // Fewer active items = higher available energy
}

// ParseDuration parses a duration string like "25m", "50m", "90m" into a time.Duration
func ParseDuration(durationStr string) (time.Duration, error) {
	return time.ParseDuration(durationStr)
}

// CalculateEndTime calculates when a focus session should end
func CalculateEndTime(startTime time.Time, duration string) (time.Time, error) {
	d, err := ParseDuration(duration)
	if err != nil {
		return time.Time{}, err
	}
	return startTime.Add(d), nil
}
