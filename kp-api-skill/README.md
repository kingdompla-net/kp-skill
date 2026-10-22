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

Every KP app or API Skill requires the complete three-Skill `kp-skill-manager` set in the same project and agent scope. If the manager is missing, explain why it is required and where it will be installed, then ask for consent before installing it. Install and verify the manager first; if the user declines, do not install the requested KP Skill.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
~~~

Run the following commands from the target repository root. `npx skills add` uses the current working directory as the project scope by default. Leave out `--global` or `-g` for a repository-only installation.

| Agent | Project path | User-wide path (`--global`/`-g`) |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |

Skills CLI does not create a plugin-name directory. Codex installs each Skill directly under a path such as `.agents/skills/kp-api-init/`, not `.agents/skills/kp-api-skill/kp-api-init/`. See the [official supported-agent table](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) for other agents.

Run from the target repository root to install the project-local entry Skill:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill kp-api-init --agent codex --copy --yes
~~~

This command installs only `kp-api-init`. When initialization finishes, that Skill installs the other six Skills in `kp-api-skill` into the same project and agent scope. It does not install `kp-app-skill`. A Codex project tree looks like this:

~~~text
<project>/.agents/skills/
├── kp-skill-create/
├── kp-skill-release/
├── kp-skill-install/
├── kp-api-init/
├── kp-api-endpoint/
├── kp-api-worker/
├── kp-api-test-deploy/
├── kp-api-build/
├── kp-api-deploy/
└── kp-api-docs/
~~~

Claude Code uses `.claude/skills/` instead of `.agents/skills/`. Test the initial router with `$kp-api-test-deploy`; deploying it to DEV or PRD still requires an explicit request and follows `$kp-api-deploy`.

## Use in an existing API repository

Initialization is not required. Install the whole plugin set into the target project:

If the manager is missing from the selected agent path, install all manager Skills first with the same `--agent` options, then install the API plugin.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

Keep only the `--agent` options you use. To install a single API Skill, replace `--skill '*'` with its name. The default scope is the current project. Leave out `--global` and `-g` when the Skills should stay with this repository. The canonical source is `kp-api-skill/skills/` in `kp-skill`; after an upstream update, run `npx skills update` and review the diff.

Claude native plugin installation uses the manager dependency declared in `.claude-plugin/plugin.json` and is separate from Skills CLI copy installation. Verify native plugin scope with its host; use the Skills CLI steps above when the Skills must stay with one repository.

## Accounts, access, and secrets

Initialization does not collect passwords or API keys. Keep `AGENTS.local.md` ignored by Git and use it only for non-secret values such as account emails, DEV/PRD project IDs, principal names, observed permission errors, and Keychain or Secret Manager item references. Store passwords, OAuth tokens, API keys, private keys, and service-account JSON in an OS Keychain or organization secret manager, and expose them only to an approved process for the shortest required period.

Membership in a Google Workspace does not automatically grant Cloud Functions deployment access. Report the principal, project, function or codebase, region, and exact denied permission from a real 403 before asking a project administrator for the minimum required access. Do not guess roles or request `Owner` or `Editor` by default. See [`kp-api-deploy` access guidance](skills/kp-api-deploy/references/access-and-secrets.md).

The recommended boundary keeps deploy credentials out of development, build, and test sessions. Use a constrained deployment broker or protected CI runner that does not reveal raw credentials to the agent, separates DEV and PRD identities, and requires human approval for PRD. The access reference explains the options and their limits.
