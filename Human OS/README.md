# Human OS Cognitive API

A production-ready RESTful API for cognitive self-regulation. Unlike traditional CRUD APIs, this interface treats mental processes as programmable operations—focus, loops, threads, emotions, and predictions become manageable system states.

## Philosophy

Human OS models the mind as an operating system:
- **Focus** is the active process in the foreground
- **Threads** are parallel cognitive workstreams (foreground/background)
- **Loops** are unresolved commitments consuming mental RAM
- **Emotions** are system signals requiring acknowledgment
- **Predictions** are mental simulations (sometimes runaway processes)
- **Resets** are system recovery mechanisms

The goal is explicit management of cognitive state to reduce overwhelm, improve focus, and enable sustainable performance.

## Quick Start

### Prerequisites

- Go 1.21 or higher
- SQLite3 (included via go-sqlite3)

### Installation

```bash
# Clone and navigate to the project
cd "Human OS"

# Install dependencies
go mod tidy

# Copy environment configuration
cp .env.example .env

# Run the server
go run cmd/api/main.go
```

The server starts on `http://localhost:8080` by default.

### Health Check

```bash
curl http://localhost:8080/health
```

## API Documentation

### Core Control Plane

#### Set Focus
Direct attention to a specific task with clear duration and success criteria.

```bash
POST /api/v1/focus/set
```

```bash
curl -X POST http://localhost:8080/api/v1/focus/set \
  -H "Content-Type: application/json" \
  -d '{
    "task_name": "Write quarterly report",
    "duration": "50m",
    "success_criteria": "Complete executive summary section"
  }'
```

#### Lock Focus
Create a hard commitment to prevent context switching.

```bash
POST /api/v1/focus/lock
```

```bash
curl -X POST http://localhost:8080/api/v1/focus/lock \
  -H "Content-Type: application/json" \
  -d '{
    "task_name": "Deep work session",
    "timebox": "90m",
    "fallback": "If stuck, switch to reading research papers"
  }'
```

#### Dashboard Status
Get complete cognitive state overview.

```bash
GET /api/v1/dashboard/status
```

```bash
curl http://localhost:8080/api/v1/dashboard/status
```

Response:
```json
{
  "foreground_threads": ["quarterly report", "team 1:1s"],
  "background_threads": ["product strategy thinking"],
  "emotional_load": "medium",
  "open_loops_estimate": 7,
  "energy_level": "high",
  "current_focus": "Write quarterly report",
  "focus_locked": false,
  "active_predictions": 2,
  "pending_tasks": 12,
  "captured_ideas": 5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Loop Management

Loops are unresolved commitments that consume mental energy until closed.

#### Authorize Loop
Formally acknowledge and track an open loop.

```bash
POST /api/v1/loop/authorize
```

```bash
curl -X POST http://localhost:8080/api/v1/loop/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Follow up with Sarah about project timeline",
    "priority": "high",
    "queue": "action",
    "owner": "me now"
  }'
```

#### Close Loop
Resolve an open loop (done, paused, or abandoned).

```bash
POST /api/v1/loop/close
```

```bash
curl -X POST http://localhost:8080/api/v1/loop/close \
  -H "Content-Type: application/json" \
  -d '{
    "loop_id": "abc123",
    "closure_type": "done",
    "next_step": ""
  }'
```

#### Kill Loop
Force-close loops that shouldn't exist.

```bash
DELETE /api/v1/loop/kill
```

```bash
curl -X DELETE http://localhost:8080/api/v1/loop/kill \
  -H "Content-Type: application/json" \
  -d '{
    "description": "worry about economy",
    "reason": "out of my control"
  }'
```

### Thread Control

Threads represent cognitive workstreams—some need active attention (foreground), others benefit from passive processing (background).

#### Spawn Thread

```bash
POST /api/v1/thread/spawn
```

```bash
curl -X POST http://localhost:8080/api/v1/thread/spawn \
  -H "Content-Type: application/json" \
  -d '{
    "thread_name": "Q1 Planning",
    "mode": "foreground",
    "time_scope": "this week"
  }'
