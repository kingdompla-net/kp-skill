# KP App Skill

Version: 2.12.0

`kp-app-skill` provides project-local Skills for initializing KP React apps, integrating APIs, optimizing images, reviewing Firebase Hosting previews, and deploying live sites. 모든 KP 앱의 Hosting 배포는 Hosting 전용 Firebase 프로젝트 `kp-app-k00001`을 사용하며, 앱별 DEV·PRD Hosting site와 target을 구분합니다. Firebase SDK runtime project 설정은 앱별 값을 유지합니다.

| Skill | Version | When to use | Purpose |
| --- | --- | --- | --- |
| [`kp-app-init`](skills/kp-app-init/SKILL.md) | `2.10.0` | When connecting a designed React repository to KP for the first time | 기존 화면과 기준 도구 구성을 보존하고 호환되는 도구·Node.js 설정을 기록하며 `kp-app-k00001`의 앱별 Hosting target과 Preview 설정을 추적합니다. |
| [`kp-app-api`](skills/kp-app-api/SKILL.md) | `2.6.1` | Adding a feature or changing a KP API integration in an existing app | Verify the official API contract and connect it to the existing app architecture. |
| [`kp-app-deploy`](skills/kp-app-deploy/SKILL.md) | `2.8.0` | When requesting a default deployment without specifying the environment | DEV를 기본값으로 선택하고 `kp-app-k00001`의 앱별 site·target을 사용하는 Hosting 배포 규칙을 안내합니다. |
| [`kp-app-deploy-dev`](skills/kp-app-deploy-dev/SKILL.md) | `1.1.0` | When directly invoking the DEV deployment Skill | `kp-app-k00001`의 앱별 DEV site에 Hosting만 검증·빌드·배포합니다. |
| [`kp-app-deploy-prd`](skills/kp-app-deploy-prd/SKILL.md) | `1.1.0` | When directly invoking the PRD deployment Skill | `kp-app-k00001`의 앱별 PRD site를 검증·빌드하고, 별도 승인을 받은 뒤에만 live 배포합니다. |
| [`kp-app-preview-release`](skills/kp-app-preview-release/SKILL.md) | `1.1.0` | When a Firebase Hosting preview channel is requested for review | `kp-app-k00001`에서 앱·환경의 Hosting target을 검증해 1일 Preview를 배포하고 승인된 경우에만 임시 OAuth callback을 등록·검증합니다. |
| [`kp-app-preview-delete`](skills/kp-app-preview-delete/SKILL.md) | `1.1.0` | After review is complete or the PR is merged | 해당 배포의 `kp-app-k00001` Preview Channel과 callback만 확인해 정리합니다. |
| [`kp-app-image-optimize`](skills/kp-app-image-optimize/SKILL.md) | `1.0.1` | When optimizing local or Firebase Storage images used by a KP app | Checks display size and quality while preserving consumer paths, download tokens, and Storage metadata. |

초기화 시 `kp-app-k00001`에서 해당 앱의 PRD Hosting site ID를 확인한 뒤 `deploy:prd`를 구성합니다. 앱의 Firebase SDK runtime project 설정은 별도로 유지합니다. `kp-app-init`은 앱 초기화 후 여덟 Skill을 프로젝트·에이전트 경로에 설치합니다. `kp-api-skill`은 자동 설치하지 않습니다. `kp-credential` CLI는 OS 사용자 환경에서 설치·확인합니다.

## Generated repository rules

각 환경은 Firebase Hosting project `kp-app-k00001`을 사용하고 앱별 DEV·PRD site와 target을 구분합니다. Firebase SDK runtime project 설정은 앱별 값으로 유지합니다.

## Install

Any app Skill requires all three `kp-skill-manager` Skills and the complete `kp-credential` Skill set in the same project and agent scope. Skills CLI does not resolve plugin dependencies or install OS npm packages, so the agent installs missing dependency Skills and then the credential CLI in the OS user's environment before starting the task. Tell the user which work requires which Skills and paths before installation, then report the added Skill names, verified paths, and CLI status. The commands below are optional steps to copy Skill files ahead of the agent setup.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
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

This command installs `kp-app-init`. Before initialization, that Skill checks for the required manager and credential sets and installs any missing Skills. After initialization, it installs the other seven `kp-app-skill` Skills into the same project and agent scope. It does not install the seven Skills from `kp-api-skill`.

After setup, the Codex project tree looks like this:

~~~text
<project>/.agents/skills/
├── kp-skill-create/
├── kp-skill-release/
├── kp-skill-install/
├── kp-credential/
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

The commands below can copy all required dependency Skill files ahead of time. If you install only the requested app Skill, the agent installs missing Skills and prepares the OS-user credential CLI before starting the requested task.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-credential/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

Remove unused `--agent` options if needed. Replace `--skill '*'` with a Skill name to install only one Skill. The default scope is the current project. Do not add `--global` or `-g` when the Skills should stay with this repository.

### Update or use a native plugin

The canonical Skills live in the `kp-skill` repository. From the target project root, run `npx skills update` and review changed files while preserving local edits. Claude native plugin installation uses the manager and credential dependencies declared in `.claude-plugin/plugin.json` and is separate from Skills CLI copy installation. Verify native plugin scope with its host; use the Skills CLI steps above when the Skills must stay with one repository.

## Use

Use `kp-app-init` to connect a designed repository for the first time and `kp-app-api` to add or change a KP API integration. A bare `kp-app-deploy` call selects DEV. For fixed invocation, use `/kp-app-deploy-dev` or `/kp-app-deploy-prd` in Claude Code when Skills are installed project-locally, `/kp-app-skill:kp-app-deploy-dev` or `/kp-app-skill:kp-app-deploy-prd` when the plugin is installed, or `$kp-app-deploy-dev` or `$kp-app-deploy-prd` in Codex. PRD requires approval after the production build unless the user explicitly authorizes immediate deployment. Use `kp-app-preview-release` or `kp-app-preview-delete` to create or clean up a preview.
