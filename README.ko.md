[EN](README.md) | [한국어](README.ko.md)

# KP Skill

KP Skill은 Kingdom Planet 앱을 만들 때 재사용하는 에이전트 중립 지침을 제공합니다. 기준 Skill과 참고 자료는 `plugins/kp-app-start-skill/skills/kp-app-start-skill/`에 있습니다.

## 제공 플러그인

| 플러그인 | 버전 | 설명 |
| --- | --- | --- |
| [`kp-app-start-skill`](plugins/kp-app-start-skill/skills/kp-app-start-skill/SKILL.md) | `1.1.0` | 화면 설계가 끝난 React 소스를 KP API 앱으로 초기화합니다. |

## 지원 에이전트에 공통 Skill 설치

Codex, Claude Code, Hermes Agent, OpenClaw에서 같은 Skill 본문과 참고 자료·템플릿을 사용하도록 설치합니다.

~~~bash
REMOTE_REPO="${REMOTE_REPO:-https://github.com/kingdompla-net/kp-skill}"
npx skills add "$REMOTE_REPO" --skill kp-app-start-skill \
  --agent codex claude-code hermes-agent openclaw --global --copy --yes --full-depth
~~~

에이전트별 네이티브 설치 방법은 [플러그인 안내](plugins/kp-app-start-skill/README.ko.md)를 확인하세요. 네이티브 플러그인 설치와 공용 Skill 설치는 별도 방식으로 안내합니다.

## 저장소 구조

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

Skill 디렉터리를 기준 소스로 유지합니다. 에이전트별 manifest와 설치 명령은 같은 Skill 디렉터리를 사용하므로 에이전트마다 지침을 따로 관리하지 않습니다.
