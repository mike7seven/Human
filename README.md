---
title: README
type: note
permalink: readme
tags:
- readme
- documentation
- human-system
- overview
---

# Human System

**A system of systems for human augmentation and digital twin definition.**

The Human System is an open specification and mono-repo architecture designed to serve as the foundation for defining one's digital AI twin. Just as AI systems like Claude, Gemini, or ChatGPT are defined with personalities, your digital twin mirrors you—your personality, values, and identity—as you define them.

## Vision

The intent is to achieve augmentation of the human to reach the goal of **Human 3.0** and beyond. This is accomplished through defined AI systems and AI Agents specified in the AI Agent manifest.

## Three-Layer Architecture

The Human System is organized into three layers, each containing its own sub-system of systems:

```
Human/
├── Layer 0: Host Substrate
│   └── Physical body, biology, neuroscience foundations
├── Layer 1: Human OS
│   └── Cognitive frameworks, mental models, values, identity
├── Layer 2: Software
│   └── AI agents, tools, workflows, integrations
├── AI Agent Manifest
└── Specs & Documentation
```

## Getting Started

### For Users

You can engage with this project in several ways:

| Option | Description |
|--------|-------------|
| **Fork** | Create your own copy to customize for your personal Human-[YourName] instance |
| **Download** | Get a local copy for personal use and reference |
| **Contribute** | Help improve the core specification (see Contributing below) |

### Private Fork Pattern

Create your personal instance:

```
Human-[YourName]/
├── Inherits from Human (upstream)
├── Your specific instance definitions
├── Your agent configurations
├── Your subsystem versions
└── Pulls upstream changes periodically
```

**Workflow:** Work on your personal fork that defines you as a human, push changes to your fork, and periodically pull upstream changes from the main repo.

## Digital Twin Model

The digital twin is currently a **representational mirror**, not an agentic actor:

- **Defines** who you are to AI systems
- **Does not** autonomously act on your behalf
- **Digital assistant AI** handles task execution
- **Human** remains in the decision loop

## Related Projects

This project draws inspiration from and integrates with Daniel Miessler's Human 3.0 ecosystem:

| Project | Description | Layer Mapping |
|---------|-------------|---------------|
| [Substrate](https://github.com/danielmiessler/Substrate) | Framework for Human Understanding, Meaning, and Progress | Layer 1 |
| [Frames](https://github.com/danielmiessler/Frames) | Collection of positive and negative mental frames | Layer 1 |
| [Telos](https://github.com/danielmiessler/Telos) | Framework for creating Deep Context | Layer 1 |
| [Fabric](https://github.com/danielmiessler/Fabric) | Modular AI prompts and workflows | Layer 2 |
| [Daemon](https://github.com/danielmiessler/Daemon) | Personal API framework | Layer 2 |
| [Personal_AI_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure) | Personal AI Infrastructure for upgrading humans | Cross-cutting |

### Two Approaches, One Goal

| Aspect | Daniel's Approach | Human System Approach |
|--------|-------------------|----------------------|
| Method | Bottom-up, modular, tool-first | Top-down, architectural, system-first |
| Philosophy | Build discrete tools, compose into infrastructure | Define system of systems, then populate |
| Coherence | Emerges from interoperability | Designed in from the start |
| Structure | Separate repos per concern | Unified system-of-systems with layers |

Both approaches are valid and complementary—they cohere to form an overall approach to achieving Human 3.0 and beyond.

## Documentation

- [Human Project Intent and Structure](specs/Human%20Project%20Intent%20and%20Structure.md) - Full project vision and intent
- [Human System Architecture](specs/Human%20System%20Architecture.md) - Core architecture specification
- [Human System Three-Layer Model](specs/Human%20System%20Three-Layer%20Model.md) - Detailed layer definitions
- [AI Quorum Governance](specs/AI%20Quorum%20Governance.md) - Decision-making model
- [AI Infrastructure Architecture](specs/AI%20Infrastructure%20Architecture.md) - Sovereign/partner/transactional tiers
- [Design Decisions Log](specs/Design%20Decisions%20Log.md) - Full decision history and rationale

## Contributing

Both architectural and content contributions are welcome. Contributions will be subject to quality and coherence criteria (to be defined) to maintain project integrity.

## License

[To be determined]

---

*Building toward Human 3.0—one layer at a time.*
