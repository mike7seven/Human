// Package database provides SQLite persistence for the Human OS Cognitive API.
// It manages all cognitive state including focus, loops, threads, tasks, and emotions.
package database

import (
	"database/sql"
	"fmt"
	"sync"
	"time"

	"humanos-api/internal/models"

	_ "github.com/mattn/go-sqlite3"
)

// DB wraps the SQL database connection with thread-safe operations
type DB struct {
	conn *sql.DB
	mu   sync.RWMutex
}

// New creates a new database connection and initializes the schema
func New(path string) (*DB, error) {
	// Enable parsing of time.Time from SQLite datetime strings
	conn, err := sql.Open("sqlite3", path+"?_journal_mode=WAL&_busy_timeout=5000&_loc=UTC")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	db := &DB{conn: conn}

	// Initialize schema
	if err := db.initSchema(); err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}

// initSchema creates all required tables
func (db *DB) initSchema() error {
	schema := `
	-- Focus state table
	CREATE TABLE IF NOT EXISTS focus_state (
		id TEXT PRIMARY KEY,
		task_name TEXT NOT NULL,
		duration TEXT NOT NULL,
		success_criteria TEXT NOT NULL,
		is_locked INTEGER DEFAULT 0,
		timebox TEXT,
		fallback TEXT,
		started_at DATETIME NOT NULL,
		ends_at DATETIME,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Loops table (open loops / commitments)
	CREATE TABLE IF NOT EXISTS loops (
		id TEXT PRIMARY KEY,
		description TEXT NOT NULL,
		priority TEXT NOT NULL,
		queue TEXT NOT NULL,
		owner TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'open',
		closure_type TEXT,
		next_step TEXT,
		closed_at DATETIME,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Threads table (cognitive processes)
	CREATE TABLE IF NOT EXISTS threads (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		mode TEXT NOT NULL,
		time_scope TEXT NOT NULL,
		goal TEXT,
		status TEXT NOT NULL DEFAULT 'active',
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Tasks table (ingested tasks)
	CREATE TABLE IF NOT EXISTS tasks (
		id TEXT PRIMARY KEY,
		description TEXT NOT NULL,
		category TEXT NOT NULL,
		urgency TEXT NOT NULL,
		importance TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending',
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Ideas table (captured ideas)
	CREATE TABLE IF NOT EXISTS ideas (
		id TEXT PRIMARY KEY,
		summary TEXT NOT NULL,
		storage TEXT NOT NULL,
		action_now INTEGER DEFAULT 0,
		status TEXT NOT NULL DEFAULT 'captured',
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Archive table (committed/archived items)
	CREATE TABLE IF NOT EXISTS archives (
		id TEXT PRIMARY KEY,
		object TEXT NOT NULL,
		summary TEXT NOT NULL,
		lesson TEXT,
		created_at DATETIME NOT NULL
	);

	-- Predictions table (scenario modeling)
	CREATE TABLE IF NOT EXISTS predictions (
		id TEXT PRIMARY KEY,
		scenario TEXT NOT NULL,
		time_horizon TEXT NOT NULL,
		depth TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'running',
		results TEXT,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Emotional states table
	CREATE TABLE IF NOT EXISTS emotional_states (
		id TEXT PRIMARY KEY,
		label TEXT NOT NULL,
		source_guess TEXT NOT NULL,
		created_at DATETIME NOT NULL
	);

	-- Decompress sessions table
	CREATE TABLE IF NOT EXISTS decompress_sessions (
		id TEXT PRIMARY KEY,
		method TEXT NOT NULL,
		duration TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'active',
		started_at DATETIME NOT NULL,
		ends_at DATETIME NOT NULL,
		created_at DATETIME NOT NULL
	);

	-- AI offloads table
	CREATE TABLE IF NOT EXISTS ai_offloads (
		id TEXT PRIMARY KEY,
		task_type TEXT NOT NULL,
		scope TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending',
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);

	-- Create indexes for common queries
	CREATE INDEX IF NOT EXISTS idx_loops_status ON loops(status);
	CREATE INDEX IF NOT EXISTS idx_threads_status ON threads(status);
	CREATE INDEX IF NOT EXISTS idx_threads_mode ON threads(mode);
	CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
	CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
	`

	_, err := db.conn.Exec(schema)
	return err
}

