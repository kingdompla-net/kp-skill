# KP App Skill

Version: 2.4.0

The `kp-app-skill` plugin provides project initialization, API integration, and Firebase Hosting deployment Skills for KP React applications.

| Skill | Purpose |
| --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | Initialize a designed React source repository as a KP API application, preserving its UI and connecting verified auth, environment, and project guidance. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | Validate and deploy the requested DEV or PRD Firebase Hosting environment. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | Check the official KP API contract and integrate the requested feature into an initialized app. |

The initialization Skill includes API and security guidance, IDE setup references, and reusable source templates. During initialization, it adds `build:dev` and `deploy:dev` scripts to the target app's `package.json`; it also adds `build:prd` and `deploy:prd` when the PRD Firebase project and Hosting site are confirmed. At the end of initialization, it installs all three Skills in this plugin to the initialized repository's project-local path for the active agent.

## Generated repository rules

The generated repository rules keep each work context in its own commit as implementation and direct verification finish. After all contexts pass, the agent creates a PR against the confirmed base and merges it after required checks and reviews; a direct branch merge without a PR requires explicit user approval in advance. A direct push to `main` or `dev` also requires explicit user approval immediately before the push. Before committing, the active GitHub account and both Git author and committer identities must belong to the same account; each commit email must be verified for that account or be its GitHub noreply address. Account-specific identity details are kept in the target repository's ignored `AGENTS.local.md`. Firebase Hosting uses `vite build --mode development` and `hosting:dev` for DEV, and `vite build --mode production` and `hosting:prd` for PRD. Each target uses its verified Firebase project and Hosting site IDs. The initialization Skill installs all three plugin Skills and the auxiliary Biome/ESLint setup Skill only in the target repository's agent-specific project directory, not in the user's global Skill directory.

## Install

### 1. Portable Skill for all agents (`npx skills`)

This is the portable installation path. It copies the complete bootstrap Skill directory, including references and templates, to the selected user account for the supported agents:

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-init \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes
~~~

This installs the `kp-app-init` bootstrap Skill for the selected user account. During initialization, it copies `kp-app-init`, `kp-app-deploy`, and `kp-app-api` into the target application's project-local directory for the active agent, without `--global`.

To install for one agent, pass only one value after `--agent`, for example `--agent codex`.

### 2. Native Codex plugin

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
codex plugin marketplace add "$REMOTE_REPO" --ref main
codex plugin add "kp-app-skill@kp-skill"
~~~

Start a new Codex session after installation.

### 3. Native Claude Code plugin

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
claude plugin marketplace add "$REMOTE_REPO"
claude plugin install "kp-app-skill@kp-skill"
~~~

### 4. Native Hermes Agent Skill

~~~bash
RAW_REPO="${RAW_REPO:-https://raw.githubusercontent.com/kingdompla-net/kp-skill/main}"
hermes skills install "$RAW_REPO/kp-app-skill/skills/kp-app-init/SKILL.md" --yes
~~~

The direct URL installs the entry Skill. Use the portable `npx skills` method when the agent needs the complete reference and template directory.

### 5. Native OpenClaw Skill

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
repo_dir="$(mktemp -d)/kp-skill"
git clone --depth 1 "$REMOTE_REPO.git" "$repo_dir"
target="$HOME/.openclaw/skills/kp-app-init"
mkdir -p "$target"
cp -R "$repo_dir/kp-app-skill/skills/kp-app-init/." "$target/"
openclaw skills list
~~~

The portable installation keeps the complete directory for all four agents. Native plugin and Skill installers use each agent's supported installation mechanism.

## Use

Invoke `kp-app-init` when initializing a designed source repository, `kp-app-api` when connecting or updating a KP API feature in an existing app, and `kp-app-deploy` when a user explicitly requests a Firebase Hosting deployment and names DEV or PRD.
