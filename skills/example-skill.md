---
name: architecture-review
description: Evaluate module boundaries and dependency direction.
trigger: architecture review
---

Review the target codebase from an architecture perspective.

Checklist:
1. Identify module responsibilities and ownership.
2. Detect dependency cycles or layering violations.
3. Flag high-coupling interfaces and hidden shared state.
4. Suggest incremental refactors with low migration risk.

Response format:
- Findings (ordered by severity)
- Risks
- Recommended next steps