// ============================================================================
// FOCUS OPERATIONS
// ============================================================================

// GetCurrentFocus returns the most recent active focus state
func (db *DB) GetCurrentFocus() (*models.FocusState, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var focus models.FocusState
	var endsAt sql.NullTime
	err := db.conn.QueryRow(`
		SELECT id, task_name, duration, success_criteria, is_locked,
		       COALESCE(timebox, ''), COALESCE(fallback, ''),
		       started_at, ends_at, created_at, updated_at
		FROM focus_state
		ORDER BY created_at DESC
		LIMIT 1
	`).Scan(
		&focus.ID, &focus.TaskName, &focus.Duration, &focus.SuccessCriteria,
		&focus.IsLocked, &focus.Timebox, &focus.Fallback,
		&focus.StartedAt, &endsAt, &focus.CreatedAt, &focus.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if endsAt.Valid {
		focus.EndsAt = endsAt.Time
	} else {
		focus.EndsAt = focus.StartedAt
	}
	return &focus, nil
}

// SetFocus creates or updates the current focus state
func (db *DB) SetFocus(focus *models.FocusState) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO focus_state (id, task_name, duration, success_criteria, is_locked,
		                         timebox, fallback, started_at, ends_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, focus.ID, focus.TaskName, focus.Duration, focus.SuccessCriteria, focus.IsLocked,
		focus.Timebox, focus.Fallback, focus.StartedAt, focus.EndsAt, focus.CreatedAt, focus.UpdatedAt)
	return err
}

// UpdateFocusLock updates the lock status of the current focus
func (db *DB) UpdateFocusLock(id string, isLocked bool, timebox, fallback string) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		UPDATE focus_state SET is_locked = ?, timebox = ?, fallback = ?, updated_at = ?
		WHERE id = ?
	`, isLocked, timebox, fallback, time.Now().UTC(), id)
	return err
}

// ClearFocus removes all focus states (for reset operations)
func (db *DB) ClearFocus() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM focus_state")
	return err
}

// ============================================================================
// LOOP OPERATIONS
// ============================================================================

// CreateLoop creates a new open loop
func (db *DB) CreateLoop(loop *models.Loop) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO loops (id, description, priority, queue, owner, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, loop.ID, loop.Description, loop.Priority, loop.Queue, loop.Owner, loop.Status,
		loop.CreatedAt, loop.UpdatedAt)
	return err
}

// GetLoop retrieves a loop by ID
func (db *DB) GetLoop(id string) (*models.Loop, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var loop models.Loop
	var closedAt sql.NullTime
	err := db.conn.QueryRow(`
		SELECT id, description, priority, queue, owner, status,
		       COALESCE(closure_type, ''), COALESCE(next_step, ''), closed_at,
		       created_at, updated_at
		FROM loops WHERE id = ?
	`, id).Scan(
		&loop.ID, &loop.Description, &loop.Priority, &loop.Queue, &loop.Owner, &loop.Status,
		&loop.ClosureType, &loop.NextStep, &closedAt,
		&loop.CreatedAt, &loop.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if closedAt.Valid {
		loop.ClosedAt = &closedAt.Time
	}
	return &loop, nil
}

// CloseLoop closes an existing loop
func (db *DB) CloseLoop(id string, closureType models.ClosureType, nextStep string) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	now := time.Now().UTC()
	_, err := db.conn.Exec(`
		UPDATE loops SET status = 'closed', closure_type = ?, next_step = ?,
		                 closed_at = ?, updated_at = ?
		WHERE id = ?
	`, closureType, nextStep, now, now, id)
	return err
}

// KillLoopByDescription kills/closes a loop matching the description
func (db *DB) KillLoopByDescription(description string) (int64, error) {
	db.mu.Lock()
	defer db.mu.Unlock()

	now := time.Now().UTC()
	result, err := db.conn.Exec(`
		UPDATE loops SET status = 'closed', closure_type = 'abandoned', closed_at = ?, updated_at = ?
		WHERE description LIKE ? AND status = 'open'
	`, now, now, "%"+description+"%")
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// GetOpenLoops returns all open loops
func (db *DB) GetOpenLoops() ([]models.Loop, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	rows, err := db.conn.Query(`
		SELECT id, description, priority, queue, owner, status,
		       COALESCE(closure_type, ''), COALESCE(next_step, ''),
		       created_at, updated_at
		FROM loops WHERE status = 'open'
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var loops []models.Loop
	for rows.Next() {
		var loop models.Loop
		if err := rows.Scan(
			&loop.ID, &loop.Description, &loop.Priority, &loop.Queue, &loop.Owner, &loop.Status,
			&loop.ClosureType, &loop.NextStep,
			&loop.CreatedAt, &loop.UpdatedAt,
		); err != nil {
			return nil, err
		}
		loops = append(loops, loop)
	}
	return loops, rows.Err()
}

