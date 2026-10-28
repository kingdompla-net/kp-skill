[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill provides agent-neutral guidance reusable across Kingdom Planet projects. `kp-app-skill` covers React app initialization, API integration, image optimization, Firebase Hosting previews, and live deployment; `kp-api-skill` covers Firebase Functions initialization, endpoints, workers, isolated testing, deployment, and API documentation; `kp-skill-manager` covers Skill creation, versioning, publishing, and project-local updates; `kp-credential` manages local API credential use.

## Local API credential helper

[`kp-credential`](kp-credential/README.md) stores API credentials in macOS Keychain or Windows Credential Manager and lets Skills use them through an approved origin/path/method-scoped HTTP request. During app/API Skill installation, its CLI is also installed or updated in the current OS user's global npm environment and checked for bare-command access. Node.js 20 or later and npm must be available. It has no command to print a stored value, does not inject credentials into arbitrary commands, and does not replace browser login flows.

## Available plugins

| Plugin | Version | Description |
| --- | --- | --- |
| [`kp-app-skill`](kp-app-skill/README.md) | `2.11.0` | Includes [`kp-app-init`](kp-app-skill/skills/kp-app-init/SKILL.md), [`kp-app-api`](kp-app-skill/skills/kp-app-api/SKILL.md), [`kp-app-deploy`](kp-app-skill/skills/kp-app-deploy/SKILL.md), [`kp-app-deploy-dev`](kp-app-skill/skills/kp-app-deploy-dev/SKILL.md), [`kp-app-deploy-prd`](kp-app-skill/skills/kp-app-deploy-prd/SKILL.md), [`kp-app-preview-release`](kp-app-skill/skills/kp-app-preview-release/SKILL.md), [`kp-app-preview-delete`](kp-app-skill/skills/kp-app-preview-delete/SKILL.md), and [`kp-app-image-optimize`](kp-app-skill/skills/kp-app-image-optimize/SKILL.md). |
| [`kp-api-skill`](kp-api-skill/README.md) | `1.2.0` | [`kp-api-init`](kp-api-skill/skills/kp-api-init/SKILL.md), [`kp-api-endpoint`](kp-api-skill/skills/kp-api-endpoint/SKILL.md), [`kp-api-worker`](kp-api-skill/skills/kp-api-worker/SKILL.md), [`kp-api-test-deploy`](kp-api-skill/skills/kp-api-test-deploy/SKILL.md), [`kp-api-build`](kp-api-skill/skills/kp-api-build/SKILL.md), [`kp-api-deploy`](kp-api-skill/skills/kp-api-deploy/SKILL.md), and [`kp-api-docs`](kp-api-skill/skills/kp-api-docs/SKILL.md). |
| [`kp-skill-manager`](kp-skill-manager/README.md) | `1.2.0` | [`kp-skill-create`](kp-skill-manager/skills/kp-skill-create/SKILL.md), [`kp-skill-release`](kp-skill-manager/skills/kp-skill-release/SKILL.md), and [`kp-skill-install`](kp-skill-manager/skills/kp-skill-install/SKILL.md). |
| [`kp-credential`](kp-credential/README.md) | `1.1.0` | Includes [`kp-credential`](kp-credential/skills/kp-credential/SKILL.md). |

Install a plugin's complete Skill set directly into an existing repository; initialization is not required. For a new app or API codebase, the relevant init Skill can also install the whole plugin locally at the end of setup. Use the [app guide](kp-app-skill/README.ko.md), [API guide](kp-api-skill/README.ko.md), or [Skill Manager guide](kp-skill-manager/README.ko.md) for skill routing and install commands.

## Required companion plugins for app/API Skills

When using any Skill from `kp-app-skill` or `kp-api-skill`, the complete `kp-skill-manager` and `kp-credential` Skill sets are required in the same project and agent scope. Native plugins use manifest dependencies. Skills CLI copy installation does not resolve them automatically, so before the task starts, install any missing dependency Skills in manager → credential order. When the agent installs `kp-credential`, it also installs and verifies the CLI in the OS user's global npm environment. Tell the user which work requires which Skills and project paths before installing, then report the added Skill names, verified paths, and CLI status. A bare `npx skills add` run outside the agent copies Skill files only; the agent completes CLI setup before credential work:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

Run `npx skills add` from the target repository root; its default scope is the current project. Codex project Skills go in `.agents/skills/<skill-name>/` and Claude Code project Skills go in `.claude/skills/<skill-name>/`. Use `--global`/`-g` only when a user-wide installation is requested. Skills CLI does not add a parent directory named after the plugin: it installs `.agents/skills/kp-app-init/`, not `.agents/skills/kp-app-skill/kp-app-init/`. See the [official supported-agent table](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) for user-wide paths and other agents' project paths.

## Install in a repository for supported agents

Run the command from the target repository root. This example installs all app Skills for Codex, Claude Code, Hermes Agent, and OpenClaw in project-level agent directories:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

For an existing API repository, install the API Skill set the same way:

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

For a new app or API repository, start with that plugin's init Skill. If either required dependency set is missing, the init Skill installs it before setup, installs and verifies the credential CLI in the OS user's environment, and reports the added Skills and paths. After initialization, `kp-app-init` installs the other seven Skills in `kp-app-skill` into the same project and agent scope; it does not install `kp-api-skill`. `kp-api-init` installs only the other six Skills in `kp-api-skill`; it does not install `kp-app-skill`. This plugin-specific expansion happens when the init Skill runs. Existing repositories can install a full plugin set or a named Skill without reinitialization. Claude native plugin installation is separate from Skills CLI copy installation; its manifests declare both required dependencies.

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
├── kp-credential/
│   ├── .claude-plugin/plugin.json
│   ├── README.md
│   ├── README.ko.md
│   └── skills/kp-credential/
│       ├── SKILL.md
│       ├── CLI.md
│       ├── package.json
│       ├── package-lock.json
│       ├── bin/kp-credential.mjs
│       ├── src/
│       └── agents/openai.yaml
├── README.md
└── README.ko.md
~~~

Each plugin's `skills/` directory is the canonical source. The same files can be copied into one or more project-level agent directories or installed through an agent's native plugin mechanism.
