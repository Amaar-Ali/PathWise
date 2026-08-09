# Security Policy

## Supported versions

Security fixes target the latest code on the default branch (`master`). Older snapshots are not maintained separately.

## Reporting a vulnerability

**Do not open a public GitHub issue for security problems.**

Email **amaaralisyed2011@gmail.com** with:

- Description of the issue and impact
- Steps to reproduce (or a proof-of-concept)
- Affected area if known (auth, API routes, billing webhooks, client storage, etc.)
- Whether you plan to disclose publicly, and preferred timeline

## Response

This is a small project. Expect a best-effort acknowledgment within a few days. Fixes ship when a clear mitigation is ready; complex issues may take longer. We will keep the conversation private until a fix is available or we agree on disclosure.

## Scope

In scope:

- PathWise application code in this repository
- Authentication / session handling as implemented here
- Server routes and webhook handlers in this repo
- Misconfigurations clearly caused by project defaults documented here

Out of scope (unless they expose a PathWise-specific bug):

- Third-party services (Firebase, Groq, Paddle, hosting providers) — report those to the vendor
- Denial-of-service / volumetric attacks
- Social engineering or physical security
- Issues that require already-compromised accounts or leaked secrets outside PathWise control

## Safe harbor

If you report in good faith, avoid privacy harm, and do not disrupt production beyond what is needed to demonstrate the issue, we will not pursue legal action for that research.
