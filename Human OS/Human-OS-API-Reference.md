---
title: Human-OS-API-Reference
type: note
permalink: human-os/human-os-api-reference
---

# **Human OS Cognitive API** spec — Name mental endpoints, documented like a real platform

## Human-OS-API-Reference

You can treat these as **commands** you issue to yourself (internally or out loud) to steer the system instead of letting it run you.

---

## 0. Conventions

* **"Call" an endpoint** = say/think the phrase intentionally.
* **REQ** = what you specify (mentally or in notes).
* **RESP** = what you expect your brain to do, not how you feel in the next 3 seconds.
* This is not about perfection. It's about giving your system **clear instructions** instead of letting 1,000 loops auto-spawn.

---

## 1. Core Control Plane

### 1.1 `POST /focus/set`

**Use when:** You're about to work and want to tell your mind what the *one* primary foreground task is.

* **REQ**

  * `task_name` – short label (" fence plan", "Hail damage claim email", "Terraform RDS module")
  * `duration` – rough window (25m, 50m, 90m)
  * `success_criteria` – what "done for this block" means

* **Command phrase examples**

  * "Foreground task: *[task]* for *[duration]*. Done = *[criteria]*."
  * "Primary thread: write claim email draft. Done when there's a rough version I can send."

* **RESP**

  * your mind allocates main CPU to that task.
  * Competing tasks get demoted to background/queue.

---

### 1.2 `POST /focus/lock` (Hyperfocus Intent)

**Use when:** You want to deliberately lean into tunnel vision for something high-value.

