// Package middleware provides HTTP middleware for the Human OS Cognitive API.
// Logger middleware logs all incoming requests with timing and status information.
package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestIDKey is the context key for the request ID
const RequestIDKey = "request_id"

// Logger returns a middleware that logs HTTP requests with timing information
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID
		requestID := uuid.New().String()
		c.Set(RequestIDKey, requestID)
		c.Header("X-Request-ID", requestID)

		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)
		statusCode := c.Writer.Status()

		// Log request
		log.Printf("[%s] %s %s %d %v",
			requestID[:8],
			method,
			path,
			statusCode,
			latency,
		)

		// Log errors if any
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Printf("[%s] Error: %s", requestID[:8], e.Error())
			}
		}
	}
}

// GetRequestID retrieves the request ID from the context
func GetRequestID(c *gin.Context) string {
	if id, exists := c.Get(RequestIDKey); exists {
		return id.(string)
	}
	return ""
}
