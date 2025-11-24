// Package models defines all data structures for the Human OS Cognitive API.
// These models represent cognitive states, tasks, loops, and mental processes
// that make up the self-regulation interface.
package models

import (
	"time"
)

// ============================================================================
// COMMON TYPES
// ============================================================================

// Priority represents urgency levels for cognitive operations
type Priority string

const (
	PriorityHigh   Priority = "high"
	PriorityMedium Priority = "medium"
	PriorityLow    Priority = "low"
)

// LoadLevel represents intensity levels for emotional/mental load
type LoadLevel string

const (
	LoadLevelLow    LoadLevel = "low"
	LoadLevelMedium LoadLevel = "medium"
	LoadLevelHigh   LoadLevel = "high"
)

// QueueType represents the destination queue for open loops
type QueueType string

const (
	QueueAction     QueueType = "action"
	QueueReference  QueueType = "reference"
	QueueBackburner QueueType = "backburner"
)

// ThreadMode represents whether a thread runs in foreground or background
type ThreadMode string

const (
	ThreadModeForeground ThreadMode = "foreground"
	ThreadModeBackground ThreadMode = "background"
)

// ClosureType represents how a loop was closed
type ClosureType string

const (
	ClosureDone      ClosureType = "done"
	ClosurePaused    ClosureType = "paused"
	ClosureAbandoned ClosureType = "abandoned"
)

// ============================================================================
// FOCUS MODELS
// ============================================================================