// CountOpenLoops returns the count of open loops
func (db *DB) CountOpenLoops() (int, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var count int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM loops WHERE status = 'open'").Scan(&count)
	return count, err
}

// ClearLoops removes all loops (for reset operations)
func (db *DB) ClearLoops() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM loops")
	return err
}

// ============================================================================
// THREAD OPERATIONS
// ============================================================================

// CreateThread creates a new cognitive thread
func (db *DB) CreateThread(thread *models.Thread) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO threads (id, name, mode, time_scope, goal, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, thread.ID, thread.Name, thread.Mode, thread.TimeScope, thread.Goal, thread.Status,
		thread.CreatedAt, thread.UpdatedAt)
	return err
}

// GetActiveThreads returns all active threads
func (db *DB) GetActiveThreads() ([]models.Thread, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	rows, err := db.conn.Query(`
		SELECT id, name, mode, time_scope, COALESCE(goal, ''), status, created_at, updated_at
		FROM threads WHERE status = 'active'
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []models.Thread
	for rows.Next() {
		var thread models.Thread
		if err := rows.Scan(
			&thread.ID, &thread.Name, &thread.Mode, &thread.TimeScope,
			&thread.Goal, &thread.Status, &thread.CreatedAt, &thread.UpdatedAt,
		); err != nil {
			return nil, err
		}
		threads = append(threads, thread)
	}
	return threads, rows.Err()
}

// GetThreadsByMode returns threads filtered by mode (foreground/background)
func (db *DB) GetThreadsByMode(mode models.ThreadMode) ([]models.Thread, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	rows, err := db.conn.Query(`
		SELECT id, name, mode, time_scope, COALESCE(goal, ''), status, created_at, updated_at
		FROM threads WHERE status = 'active' AND mode = ?
		ORDER BY created_at DESC
	`, mode)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []models.Thread
	for rows.Next() {
		var thread models.Thread
		if err := rows.Scan(
			&thread.ID, &thread.Name, &thread.Mode, &thread.TimeScope,
			&thread.Goal, &thread.Status, &thread.CreatedAt, &thread.UpdatedAt,
		); err != nil {
			return nil, err
		}
		threads = append(threads, thread)
	}
	return threads, rows.Err()
}

// TerminateThreadsByRule terminates threads based on a rule (simplified matching)
func (db *DB) TerminateThreadsByRule(rule string) (int64, error) {
	db.mu.Lock()
	defer db.mu.Unlock()

	now := time.Now().UTC()

	// Simple rule matching for common cases
	var query string
	switch rule {
	case "keep only today's tasks":
		// Terminate threads older than today
		today := time.Now().UTC().Truncate(24 * time.Hour)
		result, err := db.conn.Exec(`
			UPDATE threads SET status = 'terminated', updated_at = ?
			WHERE status = 'active' AND created_at < ?
		`, now, today)
		if err != nil {
			return 0, err
		}
		return result.RowsAffected()
	default:
		// Terminate all threads matching the rule pattern
		query = `
			UPDATE threads SET status = 'terminated', updated_at = ?
			WHERE status = 'active' AND (name LIKE ? OR time_scope LIKE ?)
		`
	}

	result, err := db.conn.Exec(query, now, "%"+rule+"%", "%"+rule+"%")
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// ClearThreads removes all threads (for reset operations)
func (db *DB) ClearThreads() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM threads")
	return err
}

// ============================================================================
// TASK OPERATIONS
// ============================================================================

// CreateTask creates a new task
func (db *DB) CreateTask(task *models.Task) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO tasks (id, description, category, urgency, importance, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, task.ID, task.Description, task.Category, task.Urgency, task.Importance, task.Status,
		task.CreatedAt, task.UpdatedAt)
	return err
}

// CountPendingTasks returns the count of pending tasks
func (db *DB) CountPendingTasks() (int, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var count int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'pending'").Scan(&count)
	return count, err
}

// ClearTasks removes all tasks (for reset operations)
func (db *DB) ClearTasks() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM tasks")
	return err
}

// ============================================================================
// IDEA OPERATIONS
// ============================================================================

// CreateIdea creates a new idea
func (db *DB) CreateIdea(idea *models.Idea) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO ideas (id, summary, storage, action_now, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, idea.ID, idea.Summary, idea.Storage, idea.ActionNow, idea.Status,
		idea.CreatedAt, idea.UpdatedAt)
	return err
}

// CountCapturedIdeas returns the count of captured ideas
func (db *DB) CountCapturedIdeas() (int, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var count int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM ideas WHERE status = 'captured'").Scan(&count)
	return count, err
}

// ClearIdeas removes all ideas (for reset operations)
func (db *DB) ClearIdeas() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM ideas")
	return err
}

// ============================================================================
// ARCHIVE OPERATIONS
// ============================================================================

// CreateArchive creates a new archive entry
func (db *DB) CreateArchive(archive *models.Archive) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO archives (id, object, summary, lesson, created_at)
		VALUES (?, ?, ?, ?, ?)
	`, archive.ID, archive.Object, archive.Summary, archive.Lesson, archive.CreatedAt)
	return err
}

