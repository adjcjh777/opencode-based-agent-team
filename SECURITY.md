# Security Policy

## Supported Versions

Security updates are provided for the latest mainline branch and the latest published package version.

## Reporting a Vulnerability

If you discover a security issue, please do **not** open a public issue first.

Preferred process:

1. Email the maintainer with a clear report (impact, reproduction steps, and any proof-of-concept).
2. Include affected version(s) and environment details.
3. Allow time for triage and coordinated disclosure.

When a fix is available, the project will publish:

- a patched commit/tag,
- release notes describing mitigation,
- and a public advisory when appropriate.

## Hardening Checklist for Operators

- Use `doctor` before deployment.
- Restrict risky tools with `tools.permissions` (default deny + explicit allowlist).
- Keep dependencies current (Dependabot enabled in this repository).
- Rotate API keys regularly and avoid committing secrets.

