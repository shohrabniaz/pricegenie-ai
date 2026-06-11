# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.3.x   | Yes       |
| < 0.3   | No        |

## Reporting a vulnerability

**Do not** open public GitHub issues for security vulnerabilities.

Email **shohrab.niaz@gmail.com** with:

- Description of the issue
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

You should receive a response within **5 business days**.

## Automated scanning

This repository uses:

- **npm audit** (dependency vulnerabilities)
- **GitHub CodeQL** (static analysis)
- **Trivy** (container image scanning)
- **Dependabot** (dependency update PRs)

## Security best practices for contributors

- Never commit `.env`, API keys, or tokens
- Use `.env.example` for documented optional variables only
- Run `npm run audit` before submitting changes