* **REQ**

  * `task_name`
  * `timebox` (max – so you don't fry yourself)
  * `fallback` – what you'll do when the lock ends (rest, walk, water)

* **Command**

  * "Lock focus on *[task]* for up to *[time]*, then force a break."

* **RESP**

  * Background noise drops.
  * Timeline simulator and pattern scanner aim at this single target.

---

### 1.3 `GET /dashboard/status`

**Use when:** You feel weird, off, overwhelmed, or scattered.

* **RESP fields**

  * `foreground_threads` – what's actually running?
  * `background_threads` – what's quietly chewing RAM?
  * `emotional_load` – low / medium / high
  * `open_loops_estimate` – rough count
  * `energy_level` – low / medium / high

* **Command**

  * "Status check."
  * "What's running right now?"
  * "How many things am I actually trying to do at once?"

This is you forcing the Meta-Monitor to print a status log instead of vibing in chaos.

---

## 2. Loop Management (the big one)

### 2.1 `POST /loop/authorize`

**Use when:** A *new* idea/task shows up and your brain wants to spin a whole process around it.

* **REQ**

  * `description`
  * `priority` – high / medium / low
  * `queue` – `action` | `reference` | `backburner`
  * `owner` – "me now", "me later", "offload to AI/other human"

* **Command**

  * "Log this as *reference*, no action yet."
  * "New backburner item, not for today."
  * "This is an action, but *not* for this block. Put it in queue."

* **Rule**

  * If you don't explicitly call `/loop/authorize`, the default is: **do not allocate a foreground thread.**

---

### 2.2 `POST /loop/close`

**Use when:** You've done *enough* on something for now, or it's actually finished.

* **REQ**

  * `loop_id` or clear name ("today's claim work", "email to Gail", "TIG config round 1")
  * `closure_type` – `done` | `paused` | `abandoned`
  * `next_step` (optional) – "ask adjuster X", "schedule contractor call", etc.

* **Command**

  * "Close loop on *[thing]*, status: done."
  * "Pause this loop, next step is X — not now."
  * "Kill this loop; I'm not doing this anymore."

* **RESP**

  * Working memory drops the active weight.
  * DMN gets a clear tag: **no more background chewing on this unless explicitly reopened.**

---

### 2.3 `DELETE /loop/kill`

**Use when:** You're stuck in a useless loop (rumination, overthinking, "what if" spiral).

* **REQ**

  * `description`
  * `reason` – "non-actionable", "out of my control", "not worth compute"

* **Command**

  * "This thought is non-actionable. Kill the loop."
  * "Out of my control, drop it."
  * "This is not worth compute; terminate process."

* **RESP**

  * Timeline simulator de-prioritizes that branch.
  * Pattern engine stops re-scanning it.
  * Emotional load begins to step down.

---

## 3. Thread & Background Job Control

### 3.1 `POST /thread/spawn`

**Use when:** You **intentionally** want to think about something in parallel.

* **REQ**

  * `thread_name`
  * `mode` – `foreground` | `background`
  * `time_scope` – "today", "this week", "long-term"

* **Command**

  * "Spin up a background thread on: 'options for VPS architecture', no decisions today."
  * "Temporary foreground thread: 'draft water claim email'."

---

### 3.2 `POST /thread/background`

**Use when:** You want to move something out of active focus but keep processing.

* **REQ**

  * `thread_name`
  * `goal` – what you want the DMN to chew on (patterns, risks, options)

* **Command**

  * "Move this to background: let my brain keep exploring options, I'm not deciding now."
  * "Background process: 'how to structure Timeliner business model'."

* **RESP**

  * Executive Function frees foreground.
  * DMN continues slow-burn analysis.

---

### 3.3 `DELETE /thread/terminate`

**Use when:** You feel overloaded and know too many threads are open.

* **REQ**

  * `rule` – "keep only today's tasks and family", "kill all nonessential future planning"

* **Command**

  * "Terminate all non-urgent threads. Keep only: *[X, Y].*"
  * "Kill all future-scenario simulations for now."

---

## 4. Ingestion & Classification

### 4.1 `POST /ingest/task`

**Use when:** Anything lands on your plate.

* **REQ**

  * `description`
  * `category` – claim / home / kid / project / biz / admin / OSINT / etc.
  * `urgency` + `importance`

* **Command**

  * "New task: *[desc]*. It's important but not urgent. Backburner it."
  * "New task: *[desc]*. Critical today. Add to today's execution queue only."

---

### 4.2 `POST /ingest/idea`

**Use when:** You get one of those "this could be a thing" sparks.

* **REQ**

  * `idea_summary`
  * `storage` – logbook / Notion / email to yourself
  * `action_now` – yes / no

* **Command**

  * "This is just an idea. Log it for later; no action right now."
  * "Capture this: *[short summary]*. Don't let it become a task."

This is how you prevent every idea from becoming a loop.

---

## 5. Archive & Commit

### 5.1 `POST /archive/commit`

**Use when:** Something is actually finished.

* **REQ**

  * `object` – project / task / interaction
  * `summary` – 1–2 sentence "commit message"
  * `lesson` (optional)

* **Command**

  * "Archive: 'Basement claim paperwork sent to Gail.' Commit message: sent on X date, waiting response."
  * "Archive: 'Hail siding discussion with contractor.' Lesson: don't accept verbal crap; document everything."

This gives your brain a **git commit** so it stops reopening the branch.

---

## 6. Prediction & Scenario Modeling

### 6.1 `POST /predict/run`

**Use when:** You want your timeline simulator working for you, not against you.

* **REQ**

  * `scenario` – what you're evaluating
  * `time_horizon` – days / weeks / months / years
  * `depth` – low / medium / deep

* **Command**

  * "Run a quick prediction on: 'If I delay this claim another month, what happens?' Keep it shallow."
  * "Deep scan: '7-quarter plan outcomes if I commit fully vs half-assing it.'"

* **RESP**

  * Your brain surfaces likely consequences, risk zones, and high-leverage moves.

---

### 6.2 `DELETE /predict/stop`

**Use when:** You're spiraling in "what ifs".

* **Command**

  * "Stop scenario modeling for this topic."
  * "Enough what-ifs about this. No more runs until I explicitly ask."

---

## 7. Emotion & Load

### 7.1 `POST /emotion/tag`

**Use when:** You feel something but don't want it to silently drive decisions.

* **REQ**

  * `label` – angry, anxious, tired, resentful, overwhelmed, etc.
  * `source_guess` – quick hypothesis

* **Command**

  * "Tag this feeling: anxiety, probably open loops + money stress."
  * "Tag: resentment about that VP call. Source: disrespect + lack of control."

Labeling moves emotion from raw signal into data your system can work with.

---

### 7.2 `POST /emotion/decompress`

**Use when:** You know you're overloaded.

* **REQ**

  * `method` – walk, music, shower, dark room, silence, etc.
  * `duration`

* **Command**

  * "Initiate decompression: 15-minute walk, no input, no problem-solving."
  * "Decompression protocol: hot shower and music; no thinking about projects."

This is you treating decompression like an SRE mitigation, not a luxury.

---

## 8. AI Integration

### 8.1 `POST /ai/offload`

**Use when:** Something is too heavy to hold in RAM or too annoying to brute-force.

* **REQ**

  * `task_type` – plan / draft / refactor / summarize / explore / generate options
  * `scope` – what's in / what's out

* **Command**

  * "Offload to Astra: draft the first pass of this claim email using these bullet points."
  * "Offload to Claude: explore 3 architectures for this system; I'll choose later."

---

### 8.2 `POST /ai/assist-for-execution`

**Use when:** You're stuck starting or finishing.

* **Command**

  * "Co-pilot me through the first 10 minutes of this task."
  * "Walk me step-by-step through sending this email / building this module."

This turns AI into **temporary extra cores** for your mental cluster.

---

## 9. Reset & Recovery

### 9.1 `POST /mode/reset-soft`

**Use when:** You feel cluttered but not wrecked.

* **Command**

  * "Soft reset: close all nonessential tabs (mental and literal), list top 3 priorities, kill everything else for today."

---

### 9.2 `POST /mode/reset-hard`

**Use when:** You're fried.

* **Command**

  * "Hard reset. No new input. No problem-solving. Only recovery actions until tomorrow unless life-threatening."

This is your "take system out of production" call.

---

## 10. Minimal Quick-Use Set (if you remember nothing else)

If you only keep **five** endpoints in active use, make them these:

1. **`/focus/set`** – "Foreground task is X for Y minutes, done when Z."
2. **`/loop/authorize`** – "Log this, no action yet / backburner this / action but not today."
3. **`/loop/close`** – "Close loop on X, status Y, next step Z (or no next step)."
4. **`/dashboard/status`** – "What's running right now? How many threads are active?"
5. **`/thread/terminate`** – "Kill all nonessential threads; keep only A and B."

Use those five consistently and your open-loop problem drops *hard*.