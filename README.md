[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill packages reusable, agent-neutral guidance for building Kingdom Planet applications. The `kp-app-skill` plugin provides `kp-app-init` for app initialization, `kp-app-api` for API integration in existing apps, and `kp-app-deploy` for Firebase Hosting deployments.

## Available plugins

| Plugin | Version | Description |
| --- | --- | --- |
| [`kp-app-skill`](kp-app-skill/README.md) | `2.4.0` | [`kp-app-init`](kp-app-skill/skills/kp-app-init/SKILL.md), [`kp-app-api`](kp-app-skill/skills/kp-app-api/SKILL.md), and [`kp-app-deploy`](kp-app-skill/skills/kp-app-deploy/SKILL.md). |

Generated app repositories keep each work context in a separate commit as implementation and direct verification finish. After all contexts pass, the agent creates a PR against the confirmed base and merges it after required checks and reviews; a direct branch merge without a PR requires explicit user approval in advance. Direct pushes to `main` or `dev` also require explicit user approval immediately before the push. The active GitHub account and the Git author and committer identities must belong to the same account; each commit email must be verified for that account or be its GitHub noreply address. Initialization adds `build:dev` and `deploy:dev` to the app's `package.json`, and adds `build:prd` and `deploy:prd` when the PRD project and site are confirmed. Initialization installs the three plugin Skills into the initialized repository's project-local directory for the active agent. The auxiliary Biome/ESLint setup Skill is also installed only in that project-local directory. See the [plugin guide](kp-app-skill/README.md).

## Install the portable Skill for all supported agents

This installs the bootstrap `kp-app-init` Skill, its references, and templates for Codex, Claude Code, Hermes Agent, and OpenClaw in the selected user account:

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-init \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes
~~~

This is the bootstrap installation for `kp-app-init`. When it initializes an app, it installs every Skill in the plugin into the target repository's project-local path for the active agent, without `--global`.

For agent-specific native installation, follow the instructions in [the plugin guide](kp-app-skill/README.md). Native installation methods are documented separately from the portable Skill installer.

## Repository structure

~~~text
kp-skill/
├── .claude-plugin/
│   └── marketplace.json
├── kp-app-skill/
│   ├── .claude-plugin/plugin.json
│   ├── README.md
│   ├── README.ko.md
│   └── skills/
│       ├── kp-app-init/
│       │   ├── SKILL.md
│       │   ├── agents/openai.yaml
│       │   ├── assets/templates/
│       │   │   ├── .agents/references/{commit-rule,pr-rule}.md
│       │   │   ├── .references/PULL_REQUEST_TEMPLATE.md
│       │   │   ├── firebase.json
│       │   │   └── .firebaserc.example
│       │   └── references/
│       ├── kp-app-deploy/
│       │   ├── SKILL.md
│       │   ├── agents/openai.yaml
│       │   └── references/firebase-hosting.md
│       └── kp-app-api/
│           ├── SKILL.md
│           └── agents/openai.yaml
├── README.md
└── README.ko.md
~~~

The Skill directory is the canonical source. Agent-specific manifests and installation commands package that same directory without maintaining separate instructions for each agent.
