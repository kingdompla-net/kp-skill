# KP 앱 플러그인 Skill 프로젝트 로컬 설치

초기화가 끝나면 `kp-app-skill` 플러그인의 모든 Skill을 초기화 대상 저장소의 현재 에이전트용 프로젝트 경로에 설치합니다. 기존 앱 저장소에서도 초기화 없이 전체 Skill 묶음을 프로젝트 로컬로 직접 설치할 수 있습니다.

## 설치 전 확인

1. 현재 작업 디렉터리가 초기화 대상 저장소의 루트인지 확인합니다.
2. 설치 대상 에이전트를 확인합니다. `npx skills`에서 현재 지원하는 프로젝트 경로를 사용합니다. Codex는 `.agents/skills/`, Claude Code는 `.claude/skills/`, Hermes Agent와 OpenClaw는 도구별 프로젝트 경로를 확인합니다. 경로 표는 [Skills CLI 에이전트 안내](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)를 따릅니다.
3. 현재 실행 중인 `kp-app-init`의 버전과 원격 `kp-app-skill` 플러그인의 버전, 각 Skill의 `metadata.version`이 일치하는지 확인합니다. 원격 기본 브랜치 버전이 다르거나 버전을 확인할 수 없으면 섞어 설치하지 말고 같은 버전의 원격 참조를 확보합니다.
4. 대상 에이전트 경로에서 기존 `kp-app-skill` Skill 디렉터리와 수정 내용을 확인합니다. 기존 파일을 자동으로 덮어쓰지 않습니다. 이미 설치된 Skill은 버전과 내용을 대조하고, 누락된 Skill만 설치합니다. 업데이트가 필요한 기존 파일에 사용자 수정이 있으면 변경 사항을 보존하고 병합 전에 사용자에게 확인합니다.

## 필수 관리자 Skill

KP Skill을 하나라도 프로젝트에 설치할 때는 `kp-skill-manager` 플러그인의 Skill 전체도 같은 프로젝트와 에이전트 경로에 있어야 합니다. 없는 경우 manager가 Skill 생성·릴리스·설치 갱신과 관계표를 제공한다는 점을 사용자에게 설명하고, 설치 동의를 받은 뒤에만 먼저 설치합니다. 사용자가 거부하면 앱 Skill 설치를 진행하지 않습니다. `--yes`는 동의를 받은 뒤에만 사용합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills --skill '*' --agent codex --copy --yes
~~~

## 설치

현재 에이전트 경로에 플러그인의 전체 Skill을 설치하려면 다음 명령을 실행합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills --skill '*' --agent codex --copy --yes
~~~

여러 에이전트 경로에 설치하려면 `--agent`를 반복합니다. 아래는 네 에이전트에 모두 설치하는 예입니다.

manager 설치 명령에서 같은 `--agent` 목록을 사용해 먼저 manager 전체를 설치한 뒤 앱 Skill을 설치합니다.

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-skill-manager/skills --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

~~~sh
npx skills add https://github.com/kingdompla-net/kp-skill/tree/main/kp-app-skill/skills --skill '*' --agent codex --agent claude-code --agent hermes-agent --agent openclaw --copy --yes
~~~

`npx skills`의 기본 범위는 현재 프로젝트이므로 `--global`이나 `-g`를 추가하지 않습니다. 설치 전에 기존 Skill을 비교하고 로컬 수정이 있으면 자동으로 덮어쓰지 말고 변경을 보존해 병합합니다. 기존 코드베이스에는 `kp-app-init` 없이도 전체 플러그인을 설치할 수 있습니다.

## 설치 후 확인

- `kp-skill-manager` 세 Skill과 현재 앱 플러그인 버전의 모든 Skill이 현재 에이전트의 프로젝트 로컬 경로에 있는지 확인합니다.
- 각 Skill 디렉터리에 유효한 `SKILL.md`가 있고 각 `metadata.version`이 해당 플러그인 버전과 맞는지 확인합니다.
- `kp-app-init`은 초기화·구조 연결 작업에, `kp-app-api`는 새 KP API 기능 연동·기존 연동 수정에, `kp-app-deploy`는 사용자가 환경을 명시해 요청한 DEV 또는 PRD Firebase Hosting 배포에 연결합니다.
- 별도 `biome-eslint-ide-config-skill`은 이 플러그인에 포함되지 않습니다. 해당 Skill은 [agent-ide.md](agent-ide.md)의 절차에 따라 같은 대상 저장소의 프로젝트 로컬 경로에 따로 설치합니다.
