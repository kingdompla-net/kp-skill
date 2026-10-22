[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill packages reusable, agent-neutral guidance for Kingdom Planet applications. The `kp-app-skill` plugin supports React app initialization, API integration, and Firebase Hosting. The `kp-api-skill` plugin supports Firebase Functions codebase initialization, synchronous endpoints, background workers, isolated testing, scoped deployment, and Developer Center API documentation. The `kp-skill-manager` plugin creates, versions, publishes, republishes earlier Skill content as a new version, and updates project-local KP Skill installations.

## Available plugins

| Plugin | Version | Description |
| --- | --- | --- |
| [`kp-app-skill`](kp-app-skill/README.md) | `2.5.0` | [`kp-app-init`](kp-app-skill/skills/kp-app-init/SKILL.md), [`kp-app-api`](kp-app-skill/skills/kp-app-api/SKILL.md), and [`kp-app-deploy`](kp-app-skill/skills/kp-app-deploy/SKILL.md). |
| [`kp-api-skill`](kp-api-skill/README.md) | `1.0.0` | [`kp-api-init`](kp-api-skill/skills/kp-api-init/SKILL.md), [`kp-api-endpoint`](kp-api-skill/skills/kp-api-endpoint/SKILL.md), [`kp-api-worker`](kp-api-skill/skills/kp-api-worker/SKILL.md), [`kp-api-test-deploy`](kp-api-skill/skills/kp-api-test-deploy/SKILL.md), [`kp-api-build`](kp-api-skill/skills/kp-api-build/SKILL.md), [`kp-api-deploy`](kp-api-skill/skills/kp-api-deploy/SKILL.md), and [`kp-api-docs`](kp-api-skill/skills/kp-api-docs/SKILL.md). |
| [`kp-skill-manager`](kp-skill-manager/README.md) | `1.0.0` | [`kp-skill-create`](kp-skill-manager/skills/kp-skill-create/SKILL.md), [`kp-skill-release`](kp-skill-manager/skills/kp-skill-release/SKILL.md), and [`kp-skill-install`](kp-skill-manager/skills/kp-skill-install/SKILL.md). |

Install a plugin's complete Skill set directly into an existing repository; initialization is not required. For a new app or API codebase, the relevant init Skill can also install the whole plugin locally at the end of setup. Use the [app guide](kp-app-skill/README.ko.md), [API guide](kp-api-skill/README.ko.md), or [Skill Manager guide](kp-skill-manager/README.ko.md) for skill routing and install commands.

## Companion manager plugin requirement

Before installing an app or API Skill from `kp-skill`, install all three Skills from `kp-skill-manager` in the same project and agent scope. If the manager is missing, explain why it is required and where it will be installed, then get the user's consent before running the command below. If the user declines, do not install the requested KP Skill.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

## Install in a repository for supported agents

Run the command from the target repository root. This example installs all app Skills for Codex, Claude Code, Hermes Agent, and OpenClaw in project-level agent directories:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

For an existing API repository, install the API Skill set the same way:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' -a codex -a claude-code -a hermes-agent -a openclaw --copy --yes
~~~

The CLI's default scope is the current project. Do not add `--global` or `-g` when Skills should stay with this repository. See the [app guide](kp-app-skill/README.ko.md) and [API guide](kp-api-skill/README.ko.md) for bootstrap-only and update workflows.

## Repository structure

~~~text
kp-skill/
├── AGENTS.md
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
│       │   │   ├── .agents/references/cloud-access.md
│       │   │   ├── .references/PULL_REQUEST_TEMPLATE.md
│       │   │   ├── AGENTS.local.md
│       │   │   ├── firebase.json
│       │   │   └── .firebaserc.example
│       │   └── references/
│       ├── kp-app-deploy/
│       │   ├── SKILL.md
│       │   ├── agents/openai.yaml
│       │   └── references/{firebase-hosting,access-and-secrets}.md
│       └── kp-app-api/
│           ├── SKILL.md
│           └── agents/openai.yaml
├── kp-api-skill/
│   ├── .claude-plugin/plugin.json
│   ├── README.md
│   ├── README.ko.md
│   └── skills/
│       ├── kp-api-init/
│       ├── kp-api-endpoint/
│       ├── kp-api-worker/
│       ├── kp-api-test-deploy/
│       ├── kp-api-build/
│       ├── kp-api-deploy/
│       └── kp-api-docs/
├── kp-skill-manager/
│   ├── .claude-plugin/plugin.json
│   ├── README.md
│   ├── README.ko.md
│   └── skills/
│       ├── kp-skill-create/
│       ├── kp-skill-release/
│       └── kp-skill-install/
├── README.md
└── README.ko.md
~~~

Each plugin's `skills/` directory is the canonical source. The same files can be copied into one or more project-level agent directories or installed through an agent's native plugin mechanism.
