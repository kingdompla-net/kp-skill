# KP Skill Manager

Version: 1.0.1

`kp-skill-manager` creates plugins and Skills in this repository, manages their SemVer and Git tags, publishes approved changes, and updates project-local Skill installations.

`kp-skill-manager` is the required companion plugin for every `kp-skill` app and API Skill. When installing another KP Skill, install all three manager Skills in the same project and agent scope. See [KP Skill relationships and authoring rules](skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md) for routing, creation, versioning, and naming conventions.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-skill-create`](skills/kp-skill-create/SKILL.md) | `1.0.1` | Creating a project-local Skill draft or explicitly promoting one to the canonical repository | Creates drafts in the current project by default and follows the account-specific PR path for promotion. |
| [`kp-skill-release`](skills/kp-skill-release/SKILL.md) | `1.0.1` | Improving and releasing a Skill, viewing version history, or republishing earlier Skill content as a new version | Selects SemVer, synchronizes manifests and READMEs, and follows the account-specific PR and merge path. |
| [`kp-skill-install`](skills/kp-skill-install/SKILL.md) | `1.0.1` | Updating KP Skills in the current repository or a specifically requested user scope | Verifies installation sources and scope, updates selected or all KP Skills, and checks the installed file versions. |

## Project-local installation

When the user requests `kp-skill-manager`, install all three Skills. When the manager is required to install another KP Skill, explain its purpose and the current project and agent scope, then ask for consent. After consent, run the command from the target repository root.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
~~~

`npx skills add` uses the current working directory as the project scope. Run it from the target repository root and leave out `--global` or `-g` for a repository-only installation.

| Agent | Project path | User-wide path (`--global`/`-g`) |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |

For Codex, the manager Skills are installed directly as `.agents/skills/kp-skill-create/`, `.agents/skills/kp-skill-release/`, and `.agents/skills/kp-skill-install/`. Claude Code uses the same Skill-named folders directly under `.claude/skills/`. There is no parent folder named after the plugin. See the [official supported-agent table](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) for other project paths.

Skills CLI copy installation does not resolve plugin dependencies. If a required manager set is missing while installing an app or API Skill, explain the reason and path and ask for consent, then install the three manager Skills first. Claude native plugin installation follows the dependency in `.claude-plugin/plugin.json` and is separate from Skills CLI installation. Use a user-wide path only when that scope is explicitly requested.

## Version and release rules

The canonical Skill version is `metadata.version` in `SKILL.md`. A plugin version is stored in its manifest and repeated in that plugin's READMEs and the repository marketplace catalog. Skill tables show each Skill's own canonical version. SemVer and tag rules are in [versioning, releases, and content republishing](skills/kp-skill-release/references/versioning-and-rollback.md).

A GitHub tag alone does not update every agent marketplace or installed Skill. The source ref, plugin metadata, and each agent's update mechanism must be handled separately. See [marketplace and local installation updates](skills/kp-skill-install/references/marketplace-updates.md) for provider-specific behavior.

## Account and PR policy

Before a release, verify that the active GitHub account matches the Git author and committer. When the account is the KP Skill manager ([bwlee-dix](https://github.com/bwlee-dix)), update the local canonical checkout and use a PR; merge it without another user approval after required checks pass. Use an administrator bypass only for a review-only requirement, never for failed checks. Other accounts work from a local clone of their fork, open a PR to upstream, and wait for the manager to merge it. Neither path pushes directly to the default branch. Tags, GitHub Releases, and marketplace publishing require an explicit release request.

## Routing

- Use `kp-skill-create` to create a plugin with its entry Skill or add a Skill to a named plugin.
- Use `kp-skill-release` to improve and release a Skill, view its version history, or republish earlier content under a higher version.
- Use `kp-skill-install` to update KP Skills already installed in a project or an explicitly named global scope.

The default installation target is the current project. Change global Skill directories or unrelated Skills only when the user names the exact scope.
