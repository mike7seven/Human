---
title: Human Project Intent and Structure
type: note
permalink: specs/human-project-intent-and-structure
tags:
  - human-system
  - intent
  - structure
  - digital-twin
  - architecture
---

# Human Project Intent and Structure

## Project Intent

The Human System is a system of systems with 3 layers, where each layer contains a sub-system of systems. This will be a mono-repo with each layer having its own folder structure with purpose and intent.

### Public Spec and Repo

This will be a public spec and repo in which people can:
- Contribute
- Partner on
- Fork for their own project
- Download for their own use

### Digital Twin Foundation

This will most likely serve as a basis for defining one's digital AI twin. Just like an AI system like Claude, Gemini or ChatGPT is defined with a personality, your digital twin will mirror your personality and will mirror you as the user - as defined by how these large AI providers define mirroring.

### Goal

The intent is to achieve augmentation of the human to reach the goal of Human 3.0 and beyond. This will be achieved through the usage of various defined AI systems and AI Agents that will be defined in the AI Agent manifest file (or whatever name makes sense).

## Repo Structure

### Public Repo (Human)

```
Human (public spec repo)
├── Layer 0: Host Substrate
│   └── (subsystems, definitions, versioning specs)
├── Layer 1: Human OS
│   └── (subsystems, definitions, versioning specs)
├── Layer 2: Software
│   └── (subsystems, definitions, versioning specs)
├── AI Agent Manifest (or similar)
└── Contributing guidelines, spec docs, etc.
```

### Private Fork Pattern (Human-[Name])

```
Human/{Name of Person} (private fork example)
├── Inherits from Human
├── Your specific instance definitions
├── Your agent configurations
├── Your subsystem versions
└── Pulls upstream changes periodically
```

The workflow: Work on the personal fork that defines you as a human, push changes upstream to the fork, and at specific intervals pull in changes from the main repo.

## Related Work: Daniel Miessler's Human 3.0

Daniel Miessler (Building AI that upgrades humans) has been working on a similar project for a while. His repos tie into the Human 3.0 vision:

### Miessler Repos

| Repo | Description | URL |
|------|-------------|-----|
| Personal_AI_Infrastructure | Personal AI Infrastructure for upgrading humans | https://github.com/danielmiessler/Personal_AI_Infrastructure |
| Fabric | Open-source framework for augmenting humans using AI. Modular system for solving specific problems using crowdsourced AI prompts | https://github.com/danielmiessler/Fabric |
| Substrate | Open-source Framework for Human Understanding, Meaning, and Progress | https://github.com/danielmiessler/Substrate |
| Telos | Open-sourced framework for creating Deep Context about things that matter to humans | https://github.com/danielmiessler/Telos |
| Daemon | Open-source personal API framework | https://github.com/danielmiessler/Daemon |
| Augmented | Website for the AUGMENTED AI course | https://github.com/danielmiessler/augmented-course |
| Frames | Open-source collection of positive and negative mental frames | https://github.com/danielmiessler/Frames |

### Mapping Miessler's Work to Human System Layers

| Miessler Repo | Human System Layer | Function |
|---------------|-------------------|----------|
| Substrate | Layer 1 | Understanding, meaning frameworks |
| Frames | Layer 1 | Mental models, cognitive frameworks |
| Telos | Layer 1 | Purpose, deep context |
| Fabric | Layer 2 | Modular AI prompts, workflows |
| Daemon | Layer 2 | Personal API framework |
| Personal_AI_Infrastructure | Cross-cutting | The glue/orchestration |

### Two Approaches, One Goal

**Daniel's approach:** Bottom-up, modular, tool-first. Build discrete tools (Fabric, Daemon, Frames) that solve specific problems, then compose them into infrastructure. Coherence emerges from interoperability. Separate repos per concern.

**Human System approach:** Top-down, architectural, system-first. Define the system of systems, the layers, the versioning, the governance - then populate it with components. Coherence is designed in from the start. Unified system-of-systems with layers.

Both approaches are valid and complementary:
- Daniel's is more modular/composable
- Human System is more coherent as a single mental model

### Integration Intent

His repos, thoughts, methodologies and definitions will be incorporated into the Human System. The projects have overlap but cohere with each other to form an overall approach to achieving Human 3.0 and beyond.

## Related Concepts

- [[Human System Architecture]] - Core architecture spec
- [[Human System Three-Layer Model]] - Detailed layer definitions
- [[AI Quorum Governance]] - Decision-making model
- [[AI Infrastructure Architecture]] - Sovereign/partner/transactional tiers


## Current Design Decisions

### Digital Twin Model (Read-Only)
The digital twin is currently a **representational mirror**, not an agentic actor. It defines who you are to AI systems but doesn't autonomously act on your behalf. The digital assistant AI handles task execution while the human remains in the decision loop.

### Contribution Model (Open with Gates)
Both architectural and content contributions are welcome, but will be subject to (not yet defined) quality and coherence criteria. This prevents the project from fragmenting under diverse motivations.

### Usage Model (Fork/Download)
Users can:
- **Fork** - Create their own copy to customize
- **Download** - Get a local copy for personal use
- **Clone/Contribute** - Not yet available (pending branching strategy)

See [[Design Decisions Log]] for full decision history and rationale.
