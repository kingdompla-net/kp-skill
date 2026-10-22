# KP Skill Manager

Version: 1.0.0

`kp-skill-manager` creates plugins and Skills in this repository, manages their SemVer and Git tags, publishes approved changes, and updates project-local Skill installations.

`kp-skill-manager` is the required companion plugin for every `kp-skill` app and API Skill. When installing another KP Skill, install all three manager Skills in the same project and agent scope. See [KP Skill relationships and authoring rules](skills/kp-skill-install/references/kp-skill-catalog-and-authoring.md) for routing, creation, versioning, and naming conventions.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-skill-create`](skills/kp-skill-create/SKILL.md) | `1.0.0` | Creating a plugin and its first Skill together or adding a Skill to an existing plugin | Inspects the target plugin's conventions and connects the new structure to its canonical documentation, manifests, and version records. |
| [`kp-skill-release`](skills/kp-skill-release/SKILL.md) | `1.0.0` | Improving and releasing a Skill, viewing version history, or republishing earlier Skill content as a new version | Selects SemVer based on the change, synchronizes manifests and READMEs, and follows the approved release path. |
| [`kp-skill-install`](skills/kp-skill-install/SKILL.md) | `1.0.0` | Updating KP Skills in the current repository or a specifically requested user scope | Verifies installation sources and scope, updates selected or all KP Skills, and checks the installed file versions. |

## Project-local installation

When the user requests `kp-skill-manager`, install all three Skills. When the manager is required to install another KP Skill, explain its purpose and the current project and agent scope, then ask for consent. After consent, run the command from the target repository root.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
~~~

Repeat `--agent` to install for multiple agents. Do not use `--global` or `-g` for a project-only installation.

## Version and release rules

The canonical Skill version is `metadata.version` in `SKILL.md`. A plugin version is stored in its manifest and repeated in that plugin's READMEs and the repository marketplace catalog. Skill tables show each Skill's own canonical version. SemVer and tag rules are in [versioning, releases, and content republishing](skills/kp-skill-release/references/versioning-and-rollback.md).

A GitHub tag alone does not update every agent marketplace or installed Skill. The source ref, plugin metadata, and each agent's update mechanism must be handled separately. See [marketplace and local installation updates](skills/kp-skill-install/references/marketplace-updates.md) for provider-specific behavior.

## Account and PR policy

Before a release, verify that the active GitHub account matches the Git author and committer. Even when the KP Skill manager ([bwlee-dix](https://github.com/bwlee-dix)) can bypass a ruleset, follow the repository workflow: create and merge a PR before release. Manager access does not replace explicit approval for direct pushes, merges, or tag publication. Use the PR route when authenticated with another account.

## Routing

- Use `kp-skill-create` to create a plugin with its entry Skill or add a Skill to a named plugin.
- Use `kp-skill-release` to improve and release a Skill, view its version history, or republish earlier content under a higher version.
- Use `kp-skill-install` to update KP Skills already installed in a project or an explicitly named global scope.

The default installation target is the current project. Change global Skill directories or unrelated Skills only when the user names the exact scope.