// ClearArchives removes all archives (for hard reset only)
func (db *DB) ClearArchives() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM archives")
	return err
}

// ============================================================================
// PREDICTION OPERATIONS
// ============================================================================

// CreatePrediction creates a new prediction
func (db *DB) CreatePrediction(pred *models.Prediction) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO predictions (id, scenario, time_horizon, depth, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, pred.ID, pred.Scenario, pred.TimeHorizon, pred.Depth, pred.Status,
		pred.CreatedAt, pred.UpdatedAt)
	return err
}

// StopPredictionByTopic stops predictions matching the topic
func (db *DB) StopPredictionByTopic(topic string) (int64, error) {
	db.mu.Lock()
	defer db.mu.Unlock()

	now := time.Now().UTC()
	result, err := db.conn.Exec(`
		UPDATE predictions SET status = 'stopped', updated_at = ?
		WHERE status = 'running' AND scenario LIKE ?
	`, now, "%"+topic+"%")
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// CountActivePredictions returns the count of running predictions
func (db *DB) CountActivePredictions() (int, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var count int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM predictions WHERE status = 'running'").Scan(&count)
	return count, err
}

// ClearPredictions removes all predictions (for reset operations)
func (db *DB) ClearPredictions() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM predictions")
	return err
}

// ============================================================================
// EMOTION OPERATIONS
// ============================================================================

