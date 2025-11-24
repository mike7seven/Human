// Package handlers contains tests for the Human OS Cognitive API handlers.
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"

	"humanos-api/internal/database"
	"humanos-api/internal/models"
	"humanos-api/internal/services"
)

// testDB creates a temporary test database
func testDB(t *testing.T) (*database.DB, func()) {
	t.Helper()

	// Create temp file for test database
	tmpFile, err := os.CreateTemp("", "humanos_test_*.db")
	if err != nil {
		t.Fatalf("Failed to create temp file: %v", err)
	}
	tmpPath := tmpFile.Name()
	tmpFile.Close()

	// Initialize database
	db, err := database.New(tmpPath)
	if err != nil {
		os.Remove(tmpPath)
		t.Fatalf("Failed to create test database: %v", err)
	}

	// Return cleanup function
	cleanup := func() {
		db.Close()
		os.Remove(tmpPath)
	}

	return db, cleanup
}

// setupRouter creates a test router with focus handlers
func setupFocusRouter(db *database.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	service := services.NewCognitiveStateService(db)
	handler := NewFocusHandler(db, service)

	v1 := router.Group("/api/v1")
	{
		focus := v1.Group("/focus")
		{
			focus.POST("/set", handler.SetFocus)
			focus.POST("/lock", handler.LockFocus)
		}
		dashboard := v1.Group("/dashboard")
		{
			dashboard.GET("/status", handler.GetDashboardStatus)
		}
	}

	return router
}

// TestSetFocus tests the POST /api/v1/focus/set endpoint
func TestSetFocus(t *testing.T) {
	db, cleanup := testDB(t)
	defer cleanup()

	router := setupFocusRouter(db)

	tests := []struct {
		name           string
		request        models.FocusSetRequest
		expectedStatus int
		checkResponse  func(*testing.T, map[string]interface{})
	}{
		{
			name: "successful focus set",
			request: models.FocusSetRequest{
				TaskName:        "Write cognitive API documentation",
				Duration:        "25m",
				SuccessCriteria: "Complete README file",
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["message"] == nil {
					t.Error("Expected message in response")
				}
				if resp["focus"] == nil {
					t.Error("Expected focus object in response")
				}
				focus := resp["focus"].(map[string]interface{})
				if focus["task_name"] != "Write cognitive API documentation" {
					t.Errorf("Expected task_name 'Write cognitive API documentation', got '%v'", focus["task_name"])
				}
				if focus["duration"] != "25m" {
					t.Errorf("Expected duration '25m', got '%v'", focus["duration"])
				}
			},
		},
		{
			name: "focus with longer duration",
			request: models.FocusSetRequest{
				TaskName:        "Deep work session",
				Duration:        "90m",
				SuccessCriteria: "Complete first draft",
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				focus := resp["focus"].(map[string]interface{})
				if focus["duration"] != "90m" {
					t.Errorf("Expected duration '90m', got '%v'", focus["duration"])
				}
			},
		},
		{
			name: "invalid duration format",
			request: models.FocusSetRequest{
				TaskName:        "Test task",
				Duration:        "invalid",
				SuccessCriteria: "Test criteria",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["error"] == nil {
					t.Error("Expected error in response")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.request)
			req, _ := http.NewRequest("POST", "/api/v1/focus/set", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			var resp map[string]interface{}
			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("Failed to unmarshal response: %v", err)
			}

			if tt.checkResponse != nil {
				tt.checkResponse(t, resp)
			}
		})
	}
}