// FocusState represents the current focus state of the cognitive system.
// Focus is the core attention mechanism - when set, it defines what the mind
// should be working on to the exclusion of other tasks.
type FocusState struct {
	ID              string    `json:"id" db:"id"`
	TaskName        string    `json:"task_name" db:"task_name"`
	Duration        string    `json:"duration" db:"duration"`
	SuccessCriteria string    `json:"success_criteria" db:"success_criteria"`
	IsLocked        bool      `json:"is_locked" db:"is_locked"`
	Timebox         string    `json:"timebox,omitempty" db:"timebox"`
	Fallback        string    `json:"fallback,omitempty" db:"fallback"`
	StartedAt       time.Time `json:"started_at" db:"started_at"`
	EndsAt          time.Time `json:"ends_at,omitempty" db:"ends_at"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// FocusSetRequest represents a request to set focus on a specific task
type FocusSetRequest struct {
	TaskName        string `json:"task_name" binding:"required"`
	Duration        string `json:"duration" binding:"required"`
	SuccessCriteria string `json:"success_criteria" binding:"required"`
}

// FocusLockRequest represents a request to lock focus (preventing context switching)
type FocusLockRequest struct {
	TaskName string `json:"task_name" binding:"required"`
	Timebox  string `json:"timebox" binding:"required"`
	Fallback string `json:"fallback" binding:"required"`
}

// FocusResponse is the response for focus operations
type FocusResponse struct {
	Message   string      `json:"message"`
	Focus     *FocusState `json:"focus,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// ============================================================================
// LOOP MODELS
// ============================================================================

// Loop represents an "open loop" - an unresolved commitment or task that
// occupies mental bandwidth until explicitly closed. Managing loops is
// critical for reducing cognitive load.
type Loop struct {
	ID          string      `json:"id" db:"id"`
	Description string      `json:"description" db:"description"`
	Priority    Priority    `json:"priority" db:"priority"`
	Queue       QueueType   `json:"queue" db:"queue"`
	Owner       string      `json:"owner" db:"owner"`
	Status      string      `json:"status" db:"status"` // "open", "closed"
	ClosureType ClosureType `json:"closure_type,omitempty" db:"closure_type"`
	NextStep    string      `json:"next_step,omitempty" db:"next_step"`
	ClosedAt    *time.Time  `json:"closed_at,omitempty" db:"closed_at"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
}

// LoopAuthorizeRequest represents a request to create and authorize a new loop
type LoopAuthorizeRequest struct {
	Description string    `json:"description" binding:"required"`
	Priority    Priority  `json:"priority" binding:"required,oneof=high medium low"`
	Queue       QueueType `json:"queue" binding:"required,oneof=action reference backburner"`
	Owner       string    `json:"owner" binding:"required"`
}

// LoopCloseRequest represents a request to close an existing loop
type LoopCloseRequest struct {
	LoopID      string      `json:"loop_id" binding:"required"`
	ClosureType ClosureType `json:"closure_type" binding:"required,oneof=done paused abandoned"`
	NextStep    string      `json:"next_step,omitempty"`
}

// LoopKillRequest represents a request to kill/terminate a loop immediately
type LoopKillRequest struct {
	Description string `json:"description" binding:"required"`
	Reason      string `json:"reason" binding:"required"`
}

// LoopResponse is the response for loop operations
type LoopResponse struct {
	Message   string    `json:"message"`
	LoopID    string    `json:"loop_id,omitempty"`
	Loop      *Loop     `json:"loop,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// THREAD MODELS
// ============================================================================

// Thread represents a cognitive process or workstream. Threads can run in
// foreground (active attention) or background (passive processing).
type Thread struct {
	ID        string     `json:"id" db:"id"`
	Name      string     `json:"name" db:"name"`
	Mode      ThreadMode `json:"mode" db:"mode"`
	TimeScope string     `json:"time_scope" db:"time_scope"`
	Goal      string     `json:"goal,omitempty" db:"goal"`
	Status    string     `json:"status" db:"status"` // "active", "terminated"
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
}

// ThreadSpawnRequest represents a request to spawn a new cognitive thread
type ThreadSpawnRequest struct {
	ThreadName string     `json:"thread_name" binding:"required"`
	Mode       ThreadMode `json:"mode" binding:"required,oneof=foreground background"`
	TimeScope  string     `json:"time_scope" binding:"required"`
}

// ThreadBackgroundRequest represents a request to create a background processing thread
type ThreadBackgroundRequest struct {
	ThreadName string `json:"thread_name" binding:"required"`
	Goal       string `json:"goal" binding:"required"`
}

// ThreadTerminateRequest represents a request to terminate threads matching a rule
type ThreadTerminateRequest struct {
	Rule string `json:"rule" binding:"required"`
}

// ThreadResponse is the response for thread operations
type ThreadResponse struct {
	Message   string    `json:"message"`
	ThreadID  string    `json:"thread_id,omitempty"`
	Thread    *Thread   `json:"thread,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// TASK & IDEA MODELS (INGESTION)
// ============================================================================

// Task represents an ingested task that needs to be processed
type Task struct {
	ID          string    `json:"id" db:"id"`
	Description string    `json:"description" db:"description"`
	Category    string    `json:"category" db:"category"`
	Urgency     Priority  `json:"urgency" db:"urgency"`
	Importance  Priority  `json:"importance" db:"importance"`
	Status      string    `json:"status" db:"status"` // "pending", "processed"
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// IngestTaskRequest represents a request to ingest a new task
type IngestTaskRequest struct {
	Description string   `json:"description" binding:"required"`
	Category    string   `json:"category" binding:"required"`
	Urgency     Priority `json:"urgency" binding:"required,oneof=high medium low"`
	Importance  Priority `json:"importance" binding:"required,oneof=high medium low"`
}

// Idea represents a captured idea for later processing
type Idea struct {
	ID          string    `json:"id" db:"id"`
	Summary     string    `json:"idea_summary" db:"summary"`
	Storage     string    `json:"storage" db:"storage"`
	ActionNow   bool      `json:"action_now" db:"action_now"`
	Status      string    `json:"status" db:"status"` // "captured", "processed"
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// IngestIdeaRequest represents a request to ingest a new idea
type IngestIdeaRequest struct {
	IdeaSummary string `json:"idea_summary" binding:"required"`
	Storage     string `json:"storage" binding:"required"`
	ActionNow   bool   `json:"action_now"`
}

// IngestResponse is the response for ingestion operations
type IngestResponse struct {
	Message   string    `json:"message"`
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// ARCHIVE MODELS
// ============================================================================

// Archive represents a committed/archived object with learnings
type Archive struct {
	ID        string    `json:"id" db:"id"`
	Object    string    `json:"object" db:"object"`
	Summary   string    `json:"summary" db:"summary"`
	Lesson    string    `json:"lesson,omitempty" db:"lesson"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ArchiveCommitRequest represents a request to archive something
type ArchiveCommitRequest struct {
	Object  string `json:"object" binding:"required"`
	Summary string `json:"summary" binding:"required"`
	Lesson  string `json:"lesson,omitempty"`
}

// ArchiveResponse is the response for archive operations
type ArchiveResponse struct {
	Message   string    `json:"message"`
	ArchiveID string    `json:"archive_id"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// PREDICTION MODELS
// ============================================================================

// Prediction represents an active prediction/scenario modeling process
type Prediction struct {
	ID          string    `json:"id" db:"id"`
	Scenario    string    `json:"scenario" db:"scenario"`
	TimeHorizon string    `json:"time_horizon" db:"time_horizon"`
	Depth       string    `json:"depth" db:"depth"` // "low", "medium", "deep"
	Status      string    `json:"status" db:"status"` // "running", "stopped"
	Results     string    `json:"results,omitempty" db:"results"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// PredictRunRequest represents a request to run a prediction
type PredictRunRequest struct {
	Scenario    string `json:"scenario" binding:"required"`
	TimeHorizon string `json:"time_horizon" binding:"required"`
	Depth       string `json:"depth" binding:"required,oneof=low medium deep"`
}

// PredictStopRequest represents a request to stop prediction on a topic
type PredictStopRequest struct {
	Topic string `json:"topic" binding:"required"`
}

// PredictResponse is the response for prediction operations
type PredictResponse struct {
	Message      string      `json:"message"`
	PredictionID string      `json:"prediction_id,omitempty"`
	Prediction   *Prediction `json:"prediction,omitempty"`
	Timestamp    time.Time   `json:"timestamp"`
}

// ============================================================================
// EMOTION MODELS
// ============================================================================

// EmotionalState represents a tagged emotional state
type EmotionalState struct {
	ID          string    `json:"id" db:"id"`
	Label       string    `json:"label" db:"label"`
	SourceGuess string    `json:"source_guess" db:"source_guess"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// EmotionTagRequest represents a request to tag an emotional state
type EmotionTagRequest struct {
	Label       string `json:"label" binding:"required"`
	SourceGuess string `json:"source_guess" binding:"required"`
}

// DecompressSession represents an active decompression session
type DecompressSession struct {
	ID        string    `json:"id" db:"id"`
	Method    string    `json:"method" db:"method"`
	Duration  string    `json:"duration" db:"duration"`
	Status    string    `json:"status" db:"status"` // "active", "completed"
	StartedAt time.Time `json:"started_at" db:"started_at"`
	EndsAt    time.Time `json:"ends_at" db:"ends_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// EmotionDecompressRequest represents a request to start decompression
type EmotionDecompressRequest struct {
	Method   string `json:"method" binding:"required"`
	Duration string `json:"duration" binding:"required"`
}

// EmotionResponse is the response for emotion operations
type EmotionResponse struct {
	Message   string    `json:"message"`
	ID        string    `json:"id,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// AI INTEGRATION MODELS
// ============================================================================

// AIOffload represents an offloaded task to AI
type AIOffload struct {
	ID        string    `json:"id" db:"id"`
	TaskType  string    `json:"task_type" db:"task_type"`
	Scope     string    `json:"scope" db:"scope"`
	Status    string    `json:"status" db:"status"` // "pending", "processing", "completed"
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// AIOffloadRequest represents a request to offload a task to AI
type AIOffloadRequest struct {
	TaskType string `json:"task_type" binding:"required"`
	Scope    string `json:"scope" binding:"required"`
}

// AIAssistRequest represents a request for AI execution assistance
type AIAssistRequest struct {
	Task           string `json:"task" binding:"required"`
	AssistanceType string `json:"assistance_type" binding:"required"`
}

// AIResponse is the response for AI operations
type AIResponse struct {
	Message   string    `json:"message"`
	ID        string    `json:"id,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// DASHBOARD/STATUS MODELS
// ============================================================================

// CognitiveStatus represents the complete cognitive dashboard state
type CognitiveStatus struct {
	ForegroundThreads  []string  `json:"foreground_threads"`
	BackgroundThreads  []string  `json:"background_threads"`
	EmotionalLoad      LoadLevel `json:"emotional_load"`
	OpenLoopsEstimate  int       `json:"open_loops_estimate"`
	EnergyLevel        LoadLevel `json:"energy_level"`
	CurrentFocus       string    `json:"current_focus,omitempty"`
	FocusLocked        bool      `json:"focus_locked"`
	ActivePredictions  int       `json:"active_predictions"`
	PendingTasks       int       `json:"pending_tasks"`
	CapturedIdeas      int       `json:"captured_ideas"`
	Timestamp          time.Time `json:"timestamp"`
}

// ============================================================================
// MODE/RESET MODELS
// ============================================================================

// ResetResponse is the response for reset operations
type ResetResponse struct {
	Message   string    `json:"message"`
	ResetType string    `json:"reset_type"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// ERROR RESPONSE
// ============================================================================

// ErrorResponse is the standard error response format
type ErrorResponse struct {
	Error     string    `json:"error"`
	Details   string    `json:"details,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// NewErrorResponse creates a new error response
func NewErrorResponse(err, details string) ErrorResponse {
	return ErrorResponse{
		Error:     err,
		Details:   details,
		Timestamp: time.Now().UTC(),
	}
}