```

#### Background Thread
Let the subconscious work on something.

```bash
POST /api/v1/thread/background
```

```bash
curl -X POST http://localhost:8080/api/v1/thread/background \
  -H "Content-Type: application/json" \
  -d '{
    "thread_name": "Career direction",
    "goal": "Clarity on next role evolution"
  }'
```

#### Terminate Threads

```bash
DELETE /api/v1/thread/terminate
```

```bash
curl -X DELETE http://localhost:8080/api/v1/thread/terminate \
  -H "Content-Type: application/json" \
  -d '{
    "rule": "keep only today'\''s tasks"
  }'
```

### Ingestion

Capture tasks and ideas before they slip away.

#### Ingest Task

```bash
POST /api/v1/ingest/task
```

```bash
curl -X POST http://localhost:8080/api/v1/ingest/task \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Review insurance claim documents",
    "category": "claim",
    "urgency": "high",
    "importance": "high"
  }'
```

#### Ingest Idea

```bash
POST /api/v1/ingest/idea
```

```bash
curl -X POST http://localhost:8080/api/v1/ingest/idea \
  -H "Content-Type: application/json" \
  -d '{
    "idea_summary": "Automate weekly report generation",
    "storage": "Notion",
    "action_now": false
  }'
```

### Archive

Commit completed work and capture lessons.

```bash
POST /api/v1/archive/commit
```

```bash
curl -X POST http://localhost:8080/api/v1/archive/commit \
  -H "Content-Type: application/json" \
  -d '{
    "object": "Q4 2023 Report",
    "summary": "Completed comprehensive quarterly analysis",
    "lesson": "Start data gathering two weeks earlier next time"
  }'
```

### Prediction Control

Manage mental simulations and scenario planning.

#### Run Prediction

```bash
POST /api/v1/predict/run
```

```bash
curl -X POST http://localhost:8080/api/v1/predict/run \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "What if we expand to European market?",
    "time_horizon": "months",
    "depth": "deep"
  }'
```

#### Stop Prediction
Halt rumination on a topic.

```bash
DELETE /api/v1/predict/stop
```

```bash
curl -X DELETE http://localhost:8080/api/v1/predict/stop \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "European market"
  }'
```

### Emotion Management

#### Tag Emotion
Name what you're feeling.

```bash
POST /api/v1/emotion/tag
```

```bash
curl -X POST http://localhost:8080/api/v1/emotion/tag \
  -H "Content-Type: application/json" \
  -d '{
    "label": "anxious",
    "source_guess": "Upcoming presentation"
  }'
```

#### Decompress
Structured recovery time.

```bash
POST /api/v1/emotion/decompress
```

```bash
curl -X POST http://localhost:8080/api/v1/emotion/decompress \
  -H "Content-Type: application/json" \
  -d '{
    "method": "walk",
    "duration": "15m"
  }'
```

### AI Integration

#### Offload to AI

```bash
POST /api/v1/ai/offload
```

```bash
curl -X POST http://localhost:8080/api/v1/ai/offload \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "summarize",
    "scope": "Meeting notes from last week"
  }'
```

#### AI Assist for Execution

```bash
POST /api/v1/ai/assist-for-execution
```

```bash
curl -X POST http://localhost:8080/api/v1/ai/assist-for-execution \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Write performance review",
    "assistance_type": "structure and key points"
  }'
```

### Reset & Recovery

#### Soft Reset
Clear active state, preserve history.

```bash
POST /api/v1/mode/reset-soft
```

```bash
curl -X POST http://localhost:8080/api/v1/mode/reset-soft
```

#### Hard Reset
Complete wipe (use carefully).

```bash
POST /api/v1/mode/reset-hard
```

```bash
curl -X POST http://localhost:8080/api/v1/mode/reset-hard
```

## Example Workflows

### Morning Startup Routine

```bash
# 1. Check current state
curl http://localhost:8080/api/v1/dashboard/status