// TestSetFocusValidation tests request validation
func TestSetFocusValidation(t *testing.T) {
	db, cleanup := testDB(t)
	defer cleanup()

	router := setupFocusRouter(db)

	tests := []struct {
		name           string
		body           string
		expectedStatus int
	}{
		{
			name:           "missing task_name",
			body:           `{"duration": "25m", "success_criteria": "test"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "missing duration",
			body:           `{"task_name": "test", "success_criteria": "test"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "missing success_criteria",
			body:           `{"task_name": "test", "duration": "25m"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "empty body",
			body:           `{}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "invalid json",
			body:           `{invalid}`,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("POST", "/api/v1/focus/set", bytes.NewBufferString(tt.body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}

// TestLockFocus tests the POST /api/v1/focus/lock endpoint
func TestLockFocus(t *testing.T) {
	db, cleanup := testDB(t)
	defer cleanup()

	router := setupFocusRouter(db)

	// Test creating a locked focus when none exists
	t.Run("lock focus creates new if none exists", func(t *testing.T) {
		body, _ := json.Marshal(models.FocusLockRequest{
			TaskName: "Critical task",
			Timebox:  "30m",
			Fallback: "Take a break and restart",
		})
		req, _ := http.NewRequest("POST", "/api/v1/focus/lock", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		focus := resp["focus"].(map[string]interface{})
		if focus["is_locked"] != true {
			t.Error("Expected focus to be locked")
		}
	})

	// Test locking an existing focus
	t.Run("lock existing focus", func(t *testing.T) {
		// First set a focus
		setBody, _ := json.Marshal(models.FocusSetRequest{
			TaskName:        "Test task",
			Duration:        "25m",
			SuccessCriteria: "Complete it",
		})
		setReq, _ := http.NewRequest("POST", "/api/v1/focus/set", bytes.NewBuffer(setBody))
		setReq.Header.Set("Content-Type", "application/json")
		w1 := httptest.NewRecorder()
		router.ServeHTTP(w1, setReq)

		// Then lock it
		lockBody, _ := json.Marshal(models.FocusLockRequest{
			TaskName: "Test task",
			Timebox:  "25m",
			Fallback: "Switch to backup task",
		})
		lockReq, _ := http.NewRequest("POST", "/api/v1/focus/lock", bytes.NewBuffer(lockBody))
		lockReq.Header.Set("Content-Type", "application/json")

		w2 := httptest.NewRecorder()
		router.ServeHTTP(w2, lockReq)

		if w2.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w2.Code)
		}
	})
}

// TestGetDashboardStatus tests the GET /api/v1/dashboard/status endpoint
func TestGetDashboardStatus(t *testing.T) {
	db, cleanup := testDB(t)
	defer cleanup()

	router := setupFocusRouter(db)

	t.Run("empty dashboard", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/dashboard/status", nil)

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var status models.CognitiveStatus
		if err := json.Unmarshal(w.Body.Bytes(), &status); err != nil {
			t.Fatalf("Failed to unmarshal response: %v", err)
		}

		// Check default values
		if status.OpenLoopsEstimate != 0 {
			t.Errorf("Expected 0 open loops, got %d", status.OpenLoopsEstimate)
		}
		if status.EmotionalLoad == "" {
			t.Error("Expected emotional_load to be set")
		}
		if status.EnergyLevel == "" {
			t.Error("Expected energy_level to be set")
		}
		if status.Timestamp.IsZero() {
			t.Error("Expected timestamp to be set")
		}
	})

	t.Run("dashboard with focus set", func(t *testing.T) {
		// Set a focus first
		setBody, _ := json.Marshal(models.FocusSetRequest{
			TaskName:        "Dashboard test task",
			Duration:        "25m",
			SuccessCriteria: "Test dashboard",
		})
		setReq, _ := http.NewRequest("POST", "/api/v1/focus/set", bytes.NewBuffer(setBody))
		setReq.Header.Set("Content-Type", "application/json")
		w1 := httptest.NewRecorder()
		router.ServeHTTP(w1, setReq)

		// Get dashboard status
		req, _ := http.NewRequest("GET", "/api/v1/dashboard/status", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var status models.CognitiveStatus
		json.Unmarshal(w.Body.Bytes(), &status)

		if status.CurrentFocus != "Dashboard test task" {
			t.Errorf("Expected current_focus 'Dashboard test task', got '%s'", status.CurrentFocus)
		}
	})
}

// TestFocusEndToEnd tests a complete focus workflow
func TestFocusEndToEnd(t *testing.T) {
	db, cleanup := testDB(t)
	defer cleanup()

	router := setupFocusRouter(db)

	// Step 1: Check initial status (should be empty)
	t.Log("Step 1: Check initial dashboard status")
	req1, _ := http.NewRequest("GET", "/api/v1/dashboard/status", nil)
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	var status1 models.CognitiveStatus
	json.Unmarshal(w1.Body.Bytes(), &status1)
	if status1.CurrentFocus != "" {
		t.Errorf("Expected empty focus initially, got '%s'", status1.CurrentFocus)
	}

	// Step 2: Set a focus
	t.Log("Step 2: Set focus on a task")
	setBody, _ := json.Marshal(models.FocusSetRequest{
		TaskName:        "Build Human OS API",
		Duration:        "50m",
		SuccessCriteria: "All endpoints working",
	})
	req2, _ := http.NewRequest("POST", "/api/v1/focus/set", bytes.NewBuffer(setBody))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("Failed to set focus: %s", w2.Body.String())
	}

	// Step 3: Verify focus appears in dashboard
	t.Log("Step 3: Verify focus in dashboard")
	req3, _ := http.NewRequest("GET", "/api/v1/dashboard/status", nil)
	w3 := httptest.NewRecorder()
	router.ServeHTTP(w3, req3)

	var status2 models.CognitiveStatus
	json.Unmarshal(w3.Body.Bytes(), &status2)
	if status2.CurrentFocus != "Build Human OS API" {
		t.Errorf("Expected focus 'Build Human OS API', got '%s'", status2.CurrentFocus)
	}
	if status2.FocusLocked {
		t.Error("Focus should not be locked yet")
	}

	// Step 4: Lock the focus
	t.Log("Step 4: Lock focus")
	lockBody, _ := json.Marshal(models.FocusLockRequest{
		TaskName: "Build Human OS API",
		Timebox:  "50m",
		Fallback: "Take a walk and reconsider approach",
	})
	req4, _ := http.NewRequest("POST", "/api/v1/focus/lock", bytes.NewBuffer(lockBody))
	req4.Header.Set("Content-Type", "application/json")
	w4 := httptest.NewRecorder()
	router.ServeHTTP(w4, req4)

	if w4.Code != http.StatusOK {
		t.Fatalf("Failed to lock focus: %s", w4.Body.String())
	}

	// Step 5: Verify focus is now locked
	t.Log("Step 5: Verify focus is locked in dashboard")
	req5, _ := http.NewRequest("GET", "/api/v1/dashboard/status", nil)
	w5 := httptest.NewRecorder()
	router.ServeHTTP(w5, req5)

	var status3 models.CognitiveStatus
	json.Unmarshal(w5.Body.Bytes(), &status3)
	if !status3.FocusLocked {
		t.Error("Focus should be locked now")
	}

	t.Log("End-to-end focus test completed successfully")
}
