// Package config handles application configuration loading and validation.
// It reads environment variables and provides sensible defaults for the Human OS Cognitive API.
package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration values for the Human OS API
type Config struct {
	// Server settings
	Port string
	Env  string

	// Logging
	LogLevel string

	// Database
	DatabasePath string
}

// Load reads configuration from environment variables and .env file
func Load() (*Config, error) {
	// Load .env file if it exists (ignore error if not found)
	_ = godotenv.Load()

	cfg := &Config{
		Port:         getEnv("PORT", "8080"),
		Env:          getEnv("ENV", "development"),
		LogLevel:     getEnv("LOG_LEVEL", "info"),
		DatabasePath: getEnv("DATABASE_PATH", "./humanOS.db"),
	}

	return cfg, nil
}

// getEnv reads an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// getEnvAsInt reads an environment variable as integer or returns a default
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

// getEnvAsBool reads an environment variable as boolean or returns a default
func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}
