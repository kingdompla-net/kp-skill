# KP App Start Skill

Version: 1.1.0

Initialize an existing, designed React source repository as a KP API application. The agent-neutral Skill preserves the supplied design, configures KP authentication and environment settings, and creates project guidance for the resulting source structure.

The canonical Skill is in `skills/kp-app-start-skill/`. It includes its API and security guidance, IDE setup reference, and reusable source templates.

## Install

### 1. Portable Skill for all agents (`npx skills`)

This is the shared installation path. It copies the full Skill directory, including references and templates, to the supported agents:

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-start-skill \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes --full-depth
~~~

To install for one agent, pass only one value after `--agent`, for example `--agent codex`.

### 2. Native Codex plugin

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
codex plugin marketplace add "$REMOTE_REPO" --ref main
codex plugin add "kp-app-start-skill@kp-skill"
~~~

Start a new Codex session after installation.

### 3. Native Claude Code plugin

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
claude plugin marketplace add "$REMOTE_REPO"
claude plugin install "kp-app-start-skill@kp-skill"
~~~

### 4. Native Hermes Agent Skill

~~~bash
RAW_REPO="${RAW_REPO:-https://raw.githubusercontent.com/kingdompla-net/kp-skill/main}"
hermes skills install "$RAW_REPO/plugins/kp-app-start-skill/skills/kp-app-start-skill/SKILL.md" --yes
~~~

The direct URL installs the entry Skill. Use the portable `npx skills` method when the agent needs the complete reference and template directory.

### 5. Native OpenClaw Skill

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
repo_dir="$(mktemp -d)/kp-skill"
git clone --depth 1 "$REMOTE_REPO.git" "$repo_dir"
target="$HOME/.openclaw/skills/kp-app-start-skill"
mkdir -p "$target"
cp -R "$repo_dir/plugins/kp-app-start-skill/skills/kp-app-start-skill/." "$target/"
openclaw skills list
~~~

The portable installation keeps the complete directory for all four agents. Native plugin and Skill installers use each agent's supported installation mechanism.

## Use

Invoke `kp-app-start-skill` through the current agent's Skill interface when a designed source repository needs to be initialized as a KP API application. The Skill asks for missing project-specific information, checks the correct KP Developer Center documentation, and keeps account details in the target repository's ignored `AGENTS.local.md`.