// CreateEmotionalState creates a new emotional state tag
func (db *DB) CreateEmotionalState(state *models.EmotionalState) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO emotional_states (id, label, source_guess, created_at)
		VALUES (?, ?, ?, ?)
	`, state.ID, state.Label, state.SourceGuess, state.CreatedAt)
	return err
}

// GetRecentEmotionalStates returns the most recent emotional states
func (db *DB) GetRecentEmotionalStates(limit int) ([]models.EmotionalState, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	rows, err := db.conn.Query(`
		SELECT id, label, source_guess, created_at
		FROM emotional_states
		ORDER BY created_at DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var states []models.EmotionalState
	for rows.Next() {
		var state models.EmotionalState
		if err := rows.Scan(&state.ID, &state.Label, &state.SourceGuess, &state.CreatedAt); err != nil {
			return nil, err
		}
		states = append(states, state)
	}
	return states, rows.Err()
}

// CreateDecompressSession creates a new decompression session
func (db *DB) CreateDecompressSession(session *models.DecompressSession) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO decompress_sessions (id, method, duration, status, started_at, ends_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, session.ID, session.Method, session.Duration, session.Status,
		session.StartedAt, session.EndsAt, session.CreatedAt)
	return err
}

// ClearEmotionalStates removes all emotional states (for reset operations)
func (db *DB) ClearEmotionalStates() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM emotional_states")
	return err
}

// ClearDecompressSessions removes all decompress sessions
func (db *DB) ClearDecompressSessions() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM decompress_sessions")
	return err
}

// ============================================================================
// AI OFFLOAD OPERATIONS
// ============================================================================

// CreateAIOffload creates a new AI offload entry
func (db *DB) CreateAIOffload(offload *models.AIOffload) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec(`
		INSERT INTO ai_offloads (id, task_type, scope, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, offload.ID, offload.TaskType, offload.Scope, offload.Status,
		offload.CreatedAt, offload.UpdatedAt)
	return err
}

// ClearAIOffloads removes all AI offloads (for reset operations)
func (db *DB) ClearAIOffloads() error {
	db.mu.Lock()
	defer db.mu.Unlock()

	_, err := db.conn.Exec("DELETE FROM ai_offloads")
	return err
}

// ============================================================================
// RESET OPERATIONS
// ============================================================================

// SoftReset clears active state but preserves archives and historical data
func (db *DB) SoftReset() error {
	// Clear active states
	if err := db.ClearFocus(); err != nil {
		return err
	}
	// Close all open loops instead of deleting
	db.mu.Lock()
	now := time.Now().UTC()
	_, err := db.conn.Exec(`
		UPDATE loops SET status = 'closed', closure_type = 'abandoned',
		                 closed_at = ?, updated_at = ?
		WHERE status = 'open'
	`, now, now)
	db.mu.Unlock()
	if err != nil {
		return err
	}
	// Terminate all active threads
	db.mu.Lock()
	_, err = db.conn.Exec(`
		UPDATE threads SET status = 'terminated', updated_at = ?
		WHERE status = 'active'
	`, now)
	db.mu.Unlock()
	if err != nil {
		return err
	}
	// Stop all running predictions
	db.mu.Lock()
	_, err = db.conn.Exec(`
		UPDATE predictions SET status = 'stopped', updated_at = ?
		WHERE status = 'running'
	`, now)
	db.mu.Unlock()
	return err
}

// HardReset clears all data including archives
func (db *DB) HardReset() error {
	tables := []string{
		"focus_state", "loops", "threads", "tasks", "ideas",
		"archives", "predictions", "emotional_states",
		"decompress_sessions", "ai_offloads",
	}
	for _, table := range tables {
		if _, err := db.conn.Exec("DELETE FROM " + table); err != nil {
			return err
		}
	}
	return nil
}
