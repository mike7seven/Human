// Package middleware provides HTTP middleware for the Human OS Cognitive API.
// CORS middleware handles Cross-Origin Resource Sharing for the API.
package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORS returns a middleware that adds CORS headers to responses.
// In development mode, it allows all origins. In production, this should
// be configured to allow only trusted origins.
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Request-ID")
		c.Header("Access-Control-Expose-Headers", "X-Request-ID")
		c.Header("Access-Control-Max-Age", "86400")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
