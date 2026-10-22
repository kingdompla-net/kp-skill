# KP App Skill

Version: 2.5.0

`kp-app-skill` provides project-local Skills for initializing KP React applications, integrating KP APIs, and deploying Firebase Hosting.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | `2.5.0` | First connecting a designed React repository as a KP app | Preserve the existing UI, configure verified KP API and Firebase environments, write project guidance, and install all three Skills in the active agent's project directory. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | `2.5.0` | Adding a feature or changing a KP API integration in an existing app | Verify the official API contract and connect it to the existing app architecture. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | `2.5.0` | When the user requests a DEV or PRD Hosting deployment | Verify the target Firebase project and Hosting target, then deploy Hosting only. |

Initialization adds `build:dev` and `deploy:dev` scripts to the app's `package.json`; it adds `build:prd` and `deploy:prd` when the PRD Firebase project and Hosting site are confirmed. Passwords and tokens stay in an OS Keychain or organization secret manager. `AGENTS.local.md` may contain non-secret account and environment references, never credential values.

## Generated repository rules

Each work context gets its own commit after implementation and direct verification finish. Once all contexts pass, the agent creates a PR against the confirmed base and merges it after required checks and reviews. A direct base merge without a PR or a direct push to `main` or `dev` requires explicit user approval immediately before the action. Before committing, verify the active GitHub account and Git author/committer identities belong to the same account, and use an email verified for that account or its GitHub noreply address. Firebase Hosting uses `vite build --mode development` and `hosting:dev` for DEV, and `vite build --mode production` and `hosting:prd` for PRD, with each environment's verified project and site IDs.

## Install

All KP Skills require the complete three-Skill `kp-skill-manager` set in the same project and agent scope. If it is not installed, explain why and where it will be installed, then install the manager first after the user consents. If the user declines, do not install the app Skills.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex --copy --yes
~~~

### Bootstrap a new repository

Run from the target repository root. Existing repositories do not need to run initialization.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill kp-app-init -a codex --copy --yes
~~~

At the end of initialization, `kp-app-init`, `kp-app-api`, and `kp-app-deploy` are installed in the active agent's project-level directory.

### Install the full plugin in an existing repository

Run from the repository root. Repeat `-a` for each agent that should see the project-local Skills:

If the manager is missing from the selected agent path, install all manager Skills first with the same `-a` options, then install the app plugin.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

Remove unused `-a` options if needed. The default scope is the current project. Do not add `--global` or `-g` when the Skills should stay with this repository.

### Update or use a native plugin

The canonical Skills live in the `kp-skill` repository. From the target project root, run `npx skills update` and review changed files while preserving local edits. Native plugin installation follows each agent's supported scope; if it only installs to a user profile, use the project installation above for repository-only availability.

## Use

Invoke `kp-app-init` to connect a designed source repository for the first time, `kp-app-api` to add or change a KP API integration in an existing app, and `kp-app-deploy` when the user requests a Firebase Hosting deployment and names DEV or PRD.
