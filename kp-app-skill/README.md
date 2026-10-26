# KP App Skill

Version: 2.9.0

`kp-app-skill` provides project-local Skills for initializing KP React apps, integrating APIs, optimizing images, reviewing Firebase Hosting previews, and deploying live sites.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | `2.8.1` | When connecting a designed React repository to KP for the first time | Preserves existing screens and baseline tooling, records compatible tools and Node.js settings in `.agents/references/spec.md`, and tracks Firebase Hosting targets, environment-specific Preview system App IDs, URLs, callbacks, and cleanup. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | `2.6.0` | Adding a feature or changing a KP API integration in an existing app | Verify the official API contract and connect it to the existing app architecture. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | `2.7.0` | When requesting a default deployment without specifying the environment | Selects DEV as the default and provides shared Firebase Hosting deployment guidance. |
| [`kp-app-deploy-dev`](skills/kp-app-deploy-dev/SKILL.md) | `1.0.0` | When directly invoking the DEV deployment Skill | Validates, builds, and deploys DEV Hosting only. |
| [`kp-app-deploy-prd`](skills/kp-app-deploy-prd/SKILL.md) | `1.0.0` | When directly invoking the PRD deployment Skill | Validates and builds PRD, then deploys live only after separate approval. |
| [`kp-app-preview-release`](skills/kp-app-preview-release/SKILL.md) | `1.0.1` | When a Firebase Hosting preview channel is requested for review | Verifies the environment and Hosting target, deploys a preview that expires after one day, and registers a temporary OAuth callback only when approved. |
| [`kp-app-preview-delete`](skills/kp-app-preview-delete/SKILL.md) | `1.0.0` | After review is complete or the PR is merged | Verifies and removes only the callback and Firebase Hosting preview channel added for that deployment. |
| [`kp-app-image-optimize`](skills/kp-app-image-optimize/SKILL.md) | `1.0.0` | When optimizing local or Firebase Storage images used by a KP app | Checks display size and quality while preserving consumer paths, download tokens, and Storage metadata. |

Initialization adds `build:dev` and `deploy:dev` scripts to the app's `package.json`; it adds `build:prd` and `deploy:prd` when the PRD Firebase project and Hosting site are confirmed. After initialization, `kp-app-init` installs all eight Skills from `kp-app-skill` into the same project and agent scope. It does not install `kp-api-skill`. Passwords and tokens belong in an OS Keychain or organization secret manager, never in `AGENTS.local.md`.

## Generated repository rules

Each work context gets its own commit after implementation and direct verification finish. Once all contexts pass, the agent creates a PR against the confirmed base and merges it after required checks and reviews. A direct base merge without a PR or a direct push to `main` or `dev` requires explicit user approval immediately before the action. Before committing, verify the active GitHub account and Git author/committer identities belong to the same account, and use an email verified for that account or its GitHub noreply address. Firebase Hosting uses `vite build --mode development` and `hosting:dev` for DEV, and `vite build --mode production` and `hosting:prd` for PRD, with each environment's verified project and site IDs.

## Install

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

Skills CLI does not create a plugin-name directory. For example, Codex installs `.agents/skills/kp-app-init/` and `.agents/skills/kp-app-api/` directly, not `.agents/skills/kp-app-skill/kp-app-init/`. See the [official supported-agent table](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) for other agents.

### Bootstrap a new repository

Run from the target repository root. Existing repositories do not need to run initialization.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill kp-app-init --agent codex --copy --yes
~~~

This command installs only `kp-app-init`. After initialization, that Skill installs the other seven `kp-app-skill` Skills into the same project and agent scope. It does not install the seven Skills from `kp-api-skill`. If the complete manager set is not installed, ask for consent and install it first.

After setup, the Codex project tree looks like this:

~~~text
<project>/.agents/skills/
├── kp-skill-create/
├── kp-skill-release/
├── kp-skill-install/
├── kp-app-init/
├── kp-app-api/
├── kp-app-deploy/
├── kp-app-deploy-dev/
├── kp-app-deploy-prd/
├── kp-app-preview-release/
├── kp-app-preview-delete/
└── kp-app-image-optimize/
~~~

Claude Code uses `.claude/skills/` instead of `.agents/skills/`. Each directory is named after an individual Skill, not its plugin.

### Install the full plugin in an existing repository

Run from the repository root. Repeat `--agent` for each agent that should see the project-local Skills:

If the manager is missing from the selected agent path, install all manager Skills first with the same `--agent` options, then install the app plugin.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

Remove unused `--agent` options if needed. Replace `--skill '*'` with a Skill name to install only one Skill. The default scope is the current project. Do not add `--global` or `-g` when the Skills should stay with this repository.

### Update or use a native plugin

The canonical Skills live in the `kp-skill` repository. From the target project root, run `npx skills update` and review changed files while preserving local edits. Claude native plugin installation uses the manager dependency declared in `.claude-plugin/plugin.json` and is separate from Skills CLI copy installation. Verify native plugin scope with its host; use the Skills CLI steps above when the Skills must stay with one repository.

## Use

Use `kp-app-init` to connect a designed repository for the first time and `kp-app-api` to add or change a KP API integration. A bare `kp-app-deploy` call selects DEV. For fixed invocation, use `/kp-app-deploy-dev` or `/kp-app-deploy-prd` in Claude Code when Skills are installed project-locally, `/kp-app-skill:kp-app-deploy-dev` or `/kp-app-skill:kp-app-deploy-prd` when the plugin is installed, or `$kp-app-deploy-dev` or `$kp-app-deploy-prd` in Codex. PRD requires approval after the production build unless the user explicitly authorizes immediate deployment. Use `kp-app-preview-release` or `kp-app-preview-delete` to create or clean up a preview.
