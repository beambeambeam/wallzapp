---
name: no_deep_exploration
description: Don't over-explore or run many investigative commands without user direction
type: feedback
---

Don't run many exploratory/investigative commands (parsing files, running multiple tool calls) without being asked. When given a file or asset, work with what's already known or ask the user directly.

**Why:** User explicitly rejected deep exploration of a GLB file.

**How to apply:** Work with available information first. If something is truly needed, ask the user instead of auto-exploring.
