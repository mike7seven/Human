---
title: AI Quorum Governance
type: note
permalink: specs/ai-quorum-governance
tags:
- governance
- quorum
- ai-systems
- decision-making
- change-management
---

# AI Quorum Governance

## Overview

A governance model for AI-assisted decision-making that uses multiple AI systems (a quorum) rather than relying on a single AI entity. This approach provides redundancy, diverse perspectives, and reduces single points of failure in cognitive augmentation.

## Rationale

### Why Quorum Over Single AI

1. **No single point of failure** - One AI going down, changing, or being deprecated doesn't break workflows
2. **Diversification** - Different AIs have different strengths, biases, and failure modes
3. **Consensus as signal** - Agreement across different architectures is stronger than one confident answer
4. **Dissent as information** - When one AI disagrees, that's worth examining
5. **Human agency preserved** - The human remains final arbiter

### The Partner AI Problem

Partner AIs (Claude, GPT, Gemini, etc.) present governance challenges:
- Can change without notice (model updates, system prompt changes)
- No release notes provided to users
- No rollback capability
- Latency and availability varies with provider load
- User has no visibility into system state

This makes partner AIs unsuitable as core infrastructure for autonomous operations.

## Governance Maturity Model

Current State: **Build Phase**

### Autonomous Operations → Quorum Required (Strict)

- No human in the loop means higher blast radius
- Changes must have consensus before deployment
- Definition loosely defined, tightening as patterns emerge

### Interactive Operations → Single AI Acceptable (Flexible)

- Human is in the loop, can catch errors and redirect
- Speed matters more than consensus
- Human serves as real-time Change Advisory Board

### Build/Experimental → Minimal Governance (Intentional)

- Learning what works, failing fast
- Governance friction would slow discovery
- Formalize once patterns stabilize

## Transition Trigger

The key transition point: when something moves from "human is experimenting" to "this runs while human sleeps."

That's when quorum and formal change management kick in.

## Quorum Implementation (TBD)

Details to be defined as system matures:
- Minimum quorum size for different decision types
- Consensus threshold (unanimous, majority, weighted)
- Handling of dissent and tie-breaking
- Which AI systems participate in which decision domains
- Escalation paths when consensus cannot be reached

## Related Concepts

- [[Human System Architecture]] - The human system being governed
- [[AI Infrastructure Architecture]] - The AI stack being governed
- [[Change Management Principles]] - Broader change governance framework

## Status

Working draft. Governance rules will formalize as autonomous operations mature and failure modes become clear.
