[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill은 Kingdom Planet 앱을 만들 때 재사용하는 에이전트 중립 지침을 제공합니다. `kp-app-skill` 플러그인은 초기화를 위한 `kp-app-init`, 기존 앱 API 연동을 위한 `kp-app-api`, Firebase Hosting 배포를 위한 `kp-app-deploy`를 제공합니다.

## 제공 플러그인

| 플러그인 | 버전 | 설명 |
| --- | --- | --- |
| [`kp-app-skill`](kp-app-skill/README.ko.md) | `2.4.0` | [`kp-app-init`](kp-app-skill/skills/kp-app-init/SKILL.md), [`kp-app-api`](kp-app-skill/skills/kp-app-api/SKILL.md), [`kp-app-deploy`](kp-app-skill/skills/kp-app-deploy/SKILL.md)를 제공합니다. |

생성된 앱 저장소는 작업 맥락별로 구현과 직접 검증이 끝날 때마다 별도 커밋을 남깁니다. 모든 맥락의 검증 후 확인된 base 대상 PR을 만들고 필수 검사와 리뷰가 끝나면 병합합니다. PR 없이 브랜치를 base에 직접 병합하려면 사전에 사용자의 명시적 승인을 받아야 합니다. `main`/`dev` 직접 push도 직전에 명시적 승인을 받아야 합니다. 활성 GitHub 계정과 Git author·committer identity는 같은 계정이어야 하고, 각 커밋 이메일은 해당 계정에 인증되어 있거나 그 계정의 GitHub noreply 주소여야 합니다. 초기화 시 대상 앱 `package.json`에 `build:dev`와 `deploy:dev`를 추가하고, PRD 프로젝트와 사이트가 확인되면 `build:prd`와 `deploy:prd`도 추가합니다. 초기화 후 세 Skill은 현재 에이전트의 프로젝트 로컬 경로에 설치됩니다. Biome·ESLint 설정용 보조 Skill도 같은 대상 저장소 안에 별도로 설치합니다. 자세한 내용은 [플러그인 안내](kp-app-skill/README.ko.md)를 참고하세요.

## 지원 에이전트에 공통 Skill 설치

Codex, Claude Code, Hermes Agent, OpenClaw의 사용자 계정에 초기화용 `kp-app-init`과 참고 자료·템플릿을 설치합니다.

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-init \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes
~~~

여기서는 초기화에 필요한 `kp-app-init`을 먼저 설치합니다. 앱 초기화 과정에서 플러그인의 모든 Skill이 대상 저장소의 현재 에이전트용 프로젝트 로컬 경로에 복사됩니다. 대상 저장소로 복사할 때는 `--global`을 사용하지 않습니다.

에이전트별 네이티브 설치 방법은 [플러그인 안내](kp-app-skill/README.ko.md)를 확인하세요. 네이티브 플러그인 설치와 공용 Skill 설치는 별도 방식으로 안내합니다.

## 저장소 구조

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

Skill 디렉터리를 기준 소스로 유지합니다. 에이전트별 manifest와 설치 명령은 같은 Skill 디렉터리를 사용하므로 에이전트마다 지침을 따로 관리하지 않습니다.
