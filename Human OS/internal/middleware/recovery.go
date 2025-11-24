// Package middleware provides HTTP middleware for the Human OS Cognitive API.
// Recovery middleware handles panics gracefully and returns proper error responses.
package middleware

import (
	"log"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"

	"humanos-api/internal/models"
)

// Recovery returns a middleware that recovers from panics and logs the stack trace
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with stack trace
				requestID := GetRequestID(c)
				log.Printf("[%s] PANIC: %v\n%s", requestID, err, debug.Stack())

				// Return a proper error response
				c.AbortWithStatusJSON(http.StatusInternalServerError, models.ErrorResponse{
					Error:     "Internal Server Error",
					Details:   "An unexpected error occurred. Please try again.",
					Timestamp: time.Now().UTC(),
				})
			}
		}()
		c.Next()
	}
}
