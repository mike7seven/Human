---
title: Design Decisions Log
type: note
permalink: specs/design-decisions-log
tags:
- decisions
- architecture
- governance
- digital-twin
- contributions
---

# Design Decisions Log

This document tracks key architectural and governance decisions for the Human System project.

## Decision Registry

### DD-001: Digital Twin Scope
**Date:** 2025-01-24
**Status:** Decided

**Question:** Is the digital twin a read-only mirror (represents you) or does it have agency to act on your behalf within defined boundaries?

**Decision:** Read-only mirror for now. The digital twin does not have agency to act autonomously.

**Rationale:** Agency requires significant additional work around boundaries, permissions, and safety. In the interim, the digital assistant AI will work in its place - meaning the human remains in the loop for all actions.

**Implications:**
- Digital twin is representational, not operational
- AI agents execute tasks, but the digital twin doesn't autonomously delegate
- Future consideration for agentic capabilities once governance is mature

---

### DD-002: Contribution Model
**Date:** 2025-01-24
**Status:** Decided (with caveats)

**Question:** Are contributions to the public spec about the architecture (how to define a human system) or can they include content (specific mental models, frameworks, agent definitions)?

**Decision:** Open to all input - both architectural contributions and content contributions are welcome.

**Constraints:** Will be stringent about certain (not yet defined) criteria. Recognition that open projects can become unwieldy with diverse motivations.

**Next Steps:**
- Define contribution criteria
- Establish review process
- Create contributing guidelines that balance openness with coherence

**Implications:**
- Need clear separation between "core spec" vs "community content"
- May need tiered contribution model (core team vs community)
- Will need governance for what gets merged vs stays as forks

---

### DD-003: Fork vs Extend Model
**Date:** 2025-01-24
**Status:** Decided (interim)

**Question:** When someone uses this, do they fork the whole thing, or is there a plugin/extension model where they can add their instance data without forking?

**Decision:** Fork or download only. No cloning/contributing until branching strategy is defined.

**Current State:**
- ✅ Fork allowed
- ✅ Download allowed
- ❌ Clone/contribute (pending)

**Rationale:** Need to figure out contributing and branching model first before opening up clone-and-contribute workflow.

**Next Steps:**
- Define branching strategy
- Create contribution workflow
- Consider plugin/extension model for future

---

## Open Questions (Pending Decisions)

### OQ-001: Contribution Criteria
What makes a contribution acceptable? What are the quality gates?

### OQ-002: Branching Strategy
Main/develop/feature? Release branches? How do personal forks sync?

### OQ-003: Core vs Community Content
Where is the line between "core spec" and "community additions"?

### OQ-004: Versioning Model
How do we version the spec itself vs implementations?

### OQ-005: License Selection
What license allows forking/use while maintaining attribution and preventing hostile forks?

## Relations

- relates_to [[Human Project Intent and Structure]]
- relates_to [[Human System Architecture]]
- informs [[Contributing Guidelines]]
