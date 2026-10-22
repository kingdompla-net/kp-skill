# KP API Skill

Version: 1.0.0

`kp-api-skill` provides project-local Skills for initializing Firebase Functions codebases and for implementing, validating, and deploying the HTTP endpoints and asynchronous workers a KP API needs. It supports both new APIs and existing API repositories.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-api-init`](skills/kp-api-init/SKILL.md) | `1.0.0` | Creating a Firebase Functions codebase and domain router | Inspect existing Firebase configuration and prepare the codebase, router, project guidance, and environment-specific npm scripts. |
| [`kp-api-endpoint`](skills/kp-api-endpoint/SKILL.md) | `1.0.0` | Adding or changing a synchronous HTTP endpoint in an existing router | Implement authentication, input validation, authorization, errors, and tests using the repository's patterns. |
| [`kp-api-worker`](skills/kp-api-worker/SKILL.md) | `1.0.0` | When work needs asynchronous execution, retries, or scheduling | Design Cloud Tasks or Scheduler workers and verify idempotency, retries, and concurrency boundaries. |
| [`kp-api-test-deploy`](skills/kp-api-test-deploy/SKILL.md) | `1.0.0` | Testing outside DEV and PRD | Prefer unit tests and local emulators; use a remote test project only after verifying isolation. |
| [`kp-api-build`](skills/kp-api-build/SKILL.md) | `1.0.0` | Building a requested domain API end to end | Inspect the repository and combine `init`, `endpoint`, `worker`, and isolated testing only as needed. |
| [`kp-api-deploy`](skills/kp-api-deploy/SKILL.md) | `1.0.0` | When the user explicitly requests a DEV or PRD deployment | Verify test evidence, Firebase project, function scope, identity, and permissions before deploying selected functions. |
| [`kp-api-docs`](skills/kp-api-docs/SKILL.md) | `1.0.0` | Documenting a deployed public API in Developer Center | Update the local Center repository, expose only public contracts, and use a one-day preview with callback cleanup. |

Create one Firebase Functions codebase and domain router when a domain is introduced. Add synchronous endpoints to the existing router. Add a worker only when the requested workflow needs independent execution, longer processing, retries, or scheduling. Do not create a new codebase or Cloud Function for every endpoint. Separate HTTP and background resources when their contracts, permissions, or lifecycles justify it.

The QT implementation is evidence for reusable patterns, not a copyable project template. Do not reuse its database, API keys, runtime service accounts, queues, region, secrets, or project IDs. The broader repository analysis and case-specific exceptions are in the [API repository patterns reference](skills/kp-api-init/references/api-project-architecture.md).

## Developer Center API Docs

After deployment is verified, use [`kp-api-docs`](skills/kp-api-docs/SKILL.md) to update the local `kingdom-planet-center` repository with public API contracts. The DEV catalog is published at [Developer Center DEV](https://developer-kpcenter-dev.web.app/api/); the PRD catalog is published at [Developer Center PRD](https://developer-kpcenter.web.app/api). Workers, admin features, and internal server-to-server operations are not added to the public catalog by default.

Review changes in a DEV Hosting Preview Channel before a live release. Set the preview to expire after one day. If sign-in requires a temporary OAuth callback, show the exact callback and target app setting and obtain user approval before adding it. After review, remove the temporary callback and the preview channel. A live DEV or PRD release requires separate user approval and must match the deployed API environment.

## Bootstrap a new API repository

All KP Skills require the complete three-Skill `kp-skill-manager` set in the same project and agent scope. If it is not installed, explain why and where it will be installed, then install the manager first after the user consents. If the user declines, do not install the API Skills.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex --copy --yes
~~~

Run from the target repository root to install the project-local entry Skill:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill kp-api-init -a codex --copy --yes
~~~

Initialization installs all seven Skills into the active agent's project directory. Test the initial router with `$kp-api-test-deploy`; deploying it to DEV or PRD still requires an explicit request and follows `$kp-api-deploy`.

## Use in an existing API repository

Initialization is not required. Install the whole plugin set into the target project:

If the manager is missing from the selected agent path, install all manager Skills first with the same `-a` options, then install the API plugin.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

The default scope is the current project. Leave out `--global` and `-g` when the Skills should stay with this repository. The canonical source is `kp-api-skill/skills/` in `kp-skill`; after an upstream update, run `npx skills update` and review the diff.

## Accounts, access, and secrets

Initialization does not collect passwords or API keys. Keep `AGENTS.local.md` ignored by Git and use it only for non-secret values such as account emails, DEV/PRD project IDs, principal names, observed permission errors, and Keychain or Secret Manager item references. Store passwords, OAuth tokens, API keys, private keys, and service-account JSON in an OS Keychain or organization secret manager, and expose them only to an approved process for the shortest required period.

Membership in a Google Workspace does not automatically grant Cloud Functions deployment access. Report the principal, project, function or codebase, region, and exact denied permission from a real 403 before asking a project administrator for the minimum required access. Do not guess roles or request `Owner` or `Editor` by default. See [`kp-api-deploy` access guidance](skills/kp-api-deploy/references/access-and-secrets.md).

The recommended boundary keeps deploy credentials out of development, build, and test sessions. Use a constrained deployment broker or protected CI runner that does not reveal raw credentials to the agent, separates DEV and PRD identities, and requires human approval for PRD. The access reference explains the options and their limits.
