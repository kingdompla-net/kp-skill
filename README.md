[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill packages reusable, agent-neutral guidance for building Kingdom Planet applications. The canonical Skill and its references live under `plugins/kp-app-start-skill/skills/kp-app-start-skill/`.

## Available plugins

| Plugin | Version | Description |
| --- | --- | --- |
| [`kp-app-start-skill`](plugins/kp-app-start-skill/skills/kp-app-start-skill/SKILL.md) | `1.1.0` | Initialize a designed React source repository as a KP API application. |

## Install the portable Skill for all supported agents

This installs the same Skill, references, and templates for Codex, Claude Code, Hermes Agent, and OpenClaw:

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-start-skill \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes --full-depth
~~~

For agent-specific native installation, follow the instructions in [the plugin guide](plugins/kp-app-start-skill/README.md). Native installation methods are documented separately from the portable Skill installer.

## Repository structure

~~~text
kp-skill/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── kp-app-start-skill/
│       ├── .claude-plugin/plugin.json
│       ├── README.md
│       ├── README.ko.md
│       └── skills/kp-app-start-skill/
│           ├── SKILL.md
│           ├── agents/openai.yaml
│           ├── assets/templates/
│           │   ├── .agents/references/{commit-rule,pr-rule}.md
│           │   └── .references/PULL_REQUEST_TEMPLATE.md
│           └── references/
├── README.md
└── README.ko.md
~~~

The Skill directory is the canonical source. Agent-specific manifests and installation commands package that same directory without maintaining separate instructions for each agent.