# 2. Clear stale threads from yesterday
curl -X DELETE http://localhost:8080/api/v1/thread/terminate \
  -H "Content-Type: application/json" \
  -d '{"rule": "keep only today'\''s tasks"}'

# 3. Set today's primary focus
curl -X POST http://localhost:8080/api/v1/focus/set \
  -H "Content-Type: application/json" \
  -d '{
    "task_name": "Complete project proposal",
    "duration": "90m",
    "success_criteria": "Draft ready for review"
  }'
```

### Deep Work Session

```bash
# 1. Lock focus to prevent distractions
curl -X POST http://localhost:8080/api/v1/focus/lock \
  -H "Content-Type: application/json" \
  -d '{
    "task_name": "Write technical specification",
    "timebox": "50m",
    "fallback": "Switch to documentation if blocked"
  }'

# 2. After completion, archive the work
curl -X POST http://localhost:8080/api/v1/archive/commit \
  -H "Content-Type: application/json" \
  -d '{
    "object": "Technical specification v1",
    "summary": "Completed initial draft",
    "lesson": "Breaking into sections helped maintain flow"
  }'
```

### Managing Overwhelm

```bash
# 1. Tag the emotion
curl -X POST http://localhost:8080/api/v1/emotion/tag \
  -H "Content-Type: application/json" \
  -d '{
    "label": "overwhelmed",
    "source_guess": "Too many open projects"
  }'

# 2. Check actual load
curl http://localhost:8080/api/v1/dashboard/status

# 3. Kill non-essential loops
curl -X DELETE http://localhost:8080/api/v1/loop/kill \
  -H "Content-Type: application/json" \
  -d '{
    "description": "nice to have",
    "reason": "not essential right now"
  }'

# 4. Take decompression break
curl -X POST http://localhost:8080/api/v1/emotion/decompress \
  -H "Content-Type: application/json" \
  -d '{
    "method": "walk",
    "duration": "10m"
  }'
```

### Loop Lifecycle

```bash
# 1. Something comes up - authorize it
curl -X POST http://localhost:8080/api/v1/loop/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Reply to vendor about pricing",
    "priority": "medium",
    "queue": "action",
    "owner": "me later"
  }'

# 2. Complete it later
curl -X POST http://localhost:8080/api/v1/loop/close \
  -H "Content-Type: application/json" \
  -d '{
    "loop_id": "the-loop-id",
    "closure_type": "done",
    "next_step": ""
  }'
```

## Configuration

Environment variables (set in `.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `ENV` | Environment (development/production) | `development` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `DATABASE_PATH` | SQLite database location | `./humanOS.db` |

## Testing

```bash
# Run all tests
go test ./...

# Run with verbose output
go test -v ./...

# Run specific package tests
go test -v ./internal/handlers/...
```

## Project Structure

```
Human OS/
├── cmd/api/main.go           # Application entry point
├── internal/
│   ├── config/               # Configuration loading
│   ├── database/             # SQLite operations
│   ├── handlers/             # HTTP request handlers
│   ├── middleware/           # HTTP middleware
│   ├── models/               # Data structures
│   └── services/             # Business logic
├── api/routes/               # Route definitions
├── .env.example              # Environment template
├── go.mod                    # Go module definition
└── README.md                 # This file
```

## Error Handling

All errors return a consistent format:

```json
{
  "error": "Brief error description",
  "details": "More specific information",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## License

MIT License - See LICENSE file for details.

## Contributing

This is a personal cognitive management tool. Fork and adapt for your own use case. The core concepts (focus, loops, threads, emotions) are universal; the specific endpoints can be customized to match your mental models.

---

*"The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch*

*Human OS helps you tend that fire deliberately.*
