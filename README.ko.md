[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill은 Kingdom Planet 프로젝트에서 재사용하는 에이전트 중립 지침을 제공합니다. `kp-app-skill`은 React 앱 초기화·API 연동·Firebase Hosting을, `kp-api-skill`은 Firebase Functions 코드베이스 초기화·endpoint·worker·격리 테스트·배포·API 문서 반영을, `kp-skill-manager`는 Skill 생성·버전 관리·배포·설치 업데이트를 다룹니다.

## 제공 플러그인

| 플러그인 | 버전 | 설명 |
| --- | --- | --- |
| [`kp-app-skill`](kp-app-skill/README.ko.md) | `2.5.0` | [`kp-app-init`](kp-app-skill/skills/kp-app-init/SKILL.md), [`kp-app-api`](kp-app-skill/skills/kp-app-api/SKILL.md), [`kp-app-deploy`](kp-app-skill/skills/kp-app-deploy/SKILL.md)를 제공합니다. |
| [`kp-api-skill`](kp-api-skill/README.ko.md) | `1.0.0` | [`kp-api-init`](kp-api-skill/skills/kp-api-init/SKILL.md), [`kp-api-endpoint`](kp-api-skill/skills/kp-api-endpoint/SKILL.md), [`kp-api-worker`](kp-api-skill/skills/kp-api-worker/SKILL.md), [`kp-api-test-deploy`](kp-api-skill/skills/kp-api-test-deploy/SKILL.md), [`kp-api-build`](kp-api-skill/skills/kp-api-build/SKILL.md), [`kp-api-deploy`](kp-api-skill/skills/kp-api-deploy/SKILL.md), [`kp-api-docs`](kp-api-skill/skills/kp-api-docs/SKILL.md)를 제공합니다. |
| [`kp-skill-manager`](kp-skill-manager/README.ko.md) | `1.0.0` | [`kp-skill-create`](kp-skill-manager/skills/kp-skill-create/SKILL.md), [`kp-skill-release`](kp-skill-manager/skills/kp-skill-release/SKILL.md), [`kp-skill-install`](kp-skill-manager/skills/kp-skill-install/SKILL.md)을 제공합니다. |

새 저장소를 초기화하지 않아도 기존 앱·API 저장소에 해당 플러그인의 전체 Skill 묶음을 프로젝트 로컬로 설치할 수 있습니다. 역할과 설치 방법은 [앱 플러그인 안내](kp-app-skill/README.ko.md), [API 플러그인 안내](kp-api-skill/README.ko.md), [Skill 관리자 안내](kp-skill-manager/README.ko.md)에서 확인해 주세요.

## 모든 KP Skill의 공통 설치 조건

`kp-skill`의 앱 또는 API Skill을 설치하기 전, 같은 프로젝트·에이전트 경로에 `kp-skill-manager` 플러그인의 세 Skill 전체를 설치합니다. manager가 없으면 필요한 이유와 설치 경로를 설명하고 사용자 동의를 받은 뒤 아래 명령을 실행합니다. 동의를 거절하면 대상 KP Skill을 설치하지 않습니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

`npx skills add` 명령은 대상 저장소 루트에서 실행하며 기본 설치 범위는 현재 프로젝트입니다. Codex 프로젝트는 `.agents/skills/<skill-name>/`, Claude Code 프로젝트는 `.claude/skills/<skill-name>/`에 Skill을 둡니다. `--global`/`-g`는 사용자 전역 설치를 요청할 때만 사용합니다. Skills CLI는 플러그인 이름으로 중첩 폴더를 만들지 않으므로 `.agents/skills/kp-app-skill/kp-app-init/` 대신 `.agents/skills/kp-app-init/`에 설치됩니다. 사용자 전역 경로와 다른 에이전트의 프로젝트 경로는 [공식 지원 에이전트 표](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)를 확인해 주세요.

## 기존 저장소에 프로젝트 로컬 설치

명령은 대상 저장소 루트에서 실행합니다. 아래 예시는 앱 Skill 전체를 Codex, Claude Code, Hermes Agent, OpenClaw의 프로젝트 로컬 경로에 복사합니다. 사용하지 않는 agent는 명령에서 제외할 수 있습니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

기존 API 저장소에서는 API 플러그인 전체를 같은 방식으로 설치합니다.

~~~bash
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-api-skill/skills \
  --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

새 앱이나 API codebase에서는 먼저 manager 전체를 설치한 뒤 해당 플러그인의 초기화 Skill 하나로 시작할 수 있습니다. `kp-app-init`은 초기화가 끝나면 `kp-app-skill`의 나머지 두 Skill만 같은 프로젝트·에이전트 경로에 설치하며 `kp-api-skill`은 설치하지 않습니다. `kp-api-init`은 `kp-api-skill`의 나머지 여섯 Skill만 설치하며 `kp-app-skill`은 설치하지 않습니다. 이 Skill 묶음 확장은 초기화 Skill을 실행한 뒤 일어납니다. 기존 저장소는 재초기화하지 않고 필요한 플러그인의 전체 묶음이나 지명한 Skill을 직접 설치할 수 있습니다. Claude native plugin은 Skills CLI 복사 설치와 별도이며 설치 범위는 각 agent 호스트에서 확인해 주세요.

## 저장소 구조

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

각 플러그인의 `skills/`가 정본입니다. 각 agent 프로젝트 경로에는 정본 파일을 설치하므로 agent별 지침을 따로 관리하지 않습니다. 루트 `AGENTS.md`는 이 저장소의 Skill과 문서 작성 규칙을 정하고, 초기화 Skill의 `assets/templates/` 아래 `AGENTS.md`는 새 앱/API 저장소에 복사되는 템플릿입니다. 이 저장소에서 새로 만들거나 수정하는 한국어 문서는 존댓말로 작성합니다.
